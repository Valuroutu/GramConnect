import { useState } from "react";
import { getContract } from "../utils/contract";

export default function AddOfficer({ role, level }) {
  const [form, setForm] = useState({
    address: "",
    level: "",
    state: "",
    district: "",
    mandal: "",
    village: ""
  });

  const add = async () => {

    // 🔥 REQUIRED VALIDATION
    if (!form.address || !form.state) {
      alert("Fill required fields ❌");
      return;
    }

    let lvl;

    // 🔥 ADMIN → STATE ONLY
    if (role === "admin") {
      lvl = 0;
    } else {

      // 🔥 LEVEL VALIDATION (MAIN FIX)
      if (!form.level) {
        alert("Please select level ❌");
        return;
      }

      lvl = parseInt(form.level);

      if (isNaN(lvl)) {
        alert("Invalid level ❌");
        return;
      }
    }

    console.log("LEVEL DEBUG:", form.level, lvl); // 🔥 DEBUG

    try {
      const contract = await getContract();

      const tx = await contract.addOfficer(
        form.address,
        lvl,
        form.state.trim().toLowerCase(),
        (form.district || "").trim().toLowerCase(),
        (form.mandal || "").trim().toLowerCase(),
        (form.village || "").trim().toLowerCase()
      );

      await tx.wait();

      alert("Officer Added ✅");

      // 🔥 RESET FORM
      setForm({
        address: "",
        level: "",
        state: "",
        district: "",
        mandal: "",
        village: ""
      });

    } catch (err) {
      console.error("ERROR:", err);
      alert(err.reason || "Transaction Failed ❌");
    }
  };

  return (
    <div className="card">
      <h3>Add Officer</h3>

      {/* ADDRESS */}
      <input
        className="input"
        placeholder="Address"
        value={form.address}
        onChange={(e)=>setForm({...form, address: e.target.value})}
      />

      {/* LEVEL */}
      {role === "admin" ? (
        <select className="input" disabled>
          <option value="0">State Officer</option>
        </select>
      ) : (
        <select
          className="input"
          value={form.level}
          onChange={(e)=>setForm({...form, level: e.target.value})}
        >
          <option value="">Select Level</option>

          {level === 0 && <option value="1">District Officer</option>}
          {level === 1 && <option value="2">Mandal Officer</option>}
          {level === 2 && <option value="3">Village Officer</option>}
        </select>
      )}

      {/* LOCATION */}
      <input
        className="input"
        placeholder="State"
        value={form.state}
        onChange={(e)=>setForm({...form, state: e.target.value})}
      />

      <input
        className="input"
        placeholder="District"
        value={form.district}
        onChange={(e)=>setForm({...form, district: e.target.value})}
      />

      <input
        className="input"
        placeholder="Mandal"
        value={form.mandal}
        onChange={(e)=>setForm({...form, mandal: e.target.value})}
      />

      <input
        className="input"
        placeholder="Village"
        value={form.village}
        onChange={(e)=>setForm({...form, village: e.target.value})}
      />

      {/* BUTTON */}
      <button className="button" onClick={add}>
        Add Officer
      </button>
    </div>
  );
}