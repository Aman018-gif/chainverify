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
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

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

  // ─── Mint Product ─────────────────────────────────────
  "function mintProduct(string serialNumber, string modelName, string factoryId, string batchNumber, string tokenURI) returns (uint256)",

  // ─── Custody Transfers ────────────────────────────────
  "function transferToDistributor(uint256 tokenId, address distributor)",
  "function transferToSeller(uint256 tokenId, address seller)",
  "function sellToConsumer(uint256 tokenId, address consumer)",

  // ─── Verification ─────────────────────────────────────
  "function verifyProduct(uint256 tokenId) returns (tuple(string serialNumber, string modelName, string factoryId, string batchNumber, uint256 manufacturingDate, bytes32 productHash, bool isAuthentic, address manufacturer), tuple(address fromAddr, address toAddr, uint256 timestamp, string role)[], address)",
  "function verifyBySerial(string serialNumber) returns (tuple(string serialNumber, string modelName, string factoryId, string batchNumber, uint256 manufacturingDate, bytes32 productHash, bool isAuthentic, address manufacturer), tuple(address fromAddr, address toAddr, uint256 timestamp, string role)[], address)",
  "function reportCounterfeit(uint256 tokenId, string reason)",

  // ─── View Functions ───────────────────────────────────
  "function getProduct(uint256 tokenId) view returns (tuple(string serialNumber, string modelName, string factoryId, string batchNumber, uint256 manufacturingDate, bytes32 productHash, bool isAuthentic, address manufacturer))",
  "function getCustodyHistory(uint256 tokenId) view returns (tuple(address fromAddr, address toAddr, uint256 timestamp, string role)[])",
  "function getCustodyHistoryLength(uint256 tokenId) view returns (uint256)",
  "function getTokenBySerial(string serialNumber) view returns (uint256)",
  "function checkMyRole() view returns (bool isAdmin, bool isManufacturer, bool isDistributor, bool isSeller)",
  "function totalProducts() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function serialExists(string) view returns (bool)",

  // ─── Events ───────────────────────────────────────────
  "event ProductMinted(uint256 indexed tokenId, string serialNumber, string modelName, string factoryId, address indexed manufacturer, uint256 timestamp)",
  "event CustodyTransferred(uint256 indexed tokenId, address indexed from, address indexed to, string role, uint256 timestamp)",
  "event ProductVerified(uint256 indexed tokenId, address indexed verifier, bool isAuthentic, uint256 timestamp)",
  "event CounterfeitAlert(uint256 indexed tokenId, address indexed reporter, string reason, uint256 timestamp)",
];
