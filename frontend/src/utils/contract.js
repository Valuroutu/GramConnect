import { ethers } from "ethers";
import fullAbi from "../abi/GramConnect.json";  

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export const getContract = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    fullAbi.abi,   // ✅ IMPORTANT
    signer
  );
};