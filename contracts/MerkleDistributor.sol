// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

error AlreadyClaimed();
error InvalidProof();

contract MerkleDistributor {
    using SafeERC20 for IERC20;

    address public immutable token;
    bytes32 public immutable merkleRoot;
    uint256 public immutable dropAmount;

    mapping(address => bool) private addressClaimed;

    event Claimed(address indexed claimant, uint256 amount);

    constructor(address token_, bytes32 merkleRoot_, uint256 dropAmount_) {
        token = token_;
        merkleRoot = merkleRoot_;
        dropAmount = dropAmount_;
    }

    function claim(bytes32[] calldata merkleProof) external {
        if (addressClaimed[msg.sender]) revert AlreadyClaimed();

        // Verify the Merkle proof
        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();

        // ✅ Fix: Mark as claimed with correct assignment
        addressClaimed[msg.sender] = true;
        
        IERC20(token).safeTransfer(msg.sender, dropAmount);

        emit Claimed(msg.sender, dropAmount);
    }

    function isClaimed(address user) external view returns (bool) {
        return addressClaimed[user];
    }
}
