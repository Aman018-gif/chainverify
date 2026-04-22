import { useState, useEffect, useRef } from "react";
import { useBlockchain } from "../context/BlockchainContext";
import { HiShieldCheck, HiExclamationTriangle, HiMagnifyingGlass, HiCamera } from "react-icons/hi2";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";

export default function ConsumerPanel() {
  const { contract } = useBlockchain();
  const [inputVal, setInputVal] = useState("");
  const [searchType, setSearchType] = useState("tokenId");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanner = async () => {
    setScanning(true);
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          // Parse: authchain:verify:tokenId:serial
          const parts = decoded.split(":");
          if (parts.length >= 3 && parts[0] === "authchain") {
            setInputVal(parts[2]);
            setSearchType("tokenId");
            toast.success("QR code scanned!");
          } else {
            setInputVal(decoded);
          }
          html5QrCode.stop().catch(() => {});
          scannerRef.current = null;
          setScanning(false);
        },
        () => {} // ignore scan errors
      );
    } catch (err) {
      toast.error("Camera not available");
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleVerify = async () => {
    if (!contract) return toast.error("Connect wallet first");
    if (!inputVal.trim()) return toast.error("Enter a token ID or serial number");

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let product, history, owner;
      if (searchType === "serial") {
        [product, history, owner] = await contract.verifyBySerial.staticCall(inputVal.trim());
      } else {
        [product, history, owner] = await contract.verifyProduct.staticCall(inputVal.trim());
      }

      setResult({
        serialNumber: product.serialNumber,
        modelName: product.modelName,
        factoryId: product.factoryId,
        batchNumber: product.batchNumber,
        manufacturingDate: new Date(Number(product.manufacturingDate) * 1000).toLocaleString(),
        productHash: product.productHash,
        isAuthentic: product.isAuthentic,
        manufacturer: product.manufacturer,
        currentOwner: owner,
        history: history.map((h) => ({
          from: h.fromAddr,
          to: h.toAddr,
          timestamp: new Date(Number(h.timestamp) * 1000).toLocaleString(),
          role: h.role,
        })),
      });
    } catch (err) {
      console.error(err);
      const reason = err?.reason || err?.message || "";
      if (reason.includes("not found") || reason.includes("not exist") || reason.includes("counterfeit")) {
        setError({ type: "counterfeit", message: "Product not found on blockchain — possible counterfeit!" });
      } else {
        setError({ type: "error", message: reason.slice(0, 100) || "Verification failed" });
      }
    } finally {
      setLoading(false);
    }
  };

  const shortAddr = (a) => a === "0x0000000000000000000000000000000000000000" ? "Genesis" : `${a.slice(0, 6)}...${a.slice(-4)}`;

  return (
    <div>
      {/* Search Bar */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <div className="card-icon" style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}>
            <HiShieldCheck />
          </div>
          <div>
            <h2 className="card-title">Verify Product</h2>
            <p className="card-subtitle">Scan QR code or enter product details to verify authenticity</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
          <button className={`btn btn-sm ${searchType === "tokenId" ? "btn-primary" : "btn-outline"}`} onClick={() => setSearchType("tokenId")}>By Token ID</button>
          <button className={`btn btn-sm ${searchType === "serial" ? "btn-primary" : "btn-outline"}`} onClick={() => setSearchType("serial")}>By Serial</button>
          <button className={`btn btn-sm ${scanning ? "btn-danger" : "btn-outline"}`} onClick={scanning ? stopScanner : startScanner} id="btn-scan-qr">
            <HiCamera /> {scanning ? "Stop" : "Scan QR"}
          </button>
        </div>

        {scanning && <div id="qr-reader" style={{ width: "100%", maxWidth: 400, margin: "0 auto 1rem", borderRadius: "var(--radius-md)", overflow: "hidden" }} />}
        {!scanning && <div id="qr-reader" style={{ display: "none" }} />}

        <div style={{ display: "flex", gap: "8px" }}>
          <input className="form-input" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder={searchType === "tokenId" ? "Enter Token ID (e.g. 0)" : "Enter Serial Number"} id="input-verify" onKeyDown={(e) => e.key === "Enter" && handleVerify()} />
          <button className="btn btn-success" onClick={handleVerify} disabled={loading} id="btn-verify">
            {loading ? <span className="btn-loader btn-loader-light" /> : <><HiMagnifyingGlass /> Verify</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="card fade-in" style={{ borderColor: "rgba(255,51,102,0.3)" }}>
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div className="verified-badge counterfeit"><HiExclamationTriangle /> COUNTERFEIT ALERT</div>
            <p style={{ color: "var(--accent-red)", marginTop: "1rem", fontSize: "0.92rem" }}>{error.message}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="panel-grid fade-in">
          {/* Product Info */}
          <div className="card">
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <div className="verified-badge authentic"><HiShieldCheck /> VERIFIED AUTHENTIC</div>
            </div>
            <div className="info-row"><span className="info-label">Model</span><span className="info-value">{result.modelName}</span></div>
            <div className="info-row"><span className="info-label">Serial</span><span className="info-value">{result.serialNumber}</span></div>
            <div className="info-row"><span className="info-label">Factory</span><span className="info-value">{result.factoryId}</span></div>
            <div className="info-row"><span className="info-label">Batch</span><span className="info-value">{result.batchNumber}</span></div>
            <div className="info-row"><span className="info-label">Manufactured</span><span className="info-value">{result.manufacturingDate}</span></div>
            <div className="info-row"><span className="info-label">Owner</span><span className="info-value" style={{ fontSize: "0.75rem" }}>{result.currentOwner}</span></div>
            <div className="info-row"><span className="info-label">Hash</span><span className="info-value" style={{ fontSize: "0.68rem" }}>{result.productHash}</span></div>
          </div>

          {/* Chain of Custody Timeline */}
          <div className="card">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1.25rem" }}>Chain of Custody</h3>
            <div className="timeline">
              {result.history.map((h, i) => (
                <div className="timeline-item" key={i}>
                  <div className={`timeline-dot ${h.role.toLowerCase()}`} />
                  <div className="timeline-role" style={{ color: h.role === "Manufacturer" ? "#00d4ff" : h.role === "Distributor" ? "#a855f7" : h.role === "Seller" ? "#ff8c42" : "#00ff88" }}>
                    {h.role}
                  </div>
                  <div className="timeline-address">{shortAddr(h.from)} → {shortAddr(h.to)}</div>
                  <div className="timeline-time">{h.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
