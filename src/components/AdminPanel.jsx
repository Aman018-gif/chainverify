import { useState } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { HiCog6Tooth, HiUserPlus, HiTrash } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function AdminPanel() {
  const { contract, roles } = useBlockchain();
  const [addr, setAddr] = useState("");
  const [role, setRole] = useState("distributor");
  const [loading, setLoading] = useState(false);
  const [revokeAddr, setRevokeAddr] = useState("");
  const [revokeRole, setRevokeRole] = useState("distributor");
  const [revoking, setRevoking] = useState(false);

  const roleMap = {
    manufacturer: { fn: "addManufacturer", label: "Manufacturer" },
    distributor: { fn: "addDistributor", label: "Distributor" },
    seller: { fn: "addSeller", label: "Seller" },
  };

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first");
    if (!roles.isAdmin) return toast.error("Admin role required");
    if (!addr) return toast.error("Enter an address");

    setLoading(true);
    try {
      const tx = await contract[roleMap[role].fn](addr);
      toast.loading("Mining...", { id: "grant" });
      await tx.wait();
      toast.success(`${roleMap[role].label} role granted!`, { id: "grant" });
      setAddr("");
    } catch (err) {
      toast.error(err?.reason || "Failed to grant role", { id: "grant" });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first");
    if (!roles.isAdmin) return toast.error("Admin role required");
    if (!revokeAddr) return toast.error("Enter an address");

    setRevoking(true);
    try {
      const roleBytes = await contract[`${revokeRole.toUpperCase()}_ROLE`]();
      const tx = await contract.removeRole(roleBytes, revokeAddr);
      toast.loading("Mining...", { id: "revoke" });
      await tx.wait();
      toast.success(`Role revoked!`, { id: "revoke" });
      setRevokeAddr("");
    } catch (err) {
      toast.error(err?.reason || "Failed to revoke role", { id: "revoke" });
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="panel-grid">
      {/* Grant Role */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>
            <HiUserPlus />
          </div>
          <div>
            <h2 className="card-title">Grant Role</h2>
            <p className="card-subtitle">Add authorised participants to the supply chain</p>
          </div>
        </div>

        <form onSubmit={handleGrant} id="grant-role-form">
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)} id="select-grant-role" style={{ cursor: "pointer" }}>
              <option value="manufacturer">Manufacturer</option>
              <option value="distributor">Distributor</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Wallet Address</label>
            <input className="form-input" value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="0x..." id="input-grant-addr" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading || !roles.isAdmin} id="btn-grant" style={{ width: "100%" }}>
            {loading ? <><span className="btn-loader" /> Granting...</> : <><HiUserPlus /> Grant Role</>}
          </button>
          {!roles.isAdmin && (
            <p style={{ color: "var(--accent-red)", fontSize: "0.82rem", marginTop: "0.75rem", textAlign: "center" }}>⚠ Only the contract deployer (Admin) can manage roles</p>
          )}
        </form>
      </div>

      {/* Revoke Role */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "var(--accent-red-dim)", color: "var(--accent-red)" }}>
            <HiTrash />
          </div>
          <div>
            <h2 className="card-title">Revoke Role</h2>
            <p className="card-subtitle">Remove access from a participant</p>
          </div>
        </div>
        <form onSubmit={handleRevoke} id="revoke-role-form">
          <div className="form-group">
            <label className="form-label">Role to Revoke</label>
            <select className="form-input" value={revokeRole} onChange={(e) => setRevokeRole(e.target.value)} id="select-revoke-role" style={{ cursor: "pointer" }}>
              <option value="MANUFACTURER">Manufacturer</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Wallet Address</label>
            <input className="form-input" value={revokeAddr} onChange={(e) => setRevokeAddr(e.target.value)} placeholder="0x..." id="input-revoke-addr" />
          </div>
          <button className="btn btn-danger" type="submit" disabled={revoking || !roles.isAdmin} id="btn-revoke" style={{ width: "100%" }}>
            {revoking ? <><span className="btn-loader btn-loader-light" /> Revoking...</> : <><HiTrash /> Revoke Role</>}
          </button>
        </form>

        {/* Info box */}
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(59,130,246,0.08)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <h4 style={{ fontSize: "0.82rem", color: "#3b82f6", marginBottom: "0.5rem" }}>💡 Role Summary</h4>
          <ul style={{ fontSize: "0.78rem", color: "var(--text-secondary)", paddingLeft: "1rem", lineHeight: 1.8 }}>
            <li><strong style={{ color: "#00d4ff" }}>Manufacturer</strong> — Can mint new products</li>
            <li><strong style={{ color: "#a855f7" }}>Distributor</strong> — Can receive & transfer products</li>
            <li><strong style={{ color: "#ff8c42" }}>Seller</strong> — Can sell products to consumers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
