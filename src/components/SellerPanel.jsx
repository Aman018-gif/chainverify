<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
import { useBlockchain } from "../context/BlockchainContext";
import { HiShoppingBag, HiUserPlus } from "react-icons/hi2";
import toast from "react-hot-toast";

export default function SellerPanel() {
  const { contract, roles, account } = useBlockchain();
<<<<<<< HEAD
  const [tokenId, setTokenId] = useState("");
  const [consumerAddr, setConsumerAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
=======
  const [batchId, setBatchId] = useState("");
  const [transferQty, setTransferQty] = useState("");
  const [consumerAddr, setConsumerAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
  const [myInventory, setMyInventory] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!contract || !account || (!roles.isSeller && !roles.isDistributor)) return;
      try {
        const filter = contract.filters.CustodyTransferred(null, null, account);
        const events = await contract.queryFilter(filter);
        
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
  }, [contract, account, roles.isSeller, roles.isDistributor, loading]);

  useEffect(() => {
    const fetchPastSales = async () => {
      if (!contract || !account) return;
      try {
        const filter = contract.filters.ProductSold(null, account, null);
        const events = await contract.queryFilter(filter);
        
        const formattedSales = events.map(event => ({
          batchId: event.args[0].toString(),
          qty: event.args[3].toString(),
          consumer: event.args[2],
          txHash: event.transactionHash,
          time: new Date(Number(event.args[4]) * 1000).toLocaleString()
        })).reverse();
        
        setRecentSales(formattedSales);
      } catch (err) {
        console.error("Failed to fetch past sales:", err);
      }
    };
    
    fetchPastSales();
  }, [contract, account]);
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)

  const handleSell = async (e) => {
    e.preventDefault();
    if (!contract) return toast.error("Connect wallet first");
    if (!roles.isSeller && !roles.isDistributor) return toast.error("You need Seller or Distributor role");
<<<<<<< HEAD
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
=======
    if (!batchId || !transferQty || !consumerAddr) return toast.error("Fill all fields");

    setLoading(true);
    try {
      const tx = await contract.sellToConsumer(batchId, consumerAddr, transferQty);
      toast.loading("Mining...", { id: "sell" });
      const receipt = await tx.wait();
      toast.success("Products sold to consumer!", { id: "sell" });

      setRecentSales((prev) => [
        { batchId, qty: transferQty, consumer: consumerAddr, txHash: receipt.hash, time: new Date().toLocaleString() },
        ...prev.slice(0, 4),
      ]);
      setBatchId("");
      setTransferQty("");
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
            <p className="card-subtitle">Transfer product ownership to end buyer</p>
=======
            <p className="card-subtitle">Transfer batch quantities to end buyer</p>
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
          </div>
        </div>
        <form onSubmit={handleSell} id="sell-form">
          <div className="form-group">
<<<<<<< HEAD
            <label className="form-label">Token ID</label>
            <input className="form-input" value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="e.g. 0" id="input-sell-token" />
=======
            <label className="form-label">Batch ID</label>
            <select className="form-input" value={batchId} onChange={(e) => setBatchId(e.target.value)} id="input-sell-token" style={{ cursor: "pointer" }}>
              <option value="" disabled>Select a batch from your inventory</option>
              {myInventory.map((item, i) => (
                <option key={i} value={item.batchId}>
                  Batch #{item.batchId} - {item.modelName} (Stock: {item.myStock})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input className="form-input" type="number" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} placeholder="e.g. 1" />
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
            <p className="card-subtitle">Products sold in this session</p>
=======
            <p className="card-subtitle">Products sold by you to consumers</p>
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
          </div>
        </div>
        {recentSales.length > 0 ? (
          recentSales.map((sale, i) => (
            <div key={i} className="info-row fade-in" style={{ flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
<<<<<<< HEAD
                <span className="badge badge-success">Token #{sale.tokenId}</span>
=======
                <span className="badge badge-success">Batch #{sale.batchId} ({sale.qty} units)</span>
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
                <span style={{ fontSize: "0.73rem", color: "var(--text-muted)" }}>{sale.time}</span>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontFamily: "'Space Grotesk', monospace" }}>
                → {sale.consumer.slice(0, 10)}...{sale.consumer.slice(-6)}
              </span>
            </div>
          ))
        ) : (
<<<<<<< HEAD
          <div className="empty-state"><div className="empty-state-icon">🛒</div><p>No sales yet this session</p></div>
=======
          <div className="empty-state"><div className="empty-state-icon">🛒</div><p>No sales found</p></div>
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
        )}
      </div>
    </div>
  );
}
