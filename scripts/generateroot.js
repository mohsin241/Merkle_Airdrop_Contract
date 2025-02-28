const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { ethers } = require("ethers");
const fs = require("fs");

// Load addresses from a JSON file
const addresses = JSON.parse(fs.readFileSync(__dirname + "/addresses.json"));

// Convert addresses into leaf nodes
const leaves = addresses.map((addr) => keccak256(ethers.getAddress(addr)));

// Create the Merkle Tree
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

// Get the Merkle Root
const merkleRoot = merkleTree.getHexRoot();

console.log("Merkle Root:", merkleRoot);

// Generate proof for each address (optional, useful for testing)
const proofs = addresses.map((addr) => ({
  address: addr,
  proof: merkleTree.getHexProof(keccak256(ethers.getAddress(addr))),
}));

// Save proofs to a JSON file
fs.writeFileSync("C:/Users/mohsi/club_airdrop/frontend/src/proofs.json", JSON.stringify(proofs, null, 2));

console.log("Proofs generated and saved to proofs.json");
