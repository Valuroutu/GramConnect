import { useState } from "react";
import { getContract } from "../utils/contract";

export default function ComplaintForm() {
  const [form, setForm] = useState({});

  const submit = async () => {
    if (!form.description || !form.state) {
      alert("Fill required fields");
      return;
    }

    const contract = await getContract();

    const tx = await contract.fileComplaint(
      form.description,
      form.category || "General",
      "ipfsHash",
      form.state.trim(),
      form.district.trim() || "",
      form.mandal.trim() || "",
      form.village.trim() || ""
    );

    await tx.wait();
    alert("Submitted ✅");
  };

  return (
    <div className="card">
      <h3>File Complaint</h3>

      <input className="input" placeholder="Description"
        onChange={(e)=>setForm({...form,description:e.target.value})}/>

      <input className="input" placeholder="Category"
        onChange={(e)=>setForm({...form,category:e.target.value})}/>

      <input className="input" placeholder="State"
        onChange={(e)=>setForm({...form,state:e.target.value})}/>

      <input className="input" placeholder="District"
        onChange={(e)=>setForm({...form,district:e.target.value})}/>

      <input className="input" placeholder="Mandal"
        onChange={(e)=>setForm({...form,mandal:e.target.value})}/>

      <input className="input" placeholder="Village"
        onChange={(e)=>setForm({...form,village:e.target.value})}/>

      <button className="button" onClick={submit}>
        Submit
      </button>
    </div>
  );
}