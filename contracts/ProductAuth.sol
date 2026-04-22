// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ProductAuth — Anti-Counterfeit Supply Chain Authentication
 * @notice ERC-721 NFT contract that tracks products from manufacturer → distributor → seller → consumer
 * @dev Uses OpenZeppelin's ERC721URIStorage for NFT functionality and AccessControl for RBAC
 */
contract ProductAuth is ERC721URIStorage, AccessControl {

    // ─── Roles ───────────────────────────────────────────────
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE  = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant SELLER_ROLE       = keccak256("SELLER_ROLE");

    // ─── Token Counter ───────────────────────────────────────
    uint256 private _nextTokenId;

    // ─── Product Data ────────────────────────────────────────
    struct Product {
        string  serialNumber;
        string  modelName;
        string  factoryId;
        string  batchNumber;
        uint256 manufacturingDate;
        bytes32 productHash;
        bool    isAuthentic;
        address manufacturer;
    }

    struct CustodyRecord {
        address fromAddr;
        address toAddr;
        uint256 timestamp;
        string  role;
    }

    // ─── Storage ─────────────────────────────────────────────
    mapping(uint256 => Product)          public products;
    mapping(uint256 => CustodyRecord[])  public custodyHistory;
    mapping(string  => uint256)          public serialToTokenId;
    mapping(string  => bool)             public serialExists;

    uint256 public totalProducts;

    // ─── Events ──────────────────────────────────────────────
    event ProductMinted(
        uint256 indexed tokenId,
        string  serialNumber,
        string  modelName,
        string  factoryId,
        address indexed manufacturer,
        uint256 timestamp
    );

    event CustodyTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        string  role,
        uint256 timestamp
    );

    event ProductVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        bool    isAuthentic,
        uint256 timestamp
    );

    event CounterfeitAlert(
        uint256 indexed tokenId,
        address indexed reporter,
        string  reason,
        uint256 timestamp
    );

    // ─── Constructor ─────────────────────────────────────────
    constructor() ERC721("AuthChain Product", "AUTHP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANUFACTURER_ROLE, msg.sender);
    }

    // ─── Role Management (Admin only) ────────────────────────

    function addManufacturer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MANUFACTURER_ROLE, account);
    }

    function addDistributor(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DISTRIBUTOR_ROLE, account);
    }

    function addSeller(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(SELLER_ROLE, account);
    }

    function removeRole(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(role, account);
    }

    // ─── Stage 1: Manufacturer — Mint Product ────────────────

    function mintProduct(
        string memory serialNumber,
        string memory modelName,
        string memory factoryId,
        string memory batchNumber,
        string memory tokenURI
    ) external onlyRole(MANUFACTURER_ROLE) returns (uint256) {
        require(!serialExists[serialNumber], "Serial number already exists");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        bytes32 pHash = keccak256(
            abi.encodePacked(serialNumber, modelName, factoryId, batchNumber, block.timestamp, msg.sender)
        );

        products[tokenId] = Product({
            serialNumber:      serialNumber,
            modelName:         modelName,
            factoryId:         factoryId,
            batchNumber:       batchNumber,
            manufacturingDate: block.timestamp,
            productHash:       pHash,
            isAuthentic:       true,
            manufacturer:      msg.sender
        });

        serialToTokenId[serialNumber] = tokenId;
        serialExists[serialNumber] = true;
        totalProducts++;

        _safeMint(msg.sender, tokenId);

        if (bytes(tokenURI).length > 0) {
            _setTokenURI(tokenId, tokenURI);
        }

        custodyHistory[tokenId].push(CustodyRecord({
            fromAddr:  address(0),
            toAddr:    msg.sender,
            timestamp: block.timestamp,
            role:      "Manufacturer"
        }));

        emit ProductMinted(tokenId, serialNumber, modelName, factoryId, msg.sender, block.timestamp);

        return tokenId;
    }

    // ─── Stage 3: Transfer Custody ───────────────────────────

    function transferToDistributor(uint256 tokenId, address distributor) external {
        require(ownerOf(tokenId) == msg.sender, "You are not the current owner");
        require(hasRole(DISTRIBUTOR_ROLE, distributor), "Recipient is not an authorised distributor");

        _transfer(msg.sender, distributor, tokenId);

        custodyHistory[tokenId].push(CustodyRecord({
            fromAddr:  msg.sender,
            toAddr:    distributor,
            timestamp: block.timestamp,
            role:      "Distributor"
        }));

        emit CustodyTransferred(tokenId, msg.sender, distributor, "Distributor", block.timestamp);
    }

    function transferToSeller(uint256 tokenId, address seller) external {
        require(ownerOf(tokenId) == msg.sender, "You are not the current owner");
        require(hasRole(SELLER_ROLE, seller), "Recipient is not an authorised seller");

        _transfer(msg.sender, seller, tokenId);

        custodyHistory[tokenId].push(CustodyRecord({
            fromAddr:  msg.sender,
            toAddr:    seller,
            timestamp: block.timestamp,
            role:      "Seller"
        }));

        emit CustodyTransferred(tokenId, msg.sender, seller, "Seller", block.timestamp);
    }

    // ─── Stage 4: Sell to Consumer ───────────────────────────

    function sellToConsumer(uint256 tokenId, address consumer) external {
        require(ownerOf(tokenId) == msg.sender, "You are not the current owner");
        require(
            hasRole(DISTRIBUTOR_ROLE, msg.sender) || hasRole(SELLER_ROLE, msg.sender),
            "Only distributors or sellers can sell to consumers"
        );

        _transfer(msg.sender, consumer, tokenId);

        custodyHistory[tokenId].push(CustodyRecord({
            fromAddr:  msg.sender,
            toAddr:    consumer,
            timestamp: block.timestamp,
            role:      "Consumer"
        }));

        emit CustodyTransferred(tokenId, msg.sender, consumer, "Consumer", block.timestamp);
    }

    // ─── Verification ────────────────────────────────────────

    function verifyProduct(uint256 tokenId) external returns (
        Product memory product,
        CustodyRecord[] memory history,
        address currentOwner
    ) {
        require(tokenId < _nextTokenId, "Product does not exist");

        product = products[tokenId];
        history = custodyHistory[tokenId];
        currentOwner = ownerOf(tokenId);

        bytes32 expectedHash = keccak256(
            abi.encodePacked(
                product.serialNumber,
                product.modelName,
                product.factoryId,
                product.batchNumber,
                product.manufacturingDate,
                product.manufacturer
            )
        );

        bool hashValid = (expectedHash == product.productHash);

        emit ProductVerified(tokenId, msg.sender, hashValid, block.timestamp);

        return (product, history, currentOwner);
    }

    function verifyBySerial(string memory serialNumber) external returns (
        Product memory product,
        CustodyRecord[] memory history,
        address currentOwner
    ) {
        require(serialExists[serialNumber], "Serial number not found — possible counterfeit");
        uint256 tokenId = serialToTokenId[serialNumber];

        product = products[tokenId];
        history = custodyHistory[tokenId];
        currentOwner = ownerOf(tokenId);

        emit ProductVerified(tokenId, msg.sender, true, block.timestamp);

        return (product, history, currentOwner);
    }

    function reportCounterfeit(uint256 tokenId, string memory reason) external {
        emit CounterfeitAlert(tokenId, msg.sender, reason, block.timestamp);
    }

    // ─── View Functions ──────────────────────────────────────

    function getProduct(uint256 tokenId) external view returns (Product memory) {
        require(tokenId < _nextTokenId, "Product does not exist");
        return products[tokenId];
    }

    function getCustodyHistory(uint256 tokenId) external view returns (CustodyRecord[] memory) {
        require(tokenId < _nextTokenId, "Product does not exist");
        return custodyHistory[tokenId];
    }

    function getCustodyHistoryLength(uint256 tokenId) external view returns (uint256) {
        return custodyHistory[tokenId].length;
    }

    function getTokenBySerial(string memory serialNumber) external view returns (uint256) {
        require(serialExists[serialNumber], "Serial number not found");
        return serialToTokenId[serialNumber];
    }

    function checkMyRole() external view returns (
        bool isAdmin,
        bool isManufacturer,
        bool isDistributor,
        bool isSeller
    ) {
        isAdmin        = hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
        isManufacturer = hasRole(MANUFACTURER_ROLE, msg.sender);
        isDistributor  = hasRole(DISTRIBUTOR_ROLE, msg.sender);
        isSeller       = hasRole(SELLER_ROLE, msg.sender);
    }

    // ─── Required Overrides ──────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
