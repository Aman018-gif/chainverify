import { useState } from "react";
import { useBlockchain } from "./context/BlockchainContext";
import Header from "./components/Header";
import ManufacturerPanel from "./components/ManufacturerPanel";
import DistributorPanel from "./components/DistributorPanel";
import SellerPanel from "./components/SellerPanel";
import ConsumerPanel from "./components/ConsumerPanel";
import AdminPanel from "./components/AdminPanel";
import { HiCube, HiTruck, HiShoppingBag, HiShieldCheck, HiCog6Tooth } from "react-icons/hi2";
import "./App.css";

const TABS = [
  { id: "manufacturer", label: "Manufacturer", icon: HiCube, color: "#00d4ff" },
  { id: "distributor", label: "Distributor", icon: HiTruck, color: "#a855f7" },
  { id: "seller", label: "Seller", icon: HiShoppingBag, color: "#ff8c42" },
  { id: "consumer", label: "Verify", icon: HiShieldCheck, color: "#00ff88" },
  { id: "admin", label: "Admin", icon: HiCog6Tooth, color: "#3b82f6" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("manufacturer");
  const { account } = useBlockchain();

  return (
    <div className="app">
      <Header />

      {!account ? (
        <LandingSection />
      ) : (
        <main className="main-content">
          {/* ─── Tab Navigation ─────────────────────────── */}
          <nav className="tab-nav" id="tab-navigation">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ "--tab-color": tab.color }}
              >
                <tab.icon className="tab-icon" />
                <span className="tab-label">{tab.label}</span>
                {activeTab === tab.id && <span className="tab-indicator" />}
              </button>
            ))}
          </nav>

          {/* ─── Tab Content ────────────────────────────── */}
          <div className="tab-content fade-in" key={activeTab}>
            {activeTab === "manufacturer" && <ManufacturerPanel />}
            {activeTab === "distributor" && <DistributorPanel />}
            {activeTab === "seller" && <SellerPanel />}
            {activeTab === "consumer" && <ConsumerPanel />}
            {activeTab === "admin" && <AdminPanel />}
          </div>
        </main>
      )}
    </div>
  );
}

/* ─── Landing section when wallet is not connected ────── */
function LandingSection() {
  const { connectWallet, loading } = useBlockchain();

  return (
    <section className="landing">
      <div className="landing-content slide-up">
        <div className="landing-badge">Blockchain-Powered</div>
        <h1 className="landing-title">
          <span className="gradient-text">AuthChain</span>
          <br />
          Supply Chain Authentication
        </h1>
        <p className="landing-desc">
          Track premium products from factory to consumer with NFT-based digital
          identity, tamper-proof blockchain records, and instant QR verification.
        </p>

        <div className="landing-features">
          <div className="feature-item">
            <HiCube className="feature-icon" style={{ color: "#00d4ff" }} />
            <div>
              <strong>NFT Identity</strong>
              <p>Each product minted as a unique ERC-721 token</p>
            </div>
          </div>
          <div className="feature-item">
            <HiShieldCheck className="feature-icon" style={{ color: "#00ff88" }} />
            <div>
              <strong>Tamper-Proof</strong>
              <p>Immutable on-chain records of every transfer</p>
            </div>
          </div>
          <div className="feature-item">
            <HiTruck className="feature-icon" style={{ color: "#a855f7" }} />
            <div>
              <strong>Full Traceability</strong>
              <p>Track the entire journey from factory to buyer</p>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg landing-cta"
          onClick={connectWallet}
          disabled={loading}
          id="connect-wallet-landing"
        >
          {loading ? (
            <span className="btn-loader" />
          ) : (
            <>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                alt=""
                width={22}
                height={22}
              />
              Connect MetaMask
            </>
          )}
        </button>

        <div className="landing-chain">
          <span className="chain-step">🏭 Manufacturer</span>
          <span className="chain-arrow">→</span>
          <span className="chain-step">🚛 Distributor</span>
          <span className="chain-arrow">→</span>
          <span className="chain-step">🏪 Seller</span>
          <span className="chain-arrow">→</span>
          <span className="chain-step">🔍 Consumer</span>
        </div>
      </div>
    </section>
  );
}
