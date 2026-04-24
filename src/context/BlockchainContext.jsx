import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORK_CONFIG } from "../contractConfig";

<<<<<<< HEAD
=======
// ── Guard: is the contract address actually configured? ──────────────────────
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const isContractConfigured = () =>
  CONTRACT_ADDRESS &&
  CONTRACT_ADDRESS !== ZERO_ADDRESS &&
  ethers.isAddress(CONTRACT_ADDRESS);

>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
=======
  const [contractReady, setContractReady] = useState(false);
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)

  // ─── Check & switch network ────────────────────────────
  const ensureNetwork = useCallback(async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId === NETWORK_CONFIG.chainId) {
        setNetworkOk(true);
        return true;
      }
<<<<<<< HEAD
      // Try switching
=======
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
        setNetworkOk(true);
        return true;
      } catch (switchErr) {
<<<<<<< HEAD
        // Chain not added — add it
=======
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
=======
    // Don't attempt if contract address isn't real
    if (!isContractConfigured()) {
      console.warn("Contract address not configured — skipping role fetch");
      return { isAdmin: false, isManufacturer: false, isDistributor: false, isSeller: false };
    }

>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
    try {
      const result = await contractInstance.checkMyRole();
      const newRoles = {
        isAdmin: result.isAdmin,
        isManufacturer: result.isManufacturer,
        isDistributor: result.isDistributor,
        isSeller: result.isSeller,
      };
      setRoles(newRoles);
<<<<<<< HEAD
      return newRoles;
    } catch (err) {
      console.error("Failed to fetch roles:", err);
=======
      setContractReady(true);
      return newRoles;
    } catch (err) {
      // BAD_DATA / CALL_EXCEPTION means the contract doesn't exist at that address
      if (
        err?.code === "BAD_DATA" ||
        err?.code === "CALL_EXCEPTION" ||
        err?.message?.includes("BAD_DATA") ||
        err?.message?.includes("could not decode")
      ) {
        console.warn("Contract not found at address — it may not be deployed yet.");
        setContractReady(false);
      } else {
        console.error("Failed to fetch roles:", err);
      }
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
      return { isAdmin: false, isManufacturer: false, isDistributor: false, isSeller: false };
    }
  }, []);

  // ─── Connect wallet ────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found! Please install it.");
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
    setLoading(true);
    try {
      const ok = await ensureNetwork();
      if (!ok) { setLoading(false); return; }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const userSigner = await browserProvider.getSigner();

<<<<<<< HEAD
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
=======
      setProvider(browserProvider);
      setSigner(userSigner);
      setAccount(accounts[0]);

      // Only build contract instance if address looks valid
      if (isContractConfigured()) {
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          userSigner
        );
        setContract(contractInstance);
        await fetchRoles(contractInstance);
      } else {
        console.warn("CONTRACT_ADDRESS is not set — skipping contract initialisation");
        setContractReady(false);
      }
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)

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
<<<<<<< HEAD
=======
    setContractReady(false);
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
        // Re-connect to refresh signer and roles
=======
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
=======
    contractReady,
    contractConfigured: isContractConfigured(),
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
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
<<<<<<< HEAD
}
=======
}
>>>>>>> a6a5f33 (feat: implement Web3 frontend UI, graph algorithms, and QR verification)
