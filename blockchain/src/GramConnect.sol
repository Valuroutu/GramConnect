// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GramConnect {

    address public admin;

    enum Status { Pending, InProgress, Resolved }
    enum OfficerLevel { State, District, Mandal, Village }

    struct Complaint {
        uint256 id;
        string description;
        string category;
        string ipfsHash;

        string state;
        string district;
        string mandal;
        string village;

        address citizen;
        uint256 timestamp;
        Status status;
    }

    struct Officer {
        bool isActive;
        OfficerLevel level;
        string state;
        string district;
        string mandal;
        string village;
    }

    uint256 public complaintCount;

    mapping(uint256 => Complaint) public complaints;
    mapping(address => Officer) public officers;

    event ComplaintFiled(uint256 id, address citizen);
    event ComplaintStatusUpdated(uint256 id, Status status);
    event OfficerAdded(address officer, OfficerLevel level);
    event OfficerRemoved(address officer);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyOfficer() {
        require(officers[msg.sender].isActive, "Not officer");
        _;
    }

    constructor(address _admin) {
        admin = _admin;
    }

    // ================= 🔥 STRING FIX =================

    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);

        for (uint i = 0; i < bStr.length; i++) {
            if (bStr[i] >= 0x41 && bStr[i] <= 0x5A) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }

        return string(bLower);
    }

    function _compare(string memory a, string memory b)
        internal
        pure
        returns (bool)
    {
        return keccak256(bytes(_toLower(a))) == keccak256(bytes(_toLower(b)));
    }

    function canControl(OfficerLevel superior, OfficerLevel junior)
        internal
        pure
        returns (bool)
    {
        return uint(superior) < uint(junior);
    }

    // ================= OFFICER =================

    function addOfficer(
        address _officer,
        OfficerLevel _level,
        string memory _state,
        string memory _district,
        string memory _mandal,
        string memory _village
    ) public {

        require(_officer != address(0), "Invalid address");

        if (msg.sender == admin) {
            require(_level == OfficerLevel.State, "Admin only adds State");
        } else {
            Officer memory sender = officers[msg.sender];

            require(sender.isActive, "Not officer");
            require(canControl(sender.level, _level), "Invalid hierarchy");

            if (sender.level == OfficerLevel.State) {
                require(_compare(sender.state, _state), "State mismatch");
            }

            if (sender.level == OfficerLevel.District) {
                require(
                    _compare(sender.state, _state) &&
                    _compare(sender.district, _district),
                    "District mismatch"
                );
            }

            if (sender.level == OfficerLevel.Mandal) {
                require(
                    _compare(sender.state, _state) &&
                    _compare(sender.district, _district) &&
                    _compare(sender.mandal, _mandal),
                    "Mandal mismatch"
                );
            }
        }

        officers[_officer] = Officer({
            isActive: true,
            level: _level,
            state: _state,
            district: _district,
            mandal: _mandal,
            village: _village
        });

        emit OfficerAdded(_officer, _level);
    }

    function removeOfficer(address _officer) public {

        Officer memory target = officers[_officer];
        require(target.isActive, "Not officer");

        if (msg.sender != admin) {
            Officer memory sender = officers[msg.sender];

            require(sender.isActive, "Not officer");
            require(canControl(sender.level, target.level), "Cannot remove");

            if (sender.level == OfficerLevel.State) {
                require(_compare(sender.state, target.state), "State mismatch");
            }

            if (sender.level == OfficerLevel.District) {
                require(
                    _compare(sender.state, target.state) &&
                    _compare(sender.district, target.district),
                    "District mismatch"
                );
            }

            if (sender.level == OfficerLevel.Mandal) {
                require(
                    _compare(sender.state, target.state) &&
                    _compare(sender.district, target.district) &&
                    _compare(sender.mandal, target.mandal),
                    "Mandal mismatch"
                );
            }
        }

        officers[_officer].isActive = false;

        emit OfficerRemoved(_officer);
    }

    // ================= COMPLAINT =================

    function fileComplaint(
        string memory _description,
        string memory _category,
        string memory _ipfsHash,
        string memory _state,
        string memory _district,
        string memory _mandal,
        string memory _village
    ) public {

        complaintCount++;

        complaints[complaintCount] = Complaint({
            id: complaintCount,
            description: _description,
            category: _category,
            ipfsHash: _ipfsHash,
            state: _state,
            district: _district,
            mandal: _mandal,
            village: _village,
            citizen: msg.sender,
            timestamp: block.timestamp,
            status: Status.Pending
        });

        emit ComplaintFiled(complaintCount, msg.sender);
    }

    // ================= AUTH =================

    function isAuthorized(address _officer, uint256 _id)
        internal
        view
        returns (bool)
    {
        Officer memory o = officers[_officer];
        Complaint memory c = complaints[_id];

        if (o.level == OfficerLevel.State) {
            return _compare(o.state, c.state);
        }

        if (o.level == OfficerLevel.District) {
            return
                _compare(o.state, c.state) &&
                _compare(o.district, c.district);
        }

        if (o.level == OfficerLevel.Mandal) {
            return
                _compare(o.state, c.state) &&
                _compare(o.district, c.district) &&
                _compare(o.mandal, c.mandal);
        }

        if (o.level == OfficerLevel.Village) {
            return
                _compare(o.state, c.state) &&
                _compare(o.district, c.district) &&
                _compare(o.mandal, c.mandal) &&
                _compare(o.village, c.village);
        }

        return false;
    }

    // ================= STATUS =================

    function updateComplaintStatus(uint256 _id, Status _status)
        public
        onlyOfficer
    {
        require(_id > 0 && _id <= complaintCount, "Invalid complaint");
        require(isAuthorized(msg.sender, _id), "Not authorized");

        complaints[_id].status = _status;

        emit ComplaintStatusUpdated(_id, _status);
    }

    // ================= GETTERS =================

    function getComplaint(uint256 _id)
        public
        view
        returns (Complaint memory)
    {
        return complaints[_id];
    }

    function getTotalComplaints() public view returns (uint256) {
        return complaintCount;
    }
}