// components/CourseCompletion.jsx
"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/utils/contract_constants";
import { Award, ExternalLink } from "lucide-react";

interface CourseCompletionProps {
  courseId: string;
  metadataIndex: number;
}

// Declare window ethereum interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

const CourseCompletion: React.FC<CourseCompletionProps> = ({
  courseId,
  metadataIndex = 0,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [alreadyMinted, setAlreadyMinted] = useState(false);
  const { authState } = useOCAuth();

  useEffect(() => {
    const checkMintStatus = async () => {
      if (!authState.isAuthenticated || !window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        // Check if user already has an NFT
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );
        const hasMinted = await contract.hasMinted(address);

        setAlreadyMinted(hasMinted);
      } catch (err) {
        console.error("Error checking mint status:", err);
      }
    };

    checkMintStatus();
  }, [authState.isAuthenticated]);

  const mintCertificate = async () => {
    if (!authState.isAuthenticated) {
      setError("Please connect with OCID first");
      return;
    }

    if (!window.ethereum) {
      setError("Ethereum wallet not detected. Please install MetaMask.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Request account access
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();
      if (network.chainId.toString() !== "656476") {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xA045C" }],
        });
      }

      // Initialize contract with signer to send transactions
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Call the contract as the owner (this might need adjustments based on your deployment)
      // Check if the user already has minted
      const hasMinted = await contract.hasMinted(address);

      if (hasMinted) {
        setAlreadyMinted(true);
        setError("You have already received an NFT certificate");
        setIsLoading(false);
        return;
      }

      // Mint the certificate
      const tx = await contract.mintCertificate(address, metadataIndex);
      setTxHash(tx.hash);

      // Wait for transaction to be mined
      await tx.wait();

      setSuccess(true);
    } catch (err: any) {
      console.error("Error minting certificate:", err);
      setError(err.message || "Failed to mint certificate");
    } finally {
      setIsLoading(false);
    }
  };

  if (alreadyMinted) {
    return (
      <div className="bg-gray-900/60 border border-violet-900/30 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Award className="w-10 h-10 text-violet-400 mr-4" />
            <div>
              <h3 className="text-xl font-bold text-white">
                Certificate Already Claimed
              </h3>
              <p className="text-gray-400">
                You've already received an NFT certificate
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/60 border border-violet-900/30 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Award className="w-10 h-10 text-violet-400 mr-4" />
          <div>
            <h3 className="text-xl font-bold text-white">Course Completed!</h3>
            <p className="text-gray-400">
              Claim your NFT certificate to showcase your achievement
            </p>
          </div>
        </div>
        <button
          onClick={mintCertificate}
          disabled={isLoading || success}
          className={`px-5 py-2 rounded-md flex gap-2 justify-start items-center transition-all transform hover:scale-105 hover:shadow-lg ${
            isLoading
              ? "bg-gray-700 text-gray-300 cursor-wait"
              : success
              ? "bg-green-700 text-white"
              : "bg-violet-700 hover:bg-violet-600 text-white hover:shadow-violet-500/30"
          }`}
        >
          {isLoading
            ? "Processing..."
            : success
            ? "Certificate Claimed"
            : "Mint NFT Certificate"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded">
          <p className="text-green-400 font-medium">
            NFT Certificate successfully minted!
          </p>
          {txHash && (
            <a
              href={`https://explorer.edu-block.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center text-sm text-violet-400 hover:text-violet-300"
            >
              View on EduChain Explorer{" "}
              <ExternalLink className="ml-1 w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCompletion;
