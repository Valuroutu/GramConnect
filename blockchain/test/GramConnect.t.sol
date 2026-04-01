// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/GramConnect.sol";

contract GramConnectTest is Test {

    GramConnect gc;

    address admin = address(1);
    address stateOfficer = address(2);
    address districtOfficer = address(3);
    address mandalOfficer = address(4);
    address villageOfficer = address(5);
    address citizen = address(6);

    function setUp() public {
        vm.prank(admin);
        gc = new GramConnect();
    }

    // 🔥 TEST: Admin adds State Officer
    function testAddStateOfficer() public {
        vm.prank(admin);

        gc.addOfficer(
            stateOfficer,
            GramConnect.OfficerLevel.State,
            "AP",
            "",
            "",
            ""
        );

        (bool isActive,,,,,) = gc.officers(stateOfficer);
        assertTrue(isActive);
    }

    // 🔥 TEST: Hierarchy creation
    function testHierarchyCreation() public {

        // Admin → State
        vm.prank(admin);
        gc.addOfficer(
            stateOfficer,
            GramConnect.OfficerLevel.State,
            "AP",
            "",
            "",
            ""
        );

        // State → District
        vm.prank(stateOfficer);
        gc.addOfficer(
            districtOfficer,
            GramConnect.OfficerLevel.District,
            "AP",
            "Krishna",
            "",
            ""
        );

        // District → Mandal
        vm.prank(districtOfficer);
        gc.addOfficer(
            mandalOfficer,
            GramConnect.OfficerLevel.Mandal,
            "AP",
            "Krishna",
            "Penamaluru",
            ""
        );

        // Mandal → Village
        vm.prank(mandalOfficer);
        gc.addOfficer(
            villageOfficer,
            GramConnect.OfficerLevel.Village,
            "AP",
            "Krishna",
            "Penamaluru",
            "Poranki"
        );

        (bool active,,,,,) = gc.officers(villageOfficer);
        assertTrue(active);
    }

    // 🔥 TEST: Complaint Filing
    function testFileComplaint() public {

        vm.prank(citizen);

        gc.fileComplaint(
            "Road damaged",
            "Road",
            "ipfsHash",
            "AP",
            "Krishna",
            "Penamaluru",
            "Poranki"
        );

        assertEq(gc.getTotalComplaints(), 1);
    }

    // 🔥 TEST: Officer Updates Complaint
    function testUpdateComplaint() public {

        // Setup hierarchy
        vm.prank(admin);
        gc.addOfficer(
            stateOfficer,
            GramConnect.OfficerLevel.State,
            "AP",
            "",
            "",
            ""
        );

        vm.prank(stateOfficer);
        gc.addOfficer(
            districtOfficer,
            GramConnect.OfficerLevel.District,
            "AP",
            "Krishna",
            "",
            ""
        );

        // File complaint
        vm.prank(citizen);
        gc.fileComplaint(
            "Water issue",
            "Water",
            "ipfs",
            "AP",
            "Krishna",
            "Penamaluru",
            "Poranki"
        );

        // District officer updates
        vm.prank(districtOfficer);
        gc.updateComplaintStatus(1, GramConnect.Status.Resolved);

        // ✅ FIX: struct handling
        GramConnect.Complaint memory c = gc.getComplaint(1);

        assertEq(uint(c.status), uint(GramConnect.Status.Resolved));
    }

    // 🔥 TEST: Unauthorized Access
    function testFailUnauthorizedUpdate() public {

        vm.prank(citizen);
        gc.fileComplaint(
            "Electric issue",
            "Electric",
            "ipfs",
            "AP",
            "Krishna",
            "Penamaluru",
            "Poranki"
        );

        // Random user tries to update
        vm.prank(address(999));
        gc.updateComplaintStatus(1, GramConnect.Status.Resolved);
    }

    // 🔥 TEST: Filtering
    function testFilterByDistrict() public {

        vm.prank(citizen);
        gc.fileComplaint(
            "Issue1",
            "Road",
            "ipfs",
            "AP",
            "Krishna",
            "Penamaluru",
            "Poranki"
        );

        vm.prank(citizen);
        gc.fileComplaint(
            "Issue2",
            "Water",
            "ipfs",
            "AP",
            "Guntur",
            "X",
            "Y"
        );

        GramConnect.Complaint[] memory res =
            gc.getComplaintsByDistrict("Krishna");

        assertEq(res.length, 1);
    }
}