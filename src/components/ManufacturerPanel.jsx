<<<<<<< HEAD
import { useState } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { QRCodeSVG } from "qrcode.react";
import { HiCube, HiQrCode, HiCheckCircle } from "react-icons/hi2";
=======
import { useState, useEffect } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { QRCodeSVG } from "qrcode.react";
import { HiCube, HiQrCode, HiCheckCircle, HiMagnifyingGlass } from "react-icons/hi2";
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
import toast from "react-hot-toast";

export default function ManufacturerPanel() {
  const { contract, roles, account } = useBlockchain();
<<<<<<< HEAD
  const [form, setForm] = useState({ serialNumber: "", modelName: "", factoryId: "", batchNumber: "" });
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

=======
  const [form, setForm] = useState({ modelName: "", factoryId: "", batchNumber: "", initialQuantity: "" });
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState(null);

  // Transfer states
  const [transferType, setTransferType] = useState("distributor");
  const [batchId, setBatchId] = useState("");
  const [transferQty, setTransferQty] = useState("");
  const [recipientAddr, setRecipientAddr] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Inventory states
  const [myInventory, setMyInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    const fetchInventory = async () => {
      if (!contract || !account || !roles.isManufacturer) return;
      setLoadingInventory(true);
      try {
        const events = await contract.queryFilter(contract.filters.BatchCreated());
        // Filter events where manufacturer matches the connected account
        const myBatches = events.filter(e => e.args[5].toLowerCase() === account.toLowerCase());
        
        const inventoryData = await Promise.all(
          myBatches.map(async (event) => {
            const batchId = event.args[0].toString();
            const modelName = event.args[1];
            const factoryId = event.args[2];
            const batchNumber = event.args[3];
            const totalMfg = event.args[4].toString();
            const stock = await contract.balanceOf(account, batchId);
            return {
              batchId, modelName, factoryId, batchNumber, totalMfg, myStock: stock.toString()
            };
          })
        );
        
        setMyInventory(inventoryData.reverse());
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      } finally {
        setLoadingInventory(false);
      }
    };

    fetchInventory();
  }, [contract, account, roles.isManufacturer, mintResult, transferring]);

>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
  const handleMint = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first");
    if (!roles.isManufacturer) return toast.error("You don't have Manufacturer role");
<<<<<<< HEAD
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
=======
    const { modelName, factoryId, batchNumber, initialQuantity } = form;
    if (!modelName || !factoryId || !batchNumber || !initialQuantity) return toast.error("Fill all fields");

    setMinting(true);
    try {
      const tx = await contract.createBatch(modelName, factoryId, batchNumber, initialQuantity);
      toast.loading("Mining transaction...", { id: "mint" });
      const receipt = await tx.wait();

      // Parse event to get batchId
      let createdBatchId = "N/A";
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
          if (parsed && parsed.name === "BatchCreated") {
            createdBatchId = parsed.args.batchId.toString();
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
            break;
          }
        } catch (_) { /* skip */ }
      }

<<<<<<< HEAD
      setMintResult({ tokenId, serialNumber, modelName, factoryId, batchNumber, txHash: receipt.hash });
      setForm({ serialNumber: "", modelName: "", factoryId: "", batchNumber: "" });
      toast.success(`Product minted! Token #${tokenId}`, { id: "mint" });
    } catch (err) {
      console.error(err);
      const msg = err?.reason || err?.message?.slice(0, 80) || "Minting failed";
=======
      setMintResult({ batchId: createdBatchId, modelName, factoryId, batchNumber, initialQuantity, txHash: receipt.hash });
      setForm({ modelName: "", factoryId: "", batchNumber: "", initialQuantity: "" });
      toast.success(`Batch created! Batch #${createdBatchId}`, { id: "mint" });
    } catch (err) {
      console.error(err);
      const msg = err?.reason || err?.message?.slice(0, 80) || "Batch creation failed";
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
      toast.error(msg, { id: "mint" });
    } finally {
      setMinting(false);
    }
  };

  const qrValue = mintResult
<<<<<<< HEAD
    ? `authchain:verify:${mintResult.tokenId}:${mintResult.serialNumber}`
    : "";

=======
    ? `authchain:verify:${mintResult.batchId}`
    : "";

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first");
    if (!batchId || !transferQty || !recipientAddr) return toast.error("Fill all fields");

    setTransferring(true);
    try {
      let tx;
      if (transferType === "distributor") {
        tx = await contract.transferToDistributor(batchId, recipientAddr, transferQty);
      } else {
        tx = await contract.transferToSeller(batchId, recipientAddr, transferQty);
      }
      toast.loading("Mining...", { id: "transfer" });
      await tx.wait();
      toast.success(`Transferred to ${transferType}!`, { id: "transfer" });
      setBatchId("");
      setTransferQty("");
      setRecipientAddr("");
    } catch (err) {
      const msg = err?.reason || err?.message?.slice(0, 80) || "Transfer failed";
      toast.error(msg, { id: "transfer" });
    } finally {
      setTransferring(false);
    }
  };

>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
  return (
    <div className="panel-grid">
      {/* Mint Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "var(--accent-cyan-dim)", color: "var(--accent-cyan)" }}>
            <HiCube />
          </div>
          <div>
<<<<<<< HEAD
            <h2 className="card-title">Mint Product</h2>
            <p className="card-subtitle">Register a new product on the blockchain</p>
=======
            <h2 className="card-title">Create Production Batch</h2>
            <p className="card-subtitle">Register a new batch of products on the blockchain</p>
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
          </div>
        </div>

        <form onSubmit={handleMint} id="mint-product-form">
          <div className="form-grid">
            <div className="form-group">
<<<<<<< HEAD
              <label className="form-label">Serial Number</label>
              <input className="form-input" name="serialNumber" value={form.serialNumber} onChange={handleChange} placeholder="e.g. RLX-2026-001" id="input-serial" />
            </div>
            <div className="form-group">
=======
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
          </div>

          <button className="btn btn-primary" type="submit" disabled={minting || !roles.isManufacturer} id="btn-mint" style={{ width: "100%", marginTop: "0.5rem" }}>
            {minting ? <><span className="btn-loader" /> Minting...</> : <><HiCube /> Mint Product NFT</>}
=======
            <div className="form-group">
              <label className="form-label">Initial Quantity</label>
              <input className="form-input" type="number" name="initialQuantity" value={form.initialQuantity} onChange={handleChange} placeholder="e.g. 1000" id="input-qty" />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={minting || !roles.isManufacturer} id="btn-mint" style={{ width: "100%", marginTop: "0.5rem" }}>
            {minting ? <><span className="btn-loader" /> Creating...</> : <><HiCube /> Create Batch</>}
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
            <h2 className="card-title">Product QR Code</h2>
            <p className="card-subtitle">Generated after successful minting</p>
=======
            <h2 className="card-title">Batch QR Code</h2>
            <p className="card-subtitle">Generated after successful creation</p>
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
          </div>
        </div>

        {mintResult ? (
          <div className="fade-in">
            <div className="verified-badge authentic" style={{ marginBottom: "1.25rem", justifyContent: "center", width: "100%" }}>
<<<<<<< HEAD
              <HiCheckCircle /> Product Minted Successfully
            </div>

            <div className="info-row">
              <span className="info-label">Token ID</span>
              <span className="info-value">#{mintResult.tokenId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Serial</span>
              <span className="info-value">{mintResult.serialNumber}</span>
=======
              <HiCheckCircle /> Batch Created Successfully
            </div>

            <div className="info-row">
              <span className="info-label">Batch ID</span>
              <span className="info-value">#{mintResult.batchId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Quantity</span>
              <span className="info-value">{mintResult.initialQuantity} Units</span>
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
            <p>Mint a product to generate its QR code</p>
          </div>
        )}
      </div>
=======
            <p>Create a batch to generate its QR code</p>
          </div>
        )}
      </div>

      {/* Transfer Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "var(--accent-purple-dim)", color: "var(--accent-purple)" }}>
            <HiCube />
          </div>
          <div>
            <h2 className="card-title">Transfer Batch Inventory</h2>
            <p className="card-subtitle">Send quantities to distributor or seller</p>
          </div>
        </div>

        <form onSubmit={handleTransfer} id="mfg-transfer-form">
          <div className="form-group">
            <label className="form-label">Transfer To</label>
            <select className="form-input" value={transferType} onChange={(e) => setTransferType(e.target.value)} style={{ cursor: "pointer" }}>
              <option value="distributor">Authorised Distributor</option>
              <option value="seller">Authorised Seller</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Batch ID</label>
            <select className="form-input" value={batchId} onChange={(e) => setBatchId(e.target.value)} style={{ cursor: "pointer" }}>
              <option value="" disabled>Select a batch from your inventory</option>
              {myInventory.filter(item => Number(item.myStock) > 0).map((item, i) => (
                <option key={i} value={item.batchId}>
                  Batch #{item.batchId} - {item.modelName} (Stock: {item.myStock})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity to Transfer</label>
            <input className="form-input" type="number" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} placeholder="e.g. 50" />
          </div>
          <div className="form-group">
            <label className="form-label">Recipient Address</label>
            <input className="form-input" value={recipientAddr} onChange={(e) => setRecipientAddr(e.target.value)} placeholder="0x..." />
          </div>
          <button className="btn btn-primary" type="submit" disabled={transferring || !roles.isManufacturer} style={{ width: "100%" }}>
            {transferring ? <><span className="btn-loader" /> Transferring...</> : <>Transfer Custody</>}
          </button>
        </form>
      </div>

      {/* My Inventory */}
      <div className="card">
        <div className="card-header">
          <div className="card-icon" style={{ background: "var(--accent-cyan-dim)", color: "var(--accent-cyan)" }}>
            <HiCube />
          </div>
          <div>
            <h2 className="card-title">My Manufactured Products</h2>
            <p className="card-subtitle">All batches you have created and your remaining stock</p>
          </div>
        </div>

        {loadingInventory ? (
          <div style={{ textAlign: "center", padding: "1.5rem" }}><span className="btn-loader" style={{ borderTopColor: "var(--accent-cyan)" }}></span></div>
        ) : myInventory.length > 0 ? (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "1rem" }}>
            {myInventory.map((item, i) => (
              <div key={i} style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1rem", background: "var(--card-bg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="badge badge-primary">Batch #{item.batchId}</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.batchNumber}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.9rem" }}>
                  <div><span style={{ color: "var(--text-secondary)" }}>Model:</span> <span style={{ fontWeight: 500 }}>{item.modelName}</span></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Factory:</span> <span style={{ fontWeight: 500 }}>{item.factoryId}</span></div>
                  <div><span style={{ color: "var(--text-secondary)" }}>Total Mfg:</span> <span>{item.totalMfg}</span></div>
                  <div style={{ background: "rgba(0, 212, 255, 0.1)", padding: "2px 6px", borderRadius: "4px", display: "inline-block" }}>
                    <span style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>Stock Left: {item.myStock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><div className="empty-state-icon">📦</div><p>You haven't manufactured any products yet</p></div>
        )}
      </div>
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
    </div>
  );
}
