"use client";

import { useAccount } from "wagmi";
import { DCAOrderExecuted, useDCAExecutions } from "~~/hooks/useDCAData";

export function DCAExecutionsTable() {
  const { address } = useAccount();
  const { data: executions, loading, error, refetch } = useDCAExecutions();

  // Filter to show only user's executions
  const userExecutions =
    executions?.filter((exec: DCAOrderExecuted) => exec.user.toLowerCase() === address?.toLowerCase()) || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">📊 Execution History</h3>
        <button onClick={refetch} className="btn btn-sm btn-outline" disabled={loading}>
          {loading ? "..." : "↻ Refresh"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <span className="loading loading-spinner loading-md"></span>
          <span>Loading executions...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <span>Error: {error.message}</span>
        </div>
      )}

      {/* No Executions */}
      {!loading && !error && userExecutions.length === 0 && (
        <div className="alert alert-info">
          <span>No executions yet. Orders will execute automatically based on their schedule.</span>
        </div>
      )}

      {/* Executions Table */}
      {!loading && !error && userExecutions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Execution #</th>
                <th>Amount In</th>
                <th>Amount Out</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {userExecutions.map((exec: DCAOrderExecuted) => (
                <tr key={exec.id}>
                  <td className="font-mono">#{exec.orderId.toString()}</td>
                  <td>
                    <span className="badge badge-secondary">#{exec.executionNumber.toString()}</span>
                  </td>
                  <td className="font-semibold">{(BigInt(exec.amountIn) / BigInt(10 ** 18)).toString()} ETH</td>
                  <td className="font-semibold text-success">
                    {(BigInt(exec.amountOut) / BigInt(10 ** 18)).toString()} ETH
                  </td>
                  <td className="text-sm">{new Date(Number(exec.timestamp) * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      {userExecutions.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body py-4">
            <div className="stats stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title">Total Executions</div>
                <div className="stat-value text-primary">{userExecutions.length}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Total Invested</div>
                <div className="stat-value text-secondary">
                  {userExecutions.reduce(
                    (sum: number, e: DCAOrderExecuted) => sum + Number(BigInt(e.amountIn) / BigInt(10 ** 18)),
                    0,
                  )}{" "}
                  ETH
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
