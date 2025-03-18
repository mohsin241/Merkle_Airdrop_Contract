import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import proofs from "./proofs.json";
import "./App.css";
import MerkleDistributorABI from "./MerkleDistributor.json";

// Contract configuration
const contractABI = MerkleDistributorABI.abi;
const contractAddress = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [merkleProof, setMerkleProof] = useState([]);
  const [isClaimed, setIsClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEligible, setIsEligible] = useState(null);
  const [showTokens, setShowTokens] = useState(false);

  // Initialize provider, signer, and contract
  useEffect(() => {
    const init = async () => {
      if (window.ethereum && account) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );

          setProvider(provider);
          setSigner(signer);
          setContract(contract);

          // Check eligibility after connecting
          checkEligibility(account);
        } catch (error) {
          console.error("Error initializing:", error);
          disconnectWallet();
        }
      }
    };

    init();
  }, [account]);

  // Connect wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount("");
    setProvider(null);
    setSigner(null);
    setContract(null);
    setMerkleProof([]);
    setIsClaimed(false);
    setIsEligible(null);
  };

  // Check if the user's address is eligible for the airdrop
  const checkEligibility = (address) => {
    const userProof = proofs.find((p) => p.address.toLowerCase() === address.toLowerCase());
    
    if (userProof) {
      setMerkleProof(userProof.proof);
      setIsEligible(true);
      checkIfClaimed();
    } else {
      setIsEligible(false);
    }
  };

  // Check if the user has already claimed
  const checkIfClaimed = async () => {
    if (contract && account) {
      try {
        const claimed = await contract.isClaimed(account);
        setIsClaimed(claimed);
      } catch (error) {
        console.error("Error checking claim status:", error);
      }
    }
  };

  // Claim tokens
  const claimTokens = async () => {
    if (!contract || !merkleProof.length) return;

    setLoading(true);
    try {
      const tx = await contract.claim(merkleProof);
      await tx.wait();
      setIsClaimed(true);
      
      // Show falling tokens animation
      setShowTokens(true);
      setTimeout(() => setShowTokens(false), 4000);
      
    } catch (error) {
      console.error("Error claiming tokens:", error);
      alert("Failed to claim tokens. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Generate random gold coins for animation
  const renderGoldCoins = () => {
    const coins = [];
    for (let i = 0; i < 30; i++) {
      const leftPos = Math.random() * 100;
      const delay = Math.random() * 2;
      const size = Math.random() * 30 + 20;
      const rotation = Math.random() * 360;
      
      coins.push(
        <div
          key={i}
          className="absolute animate-fall"
          style={{
            left: `${leftPos}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${delay}s`,
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#FFD700" stroke="#F0B90B" strokeWidth="4" />
            <circle cx="50" cy="50" r="35" fill="#F0B90B" />
            <path d="M50 25 L60 40 L75 45 L60 60 L65 75 L50 65 L35 75 L40 60 L25 45 L40 40 Z" fill="#FFD700" />
          </svg>
        </div>
      );
    }
    return coins;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-600 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Falling gold coins animation */}
      {showTokens && renderGoldCoins()}
      
      <div className="max-w-md w-full bg-purple-800 bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-purple-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6 text-purple-200">Merkle Distributor Airdrop</h1>
          
          {!account ? (
            <button 
              onClick={connectWallet}
              className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-400 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="mb-6 p-2 bg-purple-700 rounded-lg">
                <p className="text-sm font-medium">Connected Account:</p>
                <p className="font-mono text-purple-200 truncate">{account}</p>
                <button 
                  onClick={disconnectWallet}
                  className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm transition-colors duration-200"
                >
                  Disconnect
                </button>
              </div>

              {isEligible === null ? (
                <div className="flex justify-center my-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-200"></div>
                </div>
              ) : isEligible ? (
                isClaimed ? (
                  <div className="bg-purple-700 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <p className="text-yellow-300 font-medium">You have already claimed your tokens!</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={claimTokens}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Claiming...
                      </>
                    ) : (
                      "Claim Tokens"
                    )}
                  </button>
                )
              ) : (
                <div className="bg-purple-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <p className="text-red-300 font-medium">Your address is not eligible for this airdrop</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="mt-8 text-center text-purple-300 text-sm">
            <p>Check eligibility and claim your airdrop tokens</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;