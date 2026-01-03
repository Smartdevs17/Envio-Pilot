import { parseEther } from "viem";

/**
 * Contract execution service for AI agent
 * Handles smart contract interactions triggered by AI
 */

const ENVIO_PILOT_ADDRESS = "0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB";

// Contract ABI for DCA orders
const DCA_ABI = [
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

// Contract ABI for trades
const TRADE_ABI = [
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

/**
 * Parse natural language to extract DCA parameters
 */
export function parseDCAIntent(message: string): {
  amount?: string;
  interval?: string;
  tokenPair?: string;
} | null {
  const lowerMsg = message.toLowerCase();

  // Extract amount
  const amountMatch = lowerMsg.match(/\$?(\d+(?:\.\d+)?)/);
  const amount = amountMatch ? amountMatch[1] : undefined;

  // Extract interval
  let interval = "daily"; // default
  if (lowerMsg.includes("hour")) interval = "hourly";
  else if (lowerMsg.includes("day") || lowerMsg.includes("daily")) interval = "daily";
  else if (lowerMsg.includes("week")) interval = "weekly";
  else if (lowerMsg.includes("month")) interval = "monthly";

  // Extract token pair
  let tokenPair = "ETH/USDC"; // default
  if (lowerMsg.includes("eth") && lowerMsg.includes("dai")) tokenPair = "ETH/DAI";
  else if (lowerMsg.includes("usdc") && lowerMsg.includes("eth")) tokenPair = "USDC/ETH";
  else if (lowerMsg.includes("wbtc")) tokenPair = "WBTC/ETH";

  return amount ? { amount, interval, tokenPair } : null;
}

/**
 * Convert interval string to seconds
 */
export function intervalToSeconds(interval: string): number {
  switch (interval.toLowerCase()) {
    case "hourly":
      return 3600;
    case "daily":
      return 86400;
    case "weekly":
      return 604800;
    case "monthly":
      return 2592000;
    default:
      return 86400;
  }
}

/**
 * Prepare DCA order transaction data
 */
export function prepareDCATransaction(params: {
  amount: string;
  interval: string;
  tokenPair: string;
  totalExecutions?: number;
}) {
  const amountWei = parseEther(params.amount);
  const intervalSeconds = BigInt(intervalToSeconds(params.interval));
  const executions = BigInt(params.totalExecutions || 30);

  return {
    address: ENVIO_PILOT_ADDRESS as `0x${string}`,
    abi: DCA_ABI,
    functionName: "createDCAOrder" as const,
    args: [params.tokenPair, amountWei, intervalSeconds, executions] as const,
  };
}

/**
 * Prepare trade transaction data
 */
export function prepareTradeTransaction(params: { fromAmount: string; actionType: "trade" | "swap" | "transfer" }) {
  const fromAmount = parseEther(params.fromAmount);

  // Calculate output based on action type
  let toAmount: bigint;
  switch (params.actionType) {
    case "trade":
      toAmount = (fromAmount * BigInt(95)) / BigInt(100); // 5% fee
      break;
    case "swap":
      toAmount = (fromAmount * BigInt(98)) / BigInt(100); // 2% slippage
      break;
    case "transfer":
      toAmount = fromAmount; // 1:1
      break;
  }

  return {
    address: ENVIO_PILOT_ADDRESS as `0x${string}`,
    abi: TRADE_ABI,
    functionName: "executeTrade" as const,
    args: [fromAmount, toAmount] as const,
  };
}
