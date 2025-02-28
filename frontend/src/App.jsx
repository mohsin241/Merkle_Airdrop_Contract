
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import proofs from "./proofs.json"
import "./App.css";
import MerkleDistribuotrABI from "./MerkleDistributor.json"

// Replace with your contract ABI and address
const contractABI = MerkleDistribuotrABI.abi
const contractAddress = "0x67F74c2e897Dd53c2DA8DfE0dEfF791e8dEF3B44"; // Replace with your contract address

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [merkleProof, setMerkleProof] = useState([]);
  const [isClaimed, setIsClaimed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize provider, signer, and contract
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        setProvider(provider);
        setSigner(signer);
        setContract(contract);

        const address = await signer.getAddress();
        setAccount(address);
      } else {
        alert("Please install MetaMask!");
      }
    };

    init();
  }, []);

  // Fetch Merkle proof for the user
  const fetchMerkleProof = async () => {
    // Load proofs from the generated JSON file
    // const proofs = require("./proofs.json"); // Replace with the correct path
    const userProof = proofs.find((p) => p.address === account);

    if (userProof) {
      setMerkleProof(userProof.proof);
    } else {
      alert("Your address is not eligible for the airdrop.");
    }
  };

  // Check if the user has already claimed
  const checkIfClaimed = async () => {
    if (contract && account) {
      const claimed = await contract.isClaimed(account);
      setIsClaimed(claimed);
    }
  };

  // Claim tokens
  const claimTokens = async () => {
    if (!contract || !merkleProof.length) return;

    setLoading(true);
    try {
      const tx = await contract.claim(merkleProof);
      await tx.wait();
      alert("Tokens claimed successfully!");
      setIsClaimed(true);
    } catch (error) {
      console.error("Error claiming tokens:", error);
      alert("Failed to claim tokens. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Merkle Distributor Airdrop</h1>
        <p>Connected Account: {account}</p>

        {!isClaimed ? (
          <>
            <button onClick={fetchMerkleProof}>Fetch Merkle Proof</button>
            {merkleProof.length > 0 && (
              <button onClick={claimTokens} disabled={loading}>
                {loading ? "Claiming..." : "Claim Tokens"}
              </button>
            )}
          </>
        ) : (
          <p>You have already claimed your tokens.</p>
        )}
      </header>
    </div>
  );
}

export default App;