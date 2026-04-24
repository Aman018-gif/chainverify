/**
 * AuthChain — Contract Configuration
 * 
 * After deploying ProductAuth.sol via Remix IDE:
 * 1. Copy the deployed contract address and paste it below
 * 2. The ABI is already included from the contract compilation
 */

// ══════════════════════════════════════════════════════════════
// ⚠️  PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE
// ══════════════════════════════════════════════════════════════
export const CONTRACT_ADDRESS = "0x068F45F35A8D9D136536ef08A3542bf5660775A0";

// ══════════════════════════════════════════════════════════════
// Network Configuration — Sepolia Testnet
// ══════════════════════════════════════════════════════════════
export const NETWORK_CONFIG = {
  chainId: "0xaa36a7",       // 11155111 in hex
  chainName: "Sepolia Testnet",
  rpcUrl: "https://rpc.sepolia.org",
  blockExplorer: "https://sepolia.etherscan.io",
  currency: {
    name: "SepoliaETH",
    symbol: "ETH",
    decimals: 18,
  },
};

// ══════════════════════════════════════════════════════════════
// Contract ABI — ProductAuth.sol
// ══════════════════════════════════════════════════════════════
export const CONTRACT_ABI = [
  // ─── Role Constants ────────────────────────────────────
  "function MANUFACTURER_ROLE() view returns (bytes32)",
  "function DISTRIBUTOR_ROLE() view returns (bytes32)",
  "function SELLER_ROLE() view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",

  // ─── Role Management ──────────────────────────────────
  "function addManufacturer(address account)",
  "function addDistributor(address account)",
  "function addSeller(address account)",
  "function removeRole(bytes32 role, address account)",
  "function hasRole(bytes32 role, address account) view returns (bool)",

  // ─── Create Batch ─────────────────────────────────────
  "function createBatch(string modelName, string factoryId, string batchNumber, uint256 initialQuantity) returns (uint256)",

  // ─── Custody Transfers ────────────────────────────────
  "function transferToDistributor(uint256 batchId, address distributor, uint256 quantity)",
  "function transferToSeller(uint256 batchId, address seller, uint256 quantity)",
  "function sellToConsumer(uint256 batchId, address consumer, uint256 quantity)",

  // ─── Verification & View ──────────────────────────────
  "function verifyBatch(uint256 batchId) view returns (tuple(uint256 id, string modelName, string factoryId, string batchNumber, uint256 manufacturingDate, uint256 initialQuantity, address manufacturer, bytes32 batchHash, bool isAuthentic), tuple(address fromAddr, address toAddr, uint256 quantity, uint256 timestamp, string role)[])",
  "function verifyByBatchNumber(string batchNumber) view returns (tuple(uint256 id, string modelName, string factoryId, string batchNumber, uint256 manufacturingDate, uint256 initialQuantity, address manufacturer, bytes32 batchHash, bool isAuthentic), tuple(address fromAddr, address toAddr, uint256 quantity, uint256 timestamp, string role)[])",

  "function getBatch(uint256 batchId) view returns (tuple(uint256 id, string modelName, string factoryId, string batchNumber, uint256 manufacturingDate, uint256 initialQuantity, address manufacturer, bytes32 batchHash, bool isAuthentic))",
  "function getCustodyHistory(uint256 batchId) view returns (tuple(address fromAddr, address toAddr, uint256 quantity, uint256 timestamp, string role)[])",
  "function checkMyRole() view returns (bool isAdmin, bool isManufacturer, bool isDistributor, bool isSeller)",
  "function totalBatches() view returns (uint256)",
  "function batchExists(string) view returns (bool)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",

  // ─── Events ───────────────────────────────────────────
  "event BatchCreated(uint256 indexed batchId, string modelName, string factoryId, string batchNumber, uint256 quantity, address indexed manufacturer, uint256 timestamp)",
  "event CustodyTransferred(uint256 indexed batchId, address indexed from, address indexed to, uint256 quantity, string role, uint256 timestamp)",
  "event ProductSold(uint256 indexed batchId, address indexed seller, address indexed consumer, uint256 quantity, uint256 timestamp)"
];
