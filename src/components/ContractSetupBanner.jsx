import { HiExclamationTriangle, HiClipboard, HiCheckCircle } from "react-icons/hi2";
import { useState } from "react";
import { CONTRACT_ADDRESS } from "../contractConfig";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const isZero = !CONTRACT_ADDRESS || CONTRACT_ADDRESS === ZERO_ADDRESS;

export default function ContractSetupBanner({ contractReady }) {
  const [copied, setCopied] = useState(false);

  // Nothing to show if the contract is working fine
  if (contractReady) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.banner}>
        <div style={styles.iconRow}>
          <HiExclamationTriangle style={{ color: "#f59e0b", fontSize: "1.5rem", flexShrink: 0 }} />
          <h3 style={styles.title}>Smart Contract Not Configured</h3>
        </div>

        <p style={styles.desc}>
          {isZero
            ? "The contract address is still set to the zero address. Deploy your contract first, then update "
            : "The contract at the configured address isn't responding. Make sure it's deployed on Sepolia and update "}
          <code style={styles.code}>src/contractConfig.js</code>
          {" "}with the real address.
        </p>

        <div style={styles.steps}>
          <Step n={1} text="Open Remix IDE and deploy" link="https://remix.ethereum.org" linkLabel="remix.ethereum.org" />
          <Step n={2} text={<>Copy the deployed address and paste it into <code style={styles.code}>CONTRACT_ADDRESS</code> in <code style={styles.code}>src/contractConfig.js</code></>} />
          <Step n={3} text="Save the file, refresh the page, and reconnect MetaMask" />
        </div>

        {isZero && (
          <div style={styles.currentAddr}>
            <span style={{ color: "#8892b0", fontSize: "0.78rem" }}>Current value:</span>
            <code style={{ ...styles.code, fontSize: "0.78rem", color: "#ff3366" }}>{CONTRACT_ADDRESS}</code>
            <button
              style={styles.copyBtn}
              onClick={() => handleCopy("YOUR_DEPLOYED_CONTRACT_ADDRESS")}
              title="Copy placeholder"
            >
              {copied ? <HiCheckCircle style={{ color: "#00ff88" }} /> : <HiClipboard />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Step({ n, text, link, linkLabel }) {
  return (
    <div style={styles.step}>
      <span style={styles.stepNum}>{n}</span>
      <span style={{ color: "#c4cde8", fontSize: "0.88rem", lineHeight: 1.5 }}>
        {text}
        {link && (
          <>
            {" — "}
            <a href={link} target="_blank" rel="noreferrer" style={{ color: "#00d4ff" }}>
              {linkLabel}
            </a>
          </>
        )}
      </span>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "0 2rem 1.5rem",
    maxWidth: 1200,
    margin: "0 auto",
  },
  banner: {
    background: "rgba(245, 158, 11, 0.07)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    borderRadius: 12,
    padding: "1.25rem 1.5rem",
  },
  iconRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: "0.75rem",
  },
  title: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "1rem",
    fontWeight: 600,
    color: "#f59e0b",
    margin: 0,
  },
  desc: {
    color: "#8892b0",
    fontSize: "0.88rem",
    lineHeight: 1.6,
    marginBottom: "1rem",
  },
  steps: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  step: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  stepNum: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "rgba(245, 158, 11, 0.2)",
    color: "#f59e0b",
    fontSize: "0.75rem",
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 2,
  },
  code: {
    fontFamily: "'Space Grotesk', monospace",
    background: "rgba(0,0,0,0.3)",
    padding: "1px 6px",
    borderRadius: 4,
    fontSize: "0.85em",
    color: "#00d4ff",
  },
  currentAddr: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: "1rem",
    padding: "8px 12px",
    background: "rgba(255,51,102,0.07)",
    borderRadius: 8,
    border: "1px solid rgba(255,51,102,0.2)",
  },
  copyBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#8892b0",
    display: "flex",
    alignItems: "center",
    padding: 2,
    marginLeft: "auto",
  },
};