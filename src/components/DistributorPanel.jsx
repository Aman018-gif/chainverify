import { useState } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { HiTruck, HiArrowsRightLeft } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function DistributorPanel() {
  const { contract, roles, account } = useBlockchain();
  const [tokenId, setTokenId] = useState("");
  const [recipientAddr, setRecipientAddr] = useState("");
  const [transferType, setTransferType] = useState("seller");
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [lookupId, setLookupId] = useState("");

  const handleLookup = async () => {
    if (!contract || !lookupId) return;
    try {
      const p = await contract.getProduct(lookupId);
      const owner = await contract.ownerOf(lookupId);
      setProductInfo({ ...p, currentOwner: owner });
      toast.success("Product found");
    } catch (err) {
      toast.error("Product not found");
      setProductInfo(null);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first");
    if (!tokenId || !recipientAddr) return toast.error("Fill all fields");

    setLoading(true);
    try {
      let tx;
      if (transferType === "seller") {
        tx = await contract.transferToSeller(tokenId, recipientAddr);
      } else {
        tx = await contract.sellToConsumer(tokenId, recipientAddr);
      }
      toast.loading("Mining...", { id: "transfer" });
      await tx.wait();
      toast.success(`Transferred to ${transferType}!`, { id: "transfer" });
      setTokenId("");
      setRecipientAddr("");
    } catch (err) {
      const msg = err?.reason || err?.message?.slice(0, 80) || "Transfer failed";
      toast.error(msg, { id: "transfer" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-grid">
      {/* Transfer Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "var(--accent-purple-dim)", color: "var(--accent-purple)" }}>
            <HiArrowsRightLeft />
          </div>
          <div>
            <h2 className="card-title">Transfer Product</h2>
            <p className="card-subtitle">Send product to seller or consumer</p>
          </div>
        </div>

        <form onSubmit={handleTransfer} id="transfer-form">
          <div className="form-group">
            <label className="form-label">Transfer To</label>
            <select className="form-input" value={transferType} onChange={(e) => setTransferType(e.target.value)} id="select-transfer-type" style={{ cursor: "pointer" }}>
              <option value="seller">Authorised Seller</option>
              <option value="consumer">End Consumer</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Token ID</label>
            <input className="form-input" value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="e.g. 0" id="input-transfer-token" />
          </div>
          <div className="form-group">
            <label className="form-label">Recipient Address</label>
            <input className="form-input" value={recipientAddr} onChange={(e) => setRecipientAddr(e.target.value)} placeholder="0x..." id="input-transfer-recipient" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} id="btn-transfer" style={{ width: "100%" }}>
            {loading ? <><span className="btn-loader" /> Transferring...</> : <><HiTruck /> Transfer Custody</>}
          </button>
          {!roles.isDistributor && account && (
            <p style={{ color: "var(--accent-orange)", fontSize: "0.82rem", marginTop: "0.75rem", textAlign: "center" }}>
              ⚠ You need the Distributor role to transfer
            </p>
          )}
        </form>
      </div>

      {/* Lookup */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "var(--accent-purple-dim)", color: "var(--accent-purple)" }}>
            <HiTruck />
          </div>
          <div>
            <h2 className="card-title">Lookup Product</h2>
            <p className="card-subtitle">Check product details by token ID</p>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Token ID</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input className="form-input" value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="e.g. 0" id="input-lookup-token" />
            <button className="btn btn-outline" type="button" onClick={handleLookup} id="btn-lookup">Lookup</button>
          </div>
        </div>

        {productInfo ? (
          <div className="fade-in" style={{ marginTop: "1rem" }}>
            <div className="info-row"><span className="info-label">Serial</span><span className="info-value">{productInfo.serialNumber}</span></div>
            <div className="info-row"><span className="info-label">Model</span><span className="info-value">{productInfo.modelName}</span></div>
            <div className="info-row"><span className="info-label">Factory</span><span className="info-value">{productInfo.factoryId}</span></div>
            <div className="info-row"><span className="info-label">Batch</span><span className="info-value">{productInfo.batchNumber}</span></div>
            <div className="info-row"><span className="info-label">Owner</span><span className="info-value" style={{ fontSize: "0.75rem" }}>{productInfo.currentOwner}</span></div>
          </div>
        ) : (
          <div className="empty-state"><div className="empty-state-icon">🔍</div><p>Enter a token ID to look up</p></div>
        )}
      </div>
    </div>
  );
}
