import { useState } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { HiShoppingBag, HiUserPlus } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function SellerPanel() {
  const { contract, roles, account } = useBlockchain();
  const [tokenId, setTokenId] = useState("");
  const [consumerAddr, setConsumerAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentSales, setRecentSales] = useState([]);

  const handleSell = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first");
    if (!roles.isSeller && !roles.isDistributor) return toast.error("You need Seller or Distributor role");
    if (!tokenId || !consumerAddr) return toast.error("Fill all fields");

    setLoading(true);
    try {
      const tx = await contract.sellToConsumer(tokenId, consumerAddr);
      toast.loading("Mining...", { id: "sell" });
      const receipt = await tx.wait();
      toast.success("Product sold to consumer!", { id: "sell" });

      setRecentSales((prev) => [
        { tokenId, consumer: consumerAddr, txHash: receipt.hash, time: new Date().toLocaleString() },
        ...prev.slice(0, 4),
      ]);
      setTokenId("");
      setConsumerAddr("");
    } catch (err) {
      const msg = err?.reason || err?.message?.slice(0, 80) || "Sale failed";
      toast.error(msg, { id: "sell" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-grid">
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "rgba(255,140,66,0.12)", color: "#ff8c42" }}>
            <HiUserPlus />
          </div>
          <div>
            <h2 className="card-title">Sell to Consumer</h2>
            <p className="card-subtitle">Transfer product ownership to end buyer</p>
          </div>
        </div>
        <form onSubmit={handleSell} id="sell-form">
          <div className="form-group">
            <label className="form-label">Token ID</label>
            <input className="form-input" value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="e.g. 0" id="input-sell-token" />
          </div>
          <div className="form-group">
            <label className="form-label">Consumer Wallet Address</label>
            <input className="form-input" value={consumerAddr} onChange={(e) => setConsumerAddr(e.target.value)} placeholder="0x..." id="input-consumer-addr" />
          </div>
          <button className="btn btn-success" type="submit" disabled={loading} id="btn-sell" style={{ width: "100%" }}>
            {loading ? <><span className="btn-loader" /> Processing...</> : <><HiShoppingBag /> Sell Product</>}
          </button>
          {!roles.isSeller && !roles.isDistributor && account && (
            <p style={{ color: "var(--accent-orange)", fontSize: "0.82rem", marginTop: "0.75rem", textAlign: "center" }}>⚠ You need the Seller or Distributor role</p>
          )}
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "rgba(255,140,66,0.12)", color: "#ff8c42" }}>
            <HiShoppingBag />
          </div>
          <div>
            <h2 className="card-title">Recent Sales</h2>
            <p className="card-subtitle">Products sold in this session</p>
          </div>
        </div>
        {recentSales.length > 0 ? (
          recentSales.map((sale, i) => (
            <div key={i} className="info-row fade-in" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span className="badge badge-success">Token #{sale.tokenId}</span>
                <span style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>{sale.time}</span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontFamily: "'Space Grotesk', monospace" }}>
                → {sale.consumer.slice(0, 10)}...{sale.consumer.slice(-6)}
              </span>
            </div>
          ))
        ) : (
          <div className="empty-state"><div className="empty-state-icon">🛒</div><p>No sales yet this session</p></div>
        )}
      </div>
    </div>
  );
}
