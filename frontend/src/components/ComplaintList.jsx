import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";

export default function ComplaintList({ isOfficer, user, account }) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState(null);

  // 🔥 STATUS NAMES
  const statusMap = ["Pending", "In Progress", "Resolved"];

  // 🔥 helpers
  const match = (a, b) =>
    (a || "").toLowerCase().trim() === (b || "").toLowerCase().trim();

  const includes = (a, s) =>
    (a || "").toLowerCase().includes(s);

  // 🔥 LOAD DATA
  const load = async () => {
    if (mode === null) return;

    const contract = await getContract();
    const count = await contract.getTotalComplaints();

    let arr = [];

    for (let i = 1; i <= count; i++) {
      const c = await contract.getComplaint(i);
      arr.push(c);
    }

    // 🔥 DEFAULT MODE
    if (mode === "restricted") {
      if (!isOfficer) {
        arr = arr.filter(
          c => (c.citizen || "").toLowerCase() === account.toLowerCase()
        );
      }

      if (isOfficer && user) {
        if (user.level === 0)
          arr = arr.filter(c => match(c.state, user.state));

        if (user.level === 1)
          arr = arr.filter(c => match(c.district, user.district));

        if (user.level === 2)
          arr = arr.filter(c => match(c.mandal, user.mandal));

        if (user.level === 3)
          arr = arr.filter(c => match(c.village, user.village));
      }
    }

    // 🔥 SEARCH MODE
    if (mode === "all" && search) {
      const s = search.toLowerCase();

      arr = arr.filter(c =>
        includes(c.description, s) ||
        includes(c.category, s) ||
        includes(c.state, s) ||
        includes(c.district, s) ||
        includes(c.mandal, s) ||
        includes(c.village, s)
      );
    }

    setData(arr);
  };

  useEffect(() => {
    load();
  }, [mode, search, user]);

  // 🔥 UPDATE STATUS FUNCTION
  const updateStatus = async (id, status) => {
    try {
      const contract = await getContract();
      const tx = await contract.updateComplaintStatus(id, status);
      await tx.wait();

      alert("Status Updated ✅");
      load();
    } catch (err) {
      console.error(err);
      alert("Error updating status ❌");
    }
  };

  return (
    <div className="card">
      <h3>Complaints</h3>

      {/* 🔥 BUTTONS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <button
          className="button"
          onClick={() => {
            setData([]);
            setSearch("");
            setMode("restricted");
          }}
        >
          {isOfficer ? "My Area" : "My Complaints"}
        </button>

        <button
          className="button resolve-btn"
          onClick={() => {
            setData([]);
            setSearch("");
            setMode("all");
          }}
        >
          Search All
        </button>
      </div>

      {/* 🔥 INITIAL MESSAGE */}
      {mode === null && (
        <p style={{ textAlign: "center" }}>
          Click a button to view complaints
        </p>
      )}

      {/* 🔥 SEARCH INPUT */}
      {mode === "all" && (
        <input
          className="input"
          placeholder="Search (state, district, mandal, village...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* 🔥 DATA */}
      {mode !== null && (
        <>
          {data.length === 0 ? (
            <p>No complaints found</p>
          ) : (
            data.map((c, i) => (
              <div key={i} className="card">
                <p><b>{c.description}</b></p>

                <p>
                  {c.state} - {c.district} - {c.mandal} - {c.village}
                </p>

                <p>
                  Status: {statusMap[Number(c.status)]}
                </p>

                {/* 🔥 OFFICER ACTIONS */}
                {isOfficer && Number(c.status) !== 2 && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

                    <button
                      className="button"
                      onClick={() => updateStatus(c.id, 1)}
                    >
                      In Progress
                    </button>

                    <button
                      className="button resolve-btn"
                      onClick={() => updateStatus(c.id, 2)}
                    >
                      Resolve
                    </button>

                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}