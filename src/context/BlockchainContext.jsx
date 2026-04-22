import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORK_CONFIG } from "../contractConfig";

const BlockchainContext = createContext(null);

export function useBlockchain() {
  const ctx = useContext(BlockchainContext);
  if (!ctx) throw new Error("useBlockchain must be used inside BlockchainProvider");
  return ctx;
}

export function BlockchainProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [roles, setRoles] = useState({
    isAdmin: false,
    isManufacturer: false,
    isDistributor: false,
    isSeller: false,
  });
  const [loading, setLoading] = useState(false);
  const [networkOk, setNetworkOk] = useState(false);

  // ─── Check & switch network ────────────────────────────
  const ensureNetwork = useCallback(async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId === NETWORK_CONFIG.chainId) {
        setNetworkOk(true);
        return true;
      }
      // Try switching
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
        setNetworkOk(true);
        return true;
      } catch (switchErr) {
        // Chain not added — add it
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: NETWORK_CONFIG.chainId,
              chainName: NETWORK_CONFIG.chainName,
              rpcUrls: [NETWORK_CONFIG.rpcUrl],
              blockExplorerUrls: [NETWORK_CONFIG.blockExplorer],
              nativeCurrency: NETWORK_CONFIG.currency,
            }],
          });
          setNetworkOk(true);
          return true;
        }
        throw switchErr;
      }
    } catch (err) {
      console.error("Network switch failed:", err);
      toast.error("Please switch to Sepolia testnet in MetaMask");
      setNetworkOk(false);
      return false;
    }
  }, []);

  // ─── Fetch user roles ──────────────────────────────────
  const fetchRoles = useCallback(async (contractInstance) => {
    try {
      const result = await contractInstance.checkMyRole();
      const newRoles = {
        isAdmin: result.isAdmin,
        isManufacturer: result.isManufacturer,
        isDistributor: result.isDistributor,
        isSeller: result.isSeller,
      };
      setRoles(newRoles);
      return newRoles;
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      return { isAdmin: false, isManufacturer: false, isDistributor: false, isSeller: false };
    }
  }, []);

  // ─── Connect wallet ────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found! Please install it.");
      return;
    }
    setLoading(true);
    try {
      const ok = await ensureNetwork();
      if (!ok) { setLoading(false); return; }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const userSigner = await browserProvider.getSigner();

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        userSigner
      );

      setProvider(browserProvider);
      setSigner(userSigner);
      setContract(contractInstance);
      setAccount(accounts[0]);

      await fetchRoles(contractInstance);

      toast.success("Wallet connected!");
    } catch (err) {
      console.error("Connection failed:", err);
      toast.error(err?.message?.slice(0, 60) || "Connection failed");
    } finally {
      setLoading(false);
    }
  }, [ensureNetwork, fetchRoles]);

  // ─── Disconnect ────────────────────────────────────────
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setRoles({ isAdmin: false, isManufacturer: false, isDistributor: false, isSeller: false });
    setNetworkOk(false);
    toast.success("Wallet disconnected");
  }, []);

  // ─── Listen for account / chain changes ────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount(accounts[0]);
        // Re-connect to refresh signer and roles
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [connectWallet, disconnectWallet]);

  // ─── Helper: short address ─────────────────────────────
  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  const value = {
    account,
    provider,
    signer,
    contract,
    roles,
    loading,
    networkOk,
    connectWallet,
    disconnectWallet,
    shortAddress,
    fetchRoles,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}
