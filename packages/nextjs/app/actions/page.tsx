"use client";

import { useState } from "react";
import Link from "next/link";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

// Contract address
const ENVIO_PILOT_ADDRESS = "0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB";

// Contract ABI
const CONTRACT_ABI = [
  {
    inputs: [
      { name: "perm", type: "string" },
      { name: "amount", type: "uint256" },
    ],
    name: "grantPermission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "fromAmount", type: "uint256" },
      { name: "toAmount", type: "uint256" },
    ],
    name: "executeTrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

type ActionType = "trade" | "swap" | "transfer";

export default function ActionsPage() {
  const { isConnected } = useAccount();
  const [actionType, setActionType] = useState<ActionType>("trade");
  const [amount, setAmount] = useState("0.01");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleExecuteAction = () => {
    if (!isConnected) return;

    const fromAmount = parseEther(amount);
    // Simulate different rates for different action types
    let toAmount: bigint;

    switch (actionType) {
      case "trade":
        toAmount = (fromAmount * BigInt(95)) / BigInt(100); // 5% fee simulation
        break;
      case "swap":
        toAmount = (fromAmount * BigInt(98)) / BigInt(100); // 2% slippage simulation
        break;
      case "transfer":
        toAmount = fromAmount; // 1:1 for transfers
        break;
      default:
        toAmount = fromAmount;
    }

    writeContract({
      address: ENVIO_PILOT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "executeTrade",
      args: [fromAmount, toAmount],
    });
  };

  const getActionLabel = () => {
    switch (actionType) {
      case "trade":
        return "Execute Trade";
      case "swap":
        return "Execute Swap";
      case "transfer":
        return "Execute Transfer";
    }
  };

  const getActionEmoji = () => {
    switch (actionType) {
      case "trade":
        return "💱";
      case "swap":
        return "🔄";
      case "transfer":
        return "📤";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">⚡ Execute Actions</h1>
            <p className="text-gray-600">Execute trades, swaps, and transfers using your ERC-7715 permission</p>
          </div>
          <div className="flex gap-2">
            <Link href="/erc-7715-permissions" className="btn btn-outline">
              🔐 Grant Permission
            </Link>
            <Link href="/dashboard" className="btn btn-ghost">
              📊 Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Connection Warning */}
      {!isConnected && (
        <div className="alert alert-warning mb-8">
          <span>⚠️ Please connect your wallet to execute actions.</span>
        </div>
      )}

      {/* Main Card */}
      <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">Select Action Type</h2>

          {/* Action Type Selector */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              className={`btn btn-lg h-auto py-6 flex-col ${actionType === "trade" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setActionType("trade")}
            >
              <span className="text-3xl mb-2">💱</span>
              <span>Trade</span>
              <span className="text-xs opacity-70">5% fee</span>
            </button>
            <button
              className={`btn btn-lg h-auto py-6 flex-col ${actionType === "swap" ? "btn-secondary" : "btn-outline"}`}
              onClick={() => setActionType("swap")}
            >
              <span className="text-3xl mb-2">🔄</span>
              <span>Swap</span>
              <span className="text-xs opacity-70">2% slippage</span>
            </button>
            <button
              className={`btn btn-lg h-auto py-6 flex-col ${actionType === "transfer" ? "btn-accent" : "btn-outline"}`}
              onClick={() => setActionType("transfer")}
            >
              <span className="text-3xl mb-2">📤</span>
              <span>Transfer</span>
              <span className="text-xs opacity-70">1:1 rate</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-semibold">Amount (ETH)</span>
            </label>
            <input
              type="number"
              placeholder="0.01"
              className="input input-bordered w-full text-lg"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0.0001"
              step="0.001"
            />
          </div>

          {/* Preview */}
          <div className="card bg-base-200 mb-6">
            <div className="card-body py-4">
              <h3 className="font-semibold mb-2">Preview</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-base-content/70">From</p>
                  <p className="text-xl font-bold">{amount} ETH</p>
                </div>
                <div className="text-2xl">→</div>
                <div className="text-right">
                  <p className="text-sm text-base-content/70">To (estimated)</p>
                  <p className="text-xl font-bold text-success">
                    {actionType === "trade"
                      ? (parseFloat(amount) * 0.95).toFixed(6)
                      : actionType === "swap"
                        ? (parseFloat(amount) * 0.98).toFixed(6)
                        : amount}{" "}
                    ETH
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>Error: {error.message}</span>
            </div>
          )}

          {/* Success Display */}
          {isSuccess && (
            <div className="alert alert-success mb-4">
              <span>✅ {getActionLabel()} completed successfully! Check the dashboard.</span>
            </div>
          )}

          {/* Execute Button */}
          <button
            className={`btn btn-lg w-full ${
              actionType === "trade" ? "btn-primary" : actionType === "swap" ? "btn-secondary" : "btn-accent"
            }`}
            onClick={handleExecuteAction}
            disabled={isPending || isConfirming || !isConnected}
          >
            {isPending ? (
              <>
                <span className="loading loading-spinner"></span>
                Confirming...
              </>
            ) : isConfirming ? (
              <>
                <span className="loading loading-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                {getActionEmoji()} {getActionLabel()}
              </>
            )}
          </button>

          {hash && (
            <div className="text-center mt-4">
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary"
              >
                View on Etherscan →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="card bg-base-200 max-w-2xl mx-auto mt-8">
        <div className="card-body">
          <h3 className="card-title">How It Works</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="badge badge-primary badge-lg">1</div>
              <div>
                <h4 className="font-semibold">Grant Permission (Once)</h4>
                <p className="text-sm text-base-content/70">
                  Go to{" "}
                  <Link href="/erc-7715-permissions" className="link">
                    Permissions
                  </Link>{" "}
                  page to grant ERC-7715 spending permission
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="badge badge-secondary badge-lg">2</div>
              <div>
                <h4 className="font-semibold">Execute Actions (Anytime)</h4>
                <p className="text-sm text-base-content/70">
                  Use this page to execute trades, swaps, or transfers as many times as you want
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="badge badge-accent badge-lg">3</div>
              <div>
                <h4 className="font-semibold">View on Dashboard</h4>
                <p className="text-sm text-base-content/70">
                  All actions are indexed by Envio and visible on the{" "}
                  <Link href="/dashboard" className="link">
                    Dashboard
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
