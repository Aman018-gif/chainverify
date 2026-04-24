// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts@4.9.3/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts@4.9.3/access/AccessControl.sol";

/**
 * @title ProductAuth — Anti-Counterfeit Supply Chain Authentication (Batch Edition)
 * @notice ERC-1155 contract that tracks product batches and quantities from manufacturer → distributor → seller → consumer
 */
contract ProductAuth is ERC1155, AccessControl {

    // ─── Roles ───────────────────────────────────────────────
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE  = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant SELLER_ROLE       = keccak256("SELLER_ROLE");

    // ─── Batch Counter ───────────────────────────────────────
    uint256 private _nextBatchId;

    // ─── Data Structures ─────────────────────────────────────
    struct Batch {
        uint256 id;
        string  modelName;
        string  factoryId;
        string  batchNumber;
        uint256 manufacturingDate;
        uint256 initialQuantity;
        address manufacturer;
        bytes32 batchHash;
        bool    isAuthentic;
    }

    struct CustodyRecord {
        address fromAddr;
        address toAddr;
        uint256 quantity;
        uint256 timestamp;
        string  role;
    }

    // ─── Storage ─────────────────────────────────────────────
    mapping(uint256 => Batch)             public batches;
    mapping(uint256 => CustodyRecord[])   public custodyHistory;
    mapping(string  => uint256)           public batchNumberToId;
    mapping(string  => bool)              public batchExists;

    uint256 public totalBatches;

    // ─── Events ──────────────────────────────────────────────
    event BatchCreated(
        uint256 indexed batchId,
        string  modelName,
        string  factoryId,
        string  batchNumber,
        uint256 quantity,
        address indexed manufacturer,
        uint256 timestamp
    );

    event CustodyTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to,
        uint256 quantity,
        string  role,
        uint256 timestamp
    );

    event ProductSold(
        uint256 indexed batchId,
        address indexed seller,
        address indexed consumer,
        uint256 quantity,
        uint256 timestamp
    );

    // ─── Constructor ─────────────────────────────────────────
    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _nextBatchId = 1; // Start IDs at 1
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

    // ─── Stage 1: Manufacturer — Create Batch ────────────────
    function createBatch(
        string memory modelName,
        string memory factoryId,
        string memory batchNumber,
        uint256 initialQuantity
    ) external onlyRole(MANUFACTURER_ROLE) returns (uint256) {
        require(!batchExists[batchNumber], "Batch number already exists");
        require(initialQuantity > 0, "Quantity must be greater than 0");

        uint256 batchId = _nextBatchId++;

        bytes32 bHash = keccak256(
            abi.encodePacked(batchNumber, modelName, factoryId, initialQuantity, block.timestamp, msg.sender)
        );

        batches[batchId] = Batch({
            id:                batchId,
            modelName:         modelName,
            factoryId:         factoryId,
            batchNumber:       batchNumber,
            manufacturingDate: block.timestamp,
            initialQuantity:   initialQuantity,
            manufacturer:      msg.sender,
            batchHash:         bHash,
            isAuthentic:       true
        });

        batchNumberToId[batchNumber] = batchId;
        batchExists[batchNumber] = true;
        totalBatches++;

        _mint(msg.sender, batchId, initialQuantity, "");

        custodyHistory[batchId].push(CustodyRecord({
            fromAddr:  address(0),
            toAddr:    msg.sender,
            quantity:  initialQuantity,
            timestamp: block.timestamp,
            role:      "Manufacturer"
        }));

        emit BatchCreated(batchId, modelName, factoryId, batchNumber, initialQuantity, msg.sender, block.timestamp);

        return batchId;
    }

    // ─── Stage 2: Transfer Custody (B2B) ─────────────────────
    function _transferBatch(uint256 batchId, address recipient, uint256 quantity, string memory roleName) internal {
        require(balanceOf(msg.sender, batchId) >= quantity, "Insufficient batch balance");
        
        _safeTransferFrom(msg.sender, recipient, batchId, quantity, "");

        custodyHistory[batchId].push(CustodyRecord({
            fromAddr:  msg.sender,
            toAddr:    recipient,
            quantity:  quantity,
            timestamp: block.timestamp,
            role:      roleName
        }));

        emit CustodyTransferred(batchId, msg.sender, recipient, quantity, roleName, block.timestamp);
    }

    function transferToDistributor(uint256 batchId, address distributor, uint256 quantity) external {
        require(hasRole(DISTRIBUTOR_ROLE, distributor), "Recipient is not an authorised distributor");
        _transferBatch(batchId, distributor, quantity, "Distributor");
    }

    function transferToSeller(uint256 batchId, address seller, uint256 quantity) external {
        require(hasRole(SELLER_ROLE, seller), "Recipient is not an authorised seller");
        _transferBatch(batchId, seller, quantity, "Seller");
    }

    // ─── Stage 3: Sell to Consumer (B2C) ─────────────────────
    function sellToConsumer(uint256 batchId, address consumer, uint256 quantity) external {
        require(
            hasRole(DISTRIBUTOR_ROLE, msg.sender) || hasRole(SELLER_ROLE, msg.sender),
            "Only distributors or sellers can sell to consumers"
        );
        require(balanceOf(msg.sender, batchId) >= quantity, "Insufficient batch balance");

        _safeTransferFrom(msg.sender, consumer, batchId, quantity, "");

        custodyHistory[batchId].push(CustodyRecord({
            fromAddr:  msg.sender,
            toAddr:    consumer,
            quantity:  quantity,
            timestamp: block.timestamp,
            role:      "Consumer"
        }));

        emit ProductSold(batchId, msg.sender, consumer, quantity, block.timestamp);
    }

    // ─── Verification & View Functions ───────────────────────
    function verifyBatch(uint256 batchId) external view returns (
        Batch memory batch,
        CustodyRecord[] memory history
    ) {
        require(batchId < _nextBatchId && batchId > 0, "Batch does not exist");
        return (batches[batchId], custodyHistory[batchId]);
    }
    
    function verifyByBatchNumber(string memory batchNumber) external view returns (
        Batch memory batch,
        CustodyRecord[] memory history
    ) {
        require(batchExists[batchNumber], "Batch number not found");
        uint256 batchId = batchNumberToId[batchNumber];
        return (batches[batchId], custodyHistory[batchId]);
    }

    function getBatch(uint256 batchId) external view returns (Batch memory) {
        require(batchId < _nextBatchId && batchId > 0, "Batch does not exist");
        return batches[batchId];
    }

    function getCustodyHistory(uint256 batchId) external view returns (CustodyRecord[] memory) {
        require(batchId < _nextBatchId && batchId > 0, "Batch does not exist");
        return custodyHistory[batchId];
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
        public view override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
