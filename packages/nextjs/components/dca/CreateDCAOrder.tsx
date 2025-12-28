"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

// Contract address (new deployment with DCA)
const CONTRACT_ADDRESS = "0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB";

// ABI for createDCAOrder function
const CREATE_DCA_ABI = [
  {
    inputs: [
      { name: "tokenPair", type: "string" },
      { name: "amountPerExecution", type: "uint256" },
      { name: "intervalSeconds", type: "uint256" },
      { name: "totalExecutions", type: "uint256" },
    ],
    name: "createDCAOrder",
    outputs: [{ name: "orderId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const TOKEN_PAIRS = [
  { value: "ETH/USDC", label: "ETH → USDC" },
  { value: "ETH/DAI", label: "ETH → DAI" },
  { value: "USDC/ETH", label: "USDC → ETH" },
  { value: "WBTC/ETH", label: "WBTC → ETH" },
];

const INTERVALS = [
  { value: 3600, label: "Hourly" },
  { value: 86400, label: "Daily" },
  { value: 604800, label: "Weekly" },
  { value: 2592000, label: "Monthly" },
];

export function CreateDCAOrder() {
  const { isConnected } = useAccount();
  const [tokenPair, setTokenPair] = useState("ETH/USDC");
  const [amountPerExecution, setAmountPerExecution] = useState("0.01");
  const [interval, setInterval] = useState(86400);
  const [totalExecutions, setTotalExecutions] = useState(30);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleCreateOrder = () => {
    if (!isConnected) return;

    const amountWei = parseEther(amountPerExecution);

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CREATE_DCA_ABI,
      functionName: "createDCAOrder",
      args: [tokenPair, amountWei, BigInt(interval), BigInt(totalExecutions)],
    });
  };

  const totalAmount = parseFloat(amountPerExecution) * totalExecutions;
  const intervalLabel = INTERVALS.find(i => i.value === interval)?.label || "Custom";

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">➕ Create DCA Order</h2>

        {!isConnected ? (
          <div className="alert alert-info">
            <span>Connect your wallet to create a DCA order</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Token Pair */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Token Pair</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={tokenPair}
                onChange={e => setTokenPair(e.target.value)}
              >
                {TOKEN_PAIRS.map(pair => (
                  <option key={pair.value} value={pair.value}>
                    {pair.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Per Execution */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Amount Per Execution (ETH)</span>
              </label>
              <input
                type="number"
                placeholder="0.01"
                className="input input-bordered w-full"
                value={amountPerExecution}
                onChange={e => setAmountPerExecution(e.target.value)}
                min="0.001"
                step="0.001"
              />
            </div>

            {/* Interval */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Execution Frequency</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={interval}
                onChange={e => setInterval(Number(e.target.value))}
              >
                {INTERVALS.map(int => (
                  <option key={int.value} value={int.value}>
                    {int.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Executions */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Number of Executions</span>
              </label>
              <input
                type="number"
                placeholder="30"
                className="input input-bordered w-full"
                value={totalExecutions}
                onChange={e => setTotalExecutions(Number(e.target.value))}
                min="1"
                max="365"
              />
            </div>

            {/* Summary Card */}
            <div className="card bg-base-200">
              <div className="card-body py-4">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-base-content/70">Token Pair:</span>
                  <span className="font-semibold">{tokenPair}</span>

                  <span className="text-base-content/70">Amount/Execution:</span>
                  <span className="font-semibold">{amountPerExecution} ETH</span>

                  <span className="text-base-content/70">Frequency:</span>
                  <span className="font-semibold">{intervalLabel}</span>

                  <span className="text-base-content/70">Total Executions:</span>
                  <span className="font-semibold">{totalExecutions}</span>

                  <span className="text-base-content/70">Total Amount:</span>
                  <span className="font-semibold text-primary">{totalAmount.toFixed(4)} ETH</span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-error">
                <span>Error: {error.message}</span>
              </div>
            )}

            {/* Success Display */}
            {isSuccess && (
              <div className="alert alert-success">
                <span>✅ DCA Order created successfully! Check the Orders tab to see it.</span>
              </div>
            )}

            {/* Create Button */}
            <button
              className="btn btn-primary btn-lg w-full"
              onClick={handleCreateOrder}
              disabled={isPending || isConfirming || !isConnected}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating Order...
                </>
              ) : isConfirming ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Confirming...
                </>
              ) : (
                "🚀 Create DCA Order"
              )}
            </button>

            {hash && (
              <div className="text-center text-sm">
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
        )}
      </div>
    </div>
  );
}
