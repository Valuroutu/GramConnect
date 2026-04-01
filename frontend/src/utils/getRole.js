import { ethers } from "ethers";
import fullAbi from "../abi/GramConnect.json";  

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export const getUserRole = async (account) => {
  const provider = new ethers.BrowserProvider(window.ethereum);

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    fullAbi.abi,   
    provider
  );

  const admin = await contract.admin();

  if (admin.toLowerCase() === account.toLowerCase()) {
    return { role: "admin" };
  }

  const officer = await contract.officers(account);

  if (officer.isActive) {
    return {
      role: "officer",
      level: Number(officer.level),
      state: officer.state,
      district: officer.district,
      mandal: officer.mandal,
      village: officer.village,
    };
  }

  return { role: "citizen" };
};