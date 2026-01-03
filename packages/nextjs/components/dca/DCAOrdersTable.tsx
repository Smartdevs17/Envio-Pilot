"use client";

import { useAccount, useWriteContract } from "wagmi";
import { DCAOrderCreated, useDCAExecutions, useDCAOrders } from "~~/hooks/useDCAData";

export function DCAOrdersTable() {
  const { address } = useAccount();
  const { data: orders, loading: ordersLoading, error, refetch: refetchOrders } = useDCAOrders();
  const { data: executions, loading: execsLoading, refetch: refetchExecs } = useDCAExecutions();
  const { writeContractAsync, isPending } = useWriteContract();

  const loading = ordersLoading || execsLoading;

  // Filter to show only user's orders
  const userOrders =
    orders?.filter((order: DCAOrderCreated) => order.user.toLowerCase() === address?.toLowerCase()) || [];

  const handleExecute = async (orderId: string) => {
    try {
      await writeContractAsync({
        address: "0xF6Ee0a3a8Ea1fE73D0DFfac8419bF676276D56cB",
        abi: [
          {
            inputs: [{ name: "orderId", type: "uint256" }],
            name: "executeDCAOrder",
            outputs: [],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "executeDCAOrder",
        args: [BigInt(orderId)],
      });
      // Refresh data after execution
      setTimeout(() => {
        refetchOrders();
        refetchExecs();
      }, 2000);
    } catch (err) {
      console.error("Execution error:", err);
    }
  };

  const refetchAll = () => {
    refetchOrders();
    refetchExecs();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">📋 Your DCA Orders</h3>
        <button onClick={refetchAll} className="btn btn-sm btn-outline" disabled={loading}>
          {loading ? "..." : "↻ Refresh"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <span className="loading loading-spinner loading-md"></span>
          <span>Loading orders...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <span>Error: {error.message}</span>
        </div>
      )}

      {/* No Orders */}
      {!loading && !error && userOrders.length === 0 && (
        <div className="alert alert-info">
          <span>You have no DCA orders yet. Create one to get started!</span>
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && userOrders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Token Pair</th>
                <th>Amount/Execution</th>
                <th>Frequency</th>
                <th>Progress</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userOrders.map((order: DCAOrderCreated) => {
                const intervalLabel = getIntervalLabel(Number(order.intervalSeconds));
                const orderExecutions = executions?.filter(e => e.orderId === order.orderId) || [];
                const completedCount = orderExecutions.length;
                return (
                  <tr key={order.id}>
                    <td className="font-mono">#{order.orderId.toString()}</td>
                    <td>
                      <span className="badge badge-primary">{order.tokenPair}</span>
                    </td>
                    <td className="font-semibold">
                      {(BigInt(order.amountPerExecution) / BigInt(10 ** 18)).toString()} ETH
                    </td>
                    <td>{intervalLabel}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <progress
                          className={`progress w-20 ${completedCount >= Number(order.totalExecutions) ? "progress-success" : "progress-primary"}`}
                          value={completedCount}
                          max={Number(order.totalExecutions)}
                        ></progress>
                        <span className="text-sm">
                          {completedCount}/{order.totalExecutions.toString()}
                        </span>
                      </div>
                    </td>
                    <td className="text-sm">{new Date(Number(order.timestamp) * 1000).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-xs btn-primary shadow-sm hover:scale-105 transition-all"
                        onClick={() => handleExecute(order.orderId)}
                        disabled={isPending || completedCount >= Number(order.totalExecutions)}
                      >
                        {isPending ? "..." : "⚡ Execute"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function getIntervalLabel(seconds: number): string {
  if (seconds === 3600) return "Hourly";
  if (seconds === 86400) return "Daily";
  if (seconds === 604800) return "Weekly";
  if (seconds === 2592000) return "Monthly";
  return `${seconds}s`;
}
