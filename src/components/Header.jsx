import { useBlockchain } from "../context/BlockchainContext";
import { HiLink, HiArrowRightOnRectangle } from "react-icons/hi2";
import "./Header.css";

export default function Header() {
  const { account, roles, connectWallet, disconnectWallet, shortAddress, loading, networkOk } = useBlockchain();

  const activeRoles = [];
  if (roles.isAdmin) activeRoles.push("Admin");
  if (roles.isManufacturer) activeRoles.push("Manufacturer");
  if (roles.isDistributor) activeRoles.push("Distributor");
  if (roles.isSeller) activeRoles.push("Seller");

  return (
    <header className="header" id="app-header">
      <div className="header-inner">
        <div className="header-logo">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L4 9v14l12 7 12-7V9L16 2z" stroke="url(#logoGrad)" strokeWidth="2" fill="none"/>
              <path d="M16 2v28M4 9l12 7 12-7M4 23l12-7 12 7" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.5"/>
              <defs><linearGradient id="logoGrad" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#00d4ff"/><stop offset="1" stopColor="#a855f7"/></linearGradient></defs>
            </svg>
          </div>
          <div>
            <span className="logo-text">AuthChain</span>
            <span className="logo-sub">Supply Chain Auth</span>
          </div>
        </div>
        <div className="header-right">
          {account && networkOk && (
            <div className="network-badge"><span className="network-dot"/>Sepolia</div>
          )}
          {account && activeRoles.length > 0 && (
            <div className="role-badges">
              {activeRoles.map((r) => (
                <span key={r} className={`badge badge-role badge-${r.toLowerCase()}`}>{r}</span>
              ))}
            </div>
          )}
          {account ? (
            <div className="wallet-group">
              <div className="wallet-address" id="wallet-display"><span className="wallet-dot"/>{shortAddress(account)}</div>
              <button className="btn btn-sm btn-outline disconnect-btn" onClick={disconnectWallet} id="disconnect-wallet" title="Disconnect"><HiArrowRightOnRectangle/></button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={connectWallet} disabled={loading} id="connect-wallet-header">
              {loading ? <span className="btn-loader"/> : <><HiLink/> Connect</>}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
