import { useState } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { QRCodeSVG } from "qrcode.react";
import { HiCube, HiQrCode, HiCheckCircle } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function ManufacturerPanel() {
  const { contract, roles, account } = useBlockchain();
  const [form, setForm] = useState({ serialNumber: "", modelName: "", factoryId: "", batchNumber: "" });
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMint = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first");
    if (!roles.isManufacturer) return toast.error("You don't have Manufacturer role");
    const { serialNumber, modelName, factoryId, batchNumber } = form;
    if (!serialNumber || !modelName || !factoryId || !batchNumber) return toast.error("Fill all fields");

    setMinting(true);
    try {
      const tx = await contract.mintProduct(serialNumber, modelName, factoryId, batchNumber, "");
      toast.loading("Mining transaction...", { id: "mint" });
      const receipt = await tx.wait();

      // Parse event to get tokenId
      let tokenId = "N/A";
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
          if (parsed && parsed.name === "ProductMinted") {
            tokenId = parsed.args.tokenId.toString();
            break;
          }
        } catch (_) { /* skip */ }
      }

      setMintResult({ tokenId, serialNumber, modelName, factoryId, batchNumber, txHash: receipt.hash });
      setForm({ serialNumber: "", modelName: "", factoryId: "", batchNumber: "" });
      toast.success(`Product minted! Token #${tokenId}`, { id: "mint" });
    } catch (err) {
      console.error(err);
      const msg = err?.reason || err?.message?.slice(0, 80) || "Minting failed";
      toast.error(msg, { id: "mint" });
    } finally {
      setMinting(false);
    }
  };

  const qrValue = mintResult
    ? `authchain:verify:${mintResult.tokenId}:${mintResult.serialNumber}`
    : "";

  return (
    <div className="panel-grid">
      {/* Mint Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "var(--accent-cyan-dim)", color: "var(--accent-cyan)" }}>
            <HiCube />
          </div>
          <div>
            <h2 className="card-title">Mint Product</h2>
            <p className="card-subtitle">Register a new product on the blockchain</p>
          </div>
        </div>

        <form onSubmit={handleMint} id="mint-product-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input className="form-input" name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="e.g. RLX-2026-001" id="input-serial" />
            </div>
            <div className="form-group">
              <label className="form-label">Model Name</label>
              <input className="form-input" name="modelName" value={form.modelName} onChange={handleChange} placeholder="e.g. Rolex Submariner" id="input-model" />
            </div>
            <div className="form-group">
              <label className="form-label">Factory ID</label>
              <input className="form-input" name="factoryId" value={form.factoryId} onChange={handleChange} placeholder="e.g. FAC-CH-42" id="input-factory" />
            </div>
            <div className="form-group">
              <label className="form-label">Batch Number</label>
              <input className="form-input" name="batchNumber" value={form.batchNumber} onChange={handleChange} placeholder="e.g. BATCH-2026-Q1" id="input-batch" />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={minting || !roles.isManufacturer} id="btn-mint" style={{ width: "100%", marginTop: "0.5rem" }}>
            {minting ? <><span className="btn-loader" /> Minting...</> : <><HiCube /> Mint Product NFT</>}
          </button>

          {!roles.isManufacturer && account && (
            <p style={{ color: "var(--accent-red)", fontSize: "0.82rem", marginTop: "0.75rem", textAlign: "center" }}>
              ⚠ Your wallet doesn't have the Manufacturer role
            </p>
          )}
        </form>
      </div>

      {/* Mint Result + QR */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}>
            <HiQrCode />
          </div>
          <div>
            <h2 className="card-title">Product QR Code</h2>
            <p className="card-subtitle">Generated after successful minting</p>
          </div>
        </div>

        {mintResult ? (
          <div className="fade-in">
            <div className="verified-badge authentic" style={{ marginBottom: "1.25rem", justifyContent: "center", width: "100%" }}>
              <HiCheckCircle /> Product Minted Successfully
            </div>

            <div className="info-row">
              <span className="info-label">Token ID</span>
              <span className="info-value">#{mintResult.tokenId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Serial</span>
              <span className="info-value">{mintResult.serialNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Model</span>
              <span className="info-value">{mintResult.modelName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tx Hash</span>
              <span className="info-value" style={{ fontSize: "0.72rem" }}>{mintResult.txHash}</span>
            </div>

            <div className="qr-container">
              <QRCodeSVG value={qrValue} size={160} level="H" bgColor="#ffffff" fgColor="#0a0e27" />
              <span style={{ color: "#0a0e27", fontSize: "0.7rem", fontWeight: 600 }}>Scan to verify</span>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p>Mint a product to generate its QR code</p>
          </div>
        )}
      </div>
    </div>
  );
}
