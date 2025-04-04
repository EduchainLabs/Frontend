"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import {
  Moon,
  Sun,
  ChevronLeft,
  Clock,
  User,
  ExternalLink,
  Award,
  FileCode,
  Tag,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/utils/contract_constants2";
import themeConfig from "@/utils/beforeMount";

interface Challenge {
  challengeId: number;
  creator: string;
  creatorName: string;
  bountyAmount: number;
  title: string;
  description: string;
  problemStatement: string;
  requirements: string;
  tags: string[];
  challengeStatus: Status;
  submissionsCount: number;
  startTime: number;
  duration: number;
  winner: string | null;
}

type ThemeMode = "dark" | "light";
type ValidationStatus = null | "validating" | "valid" | "invalid";

interface ValidationResult {
  status: boolean;
  syntax_correct: boolean;
  compilable_code: boolean;
  error: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

enum Status {
  waiting = 0,
  completed = 1,
  cancelled = 2,
  expired = 3,
}

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;
  const { beforeMount, darkColors, lightColors } = themeConfig;
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>(
    "// Write your Solidity code here\npragma solidity ^0.8.0;\n\ncontract Solution {\n    \n}"
  );
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Theme color configurations
  // const darkColors = {
  //   primary: "#7C3AED", // Violet-600
  //   primaryHover: "#6D28D9", // Violet-700
  //   accent: "#8B5CF6", // Violet-500
  //   background: "#0F0F0F", // Near black
  //   cardBg: "#1A1A1A", // Dark gray
  //   cardBgSecondary: "#212121", // Slightly lighter dark gray
  //   borderColor: "#2D2D2D", // Medium gray
  //   accentBorder: "#7C3AED", // Violet-600
  //   textPrimary: "#F9FAFB", // Gray-50
  //   textSecondary: "#E5E7EB", // Gray-200
  //   textMuted: "#9CA3AF", // Gray-400
  //   textAccent: "#A78BFA", // Violet-400
  // };

  // const lightColors = {
  //   primary: "#7C3AED", // Keep violet as primary
  //   primaryHover: "#6D28D9", // Violet-700
  //   accent: "#111111", // Black accent
  //   background: "#F2E8FF", // Warmer pastel violet background
  //   cardBg: "#FAF3FF", // Warmer, lighter pastel violet for cards
  //   cardBgSecondary: "#EBE0FF", // Warmer secondary violet
  //   borderColor: "#D8CAF0", // Warmer violet border
  //   accentBorder: "#111111", // Black accent border
  //   textPrimary: "#2D2235", // Warm dark violet, almost black
  //   textSecondary: "#4A3960", // Warmer dark violet for secondary text
  //   textMuted: "#786A92", // Warmer medium violet for muted text
  //   textAccent: "#111111", // Black accent text
  // };

  // Get current theme colors
  const colors = theme === "dark" ? darkColors : lightColors;

  useEffect(() => {
    if (!challengeId) return;

    const fetchChallengeData = async () => {
      setIsLoading(true);
      try {
        // Check if Ethereum is available
        if (typeof window.ethereum !== "undefined") {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            provider
          );

          // Get challenge data
          const challengeData = await contract.challenges(
            parseInt(challengeId)
          );

          // Get remaining time
          const remainingTime = await contract.getChallengeRemainingTime(
            parseInt(challengeId)
          );

          // Check if this is a valid challenge
          if (challengeData.challengeId.toString() === "0") {
            setIsLoading(false);
            return; // Challenge not found
          }

          // Convert challenge data to match your UI format
          const formattedChallenge = {
            challengeId: Number(challengeData.challengeId),
            creator: challengeData.creator,
            creatorName: `${challengeData.creator.substring(
              0,
              6
            )}...${challengeData.creator.substring(38)}`,
            bountyAmount: Number(
              ethers.formatEther(challengeData.bountyAmount)
            ),
            title: challengeData.title,
            description: challengeData.description,
            problemStatement: "", // You might need to adjust your contract to include this
            requirements: challengeData.requirements,
            tags: ["Blockchain", "Smart Contract"], // You may need to adapt this
            challengeStatus: Number(challengeData.challengeStatus),
            submissionsCount: Number(challengeData.submissionsCount),
            startTime: Number(challengeData.startTime),
            duration: Number(challengeData.duration),
            winner: challengeData.winner,
          };

          setChallenge(formattedChallenge);
        }
      } catch (error) {
        console.error("Error fetching challenge:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallengeData();
  }, [challengeId]);

  useEffect(() => {
    // Update time remaining for active challenges
    if (!challenge) return;

    const updateTimeRemaining = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            provider
          );

          // Get remaining time directly from the contract
          const remainingTimeSeconds = await contract.getChallengeRemainingTime(
            challenge.challengeId
          );

          if (remainingTimeSeconds <= 0) {
            setTimeRemaining("Ended");
            return;
          }

          const days = Math.floor(remainingTimeSeconds / (24 * 60 * 60));
          const hours = Math.floor(
            (remainingTimeSeconds % (24 * 60 * 60)) / (60 * 60)
          );
          const minutes = Math.floor((remainingTimeSeconds % (60 * 60)) / 60);

          setTimeRemaining(`${days}d ${hours}h ${minutes}m remaining`);
        }
      } catch (error) {
        console.error("Error updating time remaining:", error);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [challenge]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const validateCode = async () => {
    if (!challenge) return;

    setValidationStatus("validating");
    setShowValidation(true);
    try {
      const response = await fetch("/api/validate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem_statement: JSON.stringify(challenge.requirements),
          code,
        }),
      });

      const data = await response.json();
      setValidationResult(data);
      setValidationStatus(data.status ? "valid" : "invalid");
    } catch (error) {
      console.error("Error validating code:", error);
      setValidationStatus("invalid");
    }
  };

  const submitSolution = async () => {
    if (!challenge || validationStatus !== "valid") return;

    try {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        // Create a hash of the solution
        const solutionHash = ethers.keccak256(ethers.toUtf8Bytes(code));

        // Submit solution to the contract
        const tx = await contract.submitSolution(
          challenge.challengeId,
          solutionHash
        );

        // Wait for transaction to be mined
        await tx.wait();

        // Show success message
        alert("Solution submitted successfully to the blockchain!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      alert(`Failed to submit solution: ${error}`);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const getStatusBadgeColor = (status: Status) => {
    switch (status) {
      case Status.waiting:
        return "#4ADE80"; // Amber
      case Status.expired:
        return "#FCD34D"; // Green
      case Status.completed:
        return "#60A5FA"; // Blue
      case Status.cancelled:
        return "#EF4444"; // Red
      default:
        return "#9CA3AF"; // Gray
    }
  };

  const getStatusText = (status: Status) => {
    switch (status) {
      case Status.waiting:
        return "Active";
      case Status.expired:
        return "Expired";
      case Status.completed:
        return "Completed";
      case Status.cancelled:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden transition-colors duration-300"
      style={{
        backgroundColor: colors.background,
        backgroundImage: `radial-gradient(${colors.accent}10 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        color: colors.textPrimary,
      }}
    >
      <div className="w-full max-w-7xl mx-auto p-4 flex flex-col">
        {/* Header with back button and theme toggle */}
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => router.push("/challenges")}
            variant="outline"
            className="flex items-center gap-2"
            style={{
              backgroundColor: "transparent",
              borderColor: colors.borderColor,
              color: colors.textPrimary,
            }}
          >
            <ChevronLeft size={16} />
            Back to Challenges
          </Button>

          <Button
            onClick={toggleTheme}
            variant="outline"
            className="p-2 rounded-full"
            style={{
              backgroundColor: "transparent",
              borderColor: colors.borderColor,
            }}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun size={20} color={colors.textPrimary} />
            ) : (
              <Moon size={20} color={colors.textPrimary} />
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
              style={{ borderColor: colors.accent }}
            ></div>
          </div>
        ) : challenge ? (
          <>
            {/* Side by Side Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Challenge Details */}
              <div className="flex flex-col">
                {/* Challenge Header */}
                <Card
                  className="p-6 mb-6 transition-colors duration-300 h-full"
                  style={{
                    backgroundColor: colors.cardBg,
                    borderColor: colors.borderColor,
                  }}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="px-3 py-1 text-sm font-medium rounded-full"
                              style={{
                                backgroundColor:
                                  getStatusBadgeColor(
                                    challenge.challengeStatus
                                  ) + "20",
                                color: getStatusBadgeColor(
                                  challenge.challengeStatus
                                ),
                                border: `1px solid ${getStatusBadgeColor(
                                  challenge.challengeStatus
                                )}`,
                              }}
                            >
                              {getStatusText(challenge.challengeStatus)}
                            </div>

                            <div
                              className="flex items-center text-sm"
                              style={{ color: colors.textSecondary }}
                            >
                              <Clock size={16} className="mr-1" />
                              {timeRemaining}
                            </div>
                          </div>

                          <h1
                            className="text-2xl md:text-3xl font-bold mb-2"
                            style={{ color: colors.textPrimary }}
                          >
                            {challenge.title}
                          </h1>

                          <div
                            className="flex items-center gap-4 text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            <div className="flex items-center gap-1">
                              <User size={16} />
                              <span>{challenge.creatorName}</span>
                              <span className="text-xs">
                                ({formatAddress(challenge.creator)})
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Award size={16} />
                              <span>{challenge.bountyAmount} EDU Bounty</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <FileCode size={16} />
                              <span>
                                {challenge.submissionsCount} Submissions
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 overflow-y-auto">
                        <div>
                          <h2
                            className="text-lg font-semibold mb-2"
                            style={{ color: colors.textPrimary }}
                          >
                            Description
                          </h2>
                          <p style={{ color: colors.textSecondary }}>
                            {challenge.description}
                          </p>
                        </div>

                        <div>
                          <h2
                            className="text-lg font-semibold mb-2"
                            style={{ color: colors.textPrimary }}
                          >
                            Problem Statement
                          </h2>
                          <p style={{ color: colors.textSecondary }}>
                            {challenge.problemStatement}
                          </p>
                        </div>

                        <div>
                          <h2
                            className="text-lg font-semibold mb-2"
                            style={{ color: colors.textPrimary }}
                          >
                            Requirements
                          </h2>
                          <p style={{ color: colors.textSecondary }}>
                            {challenge.requirements}
                          </p>
                        </div>

                        <div>
                          <h2
                            className="text-lg font-semibold mb-2"
                            style={{ color: colors.textPrimary }}
                          >
                            Tags
                          </h2>
                          <div className="flex flex-wrap gap-2">
                            {challenge.tags.map((tag, index) => (
                              <div
                                key={index}
                                className="px-3 py-1 rounded-full text-sm flex items-center"
                                style={{
                                  backgroundColor: colors.cardBgSecondary,
                                  color: colors.textAccent,
                                  border: `1px solid ${colors.borderColor}`,
                                }}
                              >
                                <Tag size={14} className="mr-1" />
                                {tag}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {challenge.challengeStatus === Status.waiting && (
                      <Button
                        onClick={submitSolution}
                        disabled={validationStatus !== "valid"}
                        className="hover:opacity-90 transition-opacity mt-6"
                        style={{
                          backgroundColor: colors.primary,
                          color:
                            theme === "dark" ? colors.textPrimary : "#ffffff",
                        }}
                      >
                        Submit Solution
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Column - Solution Editor */}
              {challenge.challengeStatus === Status.waiting && (
                <div className="flex flex-col">
                  <Card
                    className="p-6 transition-colors duration-300 h-full"
                    style={{
                      backgroundColor: colors.cardBg,
                      borderColor: colors.borderColor,
                    }}
                  >
                    <div className="mb-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div
                          className="w-1 h-6 mr-2 rounded"
                          style={{ backgroundColor: colors.accent }}
                        ></div>
                        <h2
                          className="text-xl font-bold"
                          style={{ color: colors.textPrimary }}
                        >
                          Solution Editor
                        </h2>
                      </div>
                      <Button
                        onClick={validateCode}
                        disabled={validationStatus === "validating"}
                        style={{
                          backgroundColor: colors.primary,
                          color:
                            theme === "dark" ? colors.textPrimary : "#ffffff",
                        }}
                        className="hover:opacity-90 transition-opacity"
                      >
                        {validationStatus === "validating"
                          ? "Validating..."
                          : "Validate Solution"}
                      </Button>
                    </div>

                    <div
                      className="flex-grow h-full rounded-md overflow-hidden border transition-colors duration-300"
                      style={{
                        borderColor: colors.borderColor,
                        minHeight: "calc(100vh - 250px)", // Dynamic height to fill available space
                      }}
                    >
                      <Editor
                        height="100%"
                        defaultLanguage="solidity"
                        value={code}
                        onChange={(value) => setCode(value || "")}
                        theme={
                          theme === "dark"
                            ? "solidityDarkTheme"
                            : "solidityLightTheme"
                        }
                        beforeMount={beforeMount}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontSize: 14,
                          wordWrap: "on",
                          fontFamily: "'Fira Code', monospace",
                        }}
                      />
                    </div>
                  </Card>
                </div>
              )}
            </div>

            {/* Slide-up Validation Panel */}
            <AnimatePresence>
              {showValidation && (
                <motion.div
                  initial={{ y: 300, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 300, opacity: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="fixed bottom-4 right-4 w-2/3 md:w-1/2 lg:w-1/3 rounded-lg shadow-lg z-10 p-4 transition-colors duration-300"
                  style={{
                    backgroundColor: colors.cardBgSecondary,
                    borderColor: colors.borderColor,
                    borderWidth: 1,
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div
                        className="w-1 h-6 mr-2 rounded"
                        style={{ backgroundColor: colors.accent }}
                      ></div>
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        Validation Result
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowValidation(false)}
                      className="text-lg font-bold"
                      style={{ color: colors.textSecondary }}
                    >
                      ×
                    </button>
                  </div>

                  {validationResult ? (
                    <div
                      className="p-3 rounded transition-colors duration-300"
                      style={{
                        backgroundColor: validationResult.status
                          ? theme === "dark"
                            ? "#21211D"
                            : "#F0FDF4"
                          : theme === "dark"
                          ? "#252428"
                          : "#FEF2F2",
                        borderLeft: `4px solid ${
                          validationResult.status ? "#4ADE80" : "#EF4444"
                        }`,
                      }}
                    >
                      <p
                        className="font-medium mb-2"
                        style={{ color: colors.textPrimary }}
                      >
                        Status:{" "}
                        <span
                          style={{
                            color: validationResult.status
                              ? "#4ADE80"
                              : "#EF4444",
                          }}
                        >
                          {validationResult.status ? "Valid" : "Invalid"}
                        </span>
                      </p>
                      <p style={{ color: colors.textSecondary }}>
                        Syntax Correct:{" "}
                        <span
                          style={{
                            color: validationResult.syntax_correct
                              ? "#4ADE80"
                              : "#EF4444",
                          }}
                        >
                          {validationResult.syntax_correct ? "Yes" : "No"}
                        </span>
                      </p>
                      <p style={{ color: colors.textSecondary }}>
                        Compilable:{" "}
                        <span
                          style={{
                            color: validationResult.compilable_code
                              ? "#4ADE80"
                              : "#EF4444",
                          }}
                        >
                          {validationResult.compilable_code ? "Yes" : "No"}
                        </span>
                      </p>
                      {validationResult.error && (
                        <div
                          className="mt-2 p-3 rounded overflow-auto max-h-32 scrollbar-thin transition-colors duration-300"
                          style={{
                            backgroundColor:
                              theme === "dark" ? "#1A1A1A" : "#F9FAFB",
                          }}
                        >
                          <p style={{ color: colors.textSecondary }}>Error:</p>
                          <div
                            className="w-full h-32 rounded overflow-hidden mt-2 border transition-colors duration-300"
                            style={{
                              borderColor:
                                theme === "dark" ? "#2D2D2D" : "#E5E7EB",
                            }}
                          >
                            <Editor
                              height="100%"
                              defaultLanguage="solidity"
                              value={validationResult.error}
                              theme={
                                theme === "dark"
                                  ? "solidityDarkTheme"
                                  : "solidityLightTheme"
                              }
                              beforeMount={beforeMount}
                              options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 12,
                                wordWrap: "on",
                                lineNumbers: "off",
                                glyphMargin: false,
                                folding: false,
                                lineDecorationsWidth: 0,
                                lineNumbersMinChars: 0,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : validationStatus === "validating" ? (
                    <div className="flex items-center justify-center py-4">
                      <div
                        className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 transition-colors duration-300"
                        style={{ borderColor: colors.accent }}
                      ></div>
                      <span
                        className="ml-3"
                        style={{ color: colors.textSecondary }}
                      >
                        Validating your solution...
                      </span>
                    </div>
                  ) : (
                    <p style={{ color: colors.textMuted }}>
                      Click "Validate Solution" to check your code.
                    </p>
                  )}

                  {validationStatus === "valid" && (
                    <Button
                      onClick={submitSolution}
                      className="w-full mt-4 hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: colors.primary,
                        color:
                          theme === "dark" ? colors.textPrimary : "#ffffff",
                      }}
                    >
                      Submit Solution
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-xl mb-4" style={{ color: colors.textSecondary }}>
              Challenge not found
            </p>
            <Button
              onClick={() => router.push("/challenges")}
              style={{
                backgroundColor: colors.primary,
                color: theme === "dark" ? colors.textPrimary : "#ffffff",
              }}
            >
              View All Challenges
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
