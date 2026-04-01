import "./App.css";
import { useEffect, useState } from "react";
import { getUserRole } from "./utils/getRole";

import AdminPage from "./pages/AdminPage";
import OfficerPage from "./pages/OfficerPage";
import CitizenPage from "./pages/CitizenPage";

function App() {
  const [account, setAccount] = useState("");
  const [user, setUser] = useState(null);

  const connectWallet = async () => {
    try {
      const acc = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(acc[0]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts[0] || "");
      setUser(null);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!account) return;
      const role = await getUserRole(account);
      setUser(role);
    };
    load();
  }, [account]);

  const renderRole = () => {
    if (!user) return "Loading...";

    if (user.role === "admin") return "Admin";

    if (user.role === "citizen") return "Citizen";

    if (user.role === "officer") {
      if (user.level === 0)
        return `State Officer (${user.state})`;
      if (user.level === 1)
        return `District Officer (${user.district})`;
      if (user.level === 2)
        return `Mandal Officer (${user.mandal})`;
      if (user.level === 3)
        return `Village Officer (${user.village})`;
    }

    return "Unknown";
  };

  return (
    <div className="container">

      {!account && (
        <div className="card center">
          <h2>GramConnect</h2>
          <p className="subtitle">Decentralized Complaint System</p>
          <button className="button" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      )}

      {account && (
        <>
          <div className="card header">
            <h2>GramConnect</h2>
            <p><b>Account:</b> {account}</p>
            <p className="role"><b>Role:</b> {renderRole()}</p>
          </div>

          {user?.role === "admin" && <AdminPage />}

          {user?.role === "officer" && (
            <OfficerPage level={user.level} user={user} />
          )}

          {user?.role === "citizen" && <CitizenPage />}
        </>
      )}
    </div>
  );
}

export default App;