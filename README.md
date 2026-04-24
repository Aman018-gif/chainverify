# AuthChain — Anti-Counterfeit Supply Chain Authentication


A blockchain-powered dApp that tracks premium products from **factory → distributor → seller → consumer** using NFTs (ERC-721), smart contracts, and QR code verification.

## 🏗 Architecture

```
Manufacturer ──mint──→ Blockchain (NFT) ──transfer──→ Distributor ──sell──→ Consumer
                           ↑                                           │
                      Smart Contract                             Scan QR → Verify
```

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Blockchain | Ethereum (Sepolia Testnet) |
| Smart Contract | Solidity 0.8.20 + OpenZeppelin |
| NFT Standard | ERC-721 |
| Frontend | React + Vite |
| Wallet | MetaMask + ethers.js v6 |
| QR Code | qrcode.react + html5-qrcode |

## 🚀 Getting Started

### 1. Deploy the Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create a new file, paste contents of `contracts/ProductAuth.sol`
3. In the compiler tab, select Solidity **0.8.20**
4. Install OpenZeppelin: Remix auto-resolves `@openzeppelin` imports
5. Compile the contract
6. In Deploy tab:
   - Set environment to **Injected Provider (MetaMask)**
   - Make sure MetaMask is on **Sepolia testnet**
   - Click **Deploy**
7. Copy the deployed contract address

### 2. Configure the Frontend

Open `src/contractConfig.js` and paste your contract address:

```js
export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_ADDRESS_HERE";
```

### 3. Run the Frontend

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Get Sepolia Test ETH

Visit [Sepolia Faucet](https://sepoliafaucet.com/) to get free test ETH.

## 📋 Demo Walkthrough

1. **Connect MetaMask** (Sepolia network)
2. **Admin tab** → Grant Distributor/Seller roles to other addresses
3. **Manufacturer tab** → Mint a product (e.g., "Rolex Submariner") → QR code generated
4. **Distributor tab** → Transfer product to a Seller address
5. **Seller tab** → Sell product to Consumer address
6. **Consumer tab** → Scan QR or enter Token ID → See full verified journey

## 📁 Project Structure

```
Project/
├── contracts/
│   └── ProductAuth.sol          # ERC-721 smart contract
├── src/
│   ├── components/
│   │   ├── Header.jsx           # App header with wallet
│   │   ├── ManufacturerPanel.jsx # Mint products
│   │   ├── DistributorPanel.jsx  # Transfer custody
│   │   ├── SellerPanel.jsx       # Sell to consumer
│   │   ├── ConsumerPanel.jsx     # Verify authenticity
│   │   └── AdminPanel.jsx        # Manage roles
│   ├── context/
│   │   └── BlockchainContext.jsx  # Blockchain provider
│   ├── contractConfig.js         # ABI + address
│   ├── App.jsx                   # Main app
│   ├── App.css                   # App styles
│   ├── index.css                 # Global styles
│   └── main.jsx                  # Entry point
└── index.html
```
