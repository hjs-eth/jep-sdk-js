// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title JEPVerifier
 * @notice On-chain registry for JEP Receipt verification results
 * @dev Stores verification results of JEP Receipts. Verification happens off-chain to minimize gas costs.
 */
contract JEPVerifier {
    // --- State Variables ---
    
    /// @notice Mapping from receipt hash to verification status (true = valid)
    mapping(bytes32 => bool) public verifiedReceipts;
    
    /// @notice Mapping from address to authorization status (true = can verify)
    mapping(address => bool) public authorizedVerifiers;
    
    /// @notice Timestamp of each verification (for audit purposes)
    mapping(bytes32 => uint256) public verificationTimestamps;
    
    // --- Events ---
    
    /// @dev Emitted when a receipt is verified
    event ReceiptVerified(
        bytes32 indexed receiptHash,
        bool isValid,
        address indexed verifier,
        uint256 timestamp
    );
    
    /// @dev Emitted when a verifier is added
    event VerifierAdded(address indexed verifier, address indexed addedBy);
    
    /// @dev Emitted when a verifier is removed
    event VerifierRemoved(address indexed verifier, address indexed removedBy);
    
    // --- Modifiers ---
    
    modifier onlyAuthorized() {
        require(authorizedVerifiers[msg.sender], "JEPVerifier: not authorized");
        _;
    }
    
    // --- Constructor ---
    
    constructor() {
        authorizedVerifiers[msg.sender] = true;
        emit VerifierAdded(msg.sender, msg.sender);
    }
    
    // --- Core Functions ---
    
    /**
     * @notice Record verification result for a single JEP Receipt
     * @param receiptHash Hash of the JEP Receipt (keccak256 of canonical JSON)
     * @param isValid True if the receipt is valid
     */
    function recordVerification(
        bytes32 receiptHash,
        bool isValid
    ) external onlyAuthorized {
        verifiedReceipts[receiptHash] = isValid;
        verificationTimestamps[receiptHash] = block.timestamp;
        
        emit ReceiptVerified(
            receiptHash,
            isValid,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @notice Batch record multiple verifications (gas optimization)
     * @param receiptHashes Array of receipt hashes
     * @param isValid Array of verification results (must be same length)
     */
    function batchRecordVerification(
        bytes32[] calldata receiptHashes,
        bool[] calldata isValid
    ) external onlyAuthorized {
        require(
            receiptHashes.length == isValid.length,
            "JEPVerifier: array length mismatch"
        );
        
        for (uint i = 0; i < receiptHashes.length; i++) {
            verifiedReceipts[receiptHashes[i]] = isValid[i];
            verificationTimestamps[receiptHashes[i]] = block.timestamp;
            
            emit ReceiptVerified(
                receiptHashes[i],
                isValid[i],
                msg.sender,
                block.timestamp
            );
        }
    }
    
    /**
     * @notice Check if a receipt is valid
     * @param receiptHash Hash of the JEP Receipt
     * @return bool True if valid (or false if not verified or invalid)
     */
    function isReceiptValid(bytes32 receiptHash) external view returns (bool) {
        return verifiedReceipts[receiptHash];
    }
    
    /**
     * @notice Get verification timestamp for a receipt
     * @param receiptHash Hash of the JEP Receipt
     * @return uint256 Timestamp (0 if not verified)
     */
    function getVerificationTimestamp(bytes32 receiptHash) external view returns (uint256) {
        return verificationTimestamps[receiptHash];
    }
    
    // --- Admin Functions ---
    
    /**
     * @notice Add a new authorized verifier
     * @param verifier Address to authorize
     */
    function addVerifier(address verifier) external onlyAuthorized {
        require(verifier != address(0), "JEPVerifier: zero address");
        require(!authorizedVerifiers[verifier], "JEPVerifier: already authorized");
        
        authorizedVerifiers[verifier] = true;
        emit VerifierAdded(verifier, msg.sender);
    }
    
    /**
     * @notice Remove an authorized verifier
     * @param verifier Address to deauthorize
     */
    function removeVerifier(address verifier) external onlyAuthorized {
        require(authorizedVerifiers[verifier], "JEPVerifier: not authorized");
        require(verifier != msg.sender, "JEPVerifier: cannot remove self");
        
        delete authorizedVerifiers[verifier];
        emit VerifierRemoved(verifier, msg.sender);
    }
    
    /**
     * @notice Get verifier authorization status
     * @param verifier Address to check
     * @return bool True if authorized
     */
    function isAuthorized(address verifier) external view returns (bool) {
        return authorizedVerifiers[verifier];
    }
}
