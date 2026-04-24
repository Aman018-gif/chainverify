<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
import { useBlockchain } from "../context/BlockchainContext";
import { HiTruck, HiArrowsRightLeft } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function DistributorPanel() {
  const { contract, roles, account } = useBlockchain();
<<<<<<< HEAD
  const [tokenId, setTokenId] = useState("");
=======
  const [batchId, setBatchId] = useState("");
  const [transferQty, setTransferQty] = useState("");
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
  const [recipientAddr, setRecipientAddr] = useState("");
  const [transferType, setTransferType] = useState("seller");
  const [loading, setLoading] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [lookupId, setLookupId] = useState("");
<<<<<<< HEAD
=======
  const [myInventory, setMyInventory] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!contract || !account || !roles.isDistributor) return;
      try {
        const filter = contract.filters.CustodyTransferred(null, null, account);
        const events = await contract.queryFilter(filter);
        
        // Get unique batch IDs received
        const uniqueBatchIds = [...new Set(events.map(e => e.args[0].toString()))];
        
        const inventoryData = [];
        for (const bId of uniqueBatchIds) {
          const stock = await contract.balanceOf(account, bId);
          if (stock > 0n) {
            const b = await contract.getBatch(bId);
            inventoryData.push({
              batchId: bId,
              modelName: b.modelName,
              myStock: stock.toString()
            });
          }
        }
        
        setMyInventory(inventoryData);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      }
    };

    fetchInventory();
  }, [contract, account, roles.isDistributor, loading]);
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)

  const handleLookup = async () => {
    if (!contract || !lookupId) return;
    try {
<<<<<<< HEAD
      const p = await contract.getProduct(lookupId);
      const owner = await contract.ownerOf(lookupId);
      setProductInfo({ ...p, currentOwner: owner });
      toast.success("Product found");
    } catch (err) {
      toast.error("Product not found");
=======
      const b = await contract.getBatch(lookupId);
      const stock = account ? await contract.balanceOf(account, lookupId) : 0n;
      setProductInfo({
        modelName: b.modelName,
        factoryId: b.factoryId,
        batchNumber: b.batchNumber,
        initialQuantity: b.initialQuantity.toString(),
        myStock: stock.toString()
      });
      toast.success("Batch found");
    } catch (err) {
      toast.error("Batch not found");
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
      setProductInfo(null);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first");
<<<<<<< HEAD
    if (!tokenId || !recipientAddr) return toast.error("Fill all fields");
=======
    if (!batchId || !transferQty || !recipientAddr) return toast.error("Fill all fields");
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)

    setLoading(true);
    try {
      let tx;
      if (transferType === "seller") {
<<<<<<< HEAD
        tx = await contract.transferToSeller(tokenId, recipientAddr);
      } else {
        tx = await contract.sellToConsumer(tokenId, recipientAddr);
=======
        tx = await contract.transferToSeller(batchId, recipientAddr, transferQty);
      } else {
        tx = await contract.sellToConsumer(batchId, recipientAddr, transferQty);
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
      }
      toast.loading("Mining...", { id: "transfer" });
      await tx.wait();
      toast.success(`Transferred to ${transferType}!`, { id: "transfer" });
<<<<<<< HEAD
      setTokenId("");
=======
      setBatchId("");
      setTransferQty("");
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
            <h2 className="card-title">Transfer Product</h2>
            <p className="card-subtitle">Send product to seller or consumer</p>
=======
            <h2 className="card-title">Transfer Batch Inventory</h2>
            <p className="card-subtitle">Send quantities to seller or consumer</p>
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
            <label className="form-label">Token ID</label>
            <input className="form-input" value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="e.g. 0" id="input-transfer-token" />
=======
            <label className="form-label">Batch ID</label>
            <select className="form-input" value={batchId} onChange={(e) => setBatchId(e.target.value)} id="input-transfer-token" style={{ cursor: "pointer" }}>
              <option value="" disabled>Select a batch from your inventory</option>
              {myInventory.map((item, i) => (
                <option key={i} value={item.batchId}>
                  Batch #{item.batchId} - {item.modelName} (Stock: {item.myStock})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity to Transfer</label>
            <input className="form-input" type="number" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} placeholder="e.g. 50" />
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
            <h2 className="card-title">Lookup Product</h2>
            <p className="card-subtitle">Check product details by token ID</p>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Token ID</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input className="form-input" value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="e.g. 0" id="input-lookup-token" />
=======
            <h2 className="card-title">Lookup Batch</h2>
            <p className="card-subtitle">Check batch details and your stock</p>
          </div>
        </div>
        <div className="form-group">
            <label className="form-label">Batch ID</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input className="form-input" value={lookupId} onChange={(e) => setLookupId(e.target.value)} placeholder="e.g. 1" id="input-lookup-token" />
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
            <button className="btn btn-outline" type="button" onClick={handleLookup} id="btn-lookup">Lookup</button>
          </div>
        </div>

        {productInfo ? (
          <div className="fade-in" style={{ marginTop: "1rem" }}>
<<<<<<< HEAD
            <div className="info-row"><span className="info-label">Serial</span><span className="info-value">{productInfo.serialNumber}</span></div>
            <div className="info-row"><span className="info-label">Model</span><span className="info-value">{productInfo.modelName}</span></div>
            <div className="info-row"><span className="info-label">Factory</span><span className="info-value">{productInfo.factoryId}</span></div>
            <div className="info-row"><span className="info-label">Batch</span><span className="info-value">{productInfo.batchNumber}</span></div>
            <div className="info-row"><span className="info-label">Owner</span><span className="info-value" style={{ fontSize: "0.75rem" }}>{productInfo.currentOwner}</span></div>
          </div>
        ) : (
          <div className="empty-state"><div className="empty-state-icon">🔍</div><p>Enter a token ID to look up</p></div>
=======
            <div className="info-row"><span className="info-label">Model</span><span className="info-value">{productInfo.modelName}</span></div>
            <div className="info-row"><span className="info-label">Factory</span><span className="info-value">{productInfo.factoryId}</span></div>
            <div className="info-row"><span className="info-label">Batch Num</span><span className="info-value">{productInfo.batchNumber}</span></div>
            <div className="info-row"><span className="info-label">Total Mfg</span><span className="info-value">{productInfo.initialQuantity?.toString() || productInfo.initialQuantity} Units</span></div>
            <div className="info-row" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}><span className="info-label" style={{ color: "var(--accent-purple)" }}>My Stock</span><span className="info-value" style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--accent-purple)" }}>{productInfo.myStock} Units</span></div>
          </div>
        ) : (
          <div className="empty-state"><div className="empty-state-icon">🔍</div><p>Enter a batch ID to look up</p></div>
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
        )}
      </div>
    </div>
  );
}
