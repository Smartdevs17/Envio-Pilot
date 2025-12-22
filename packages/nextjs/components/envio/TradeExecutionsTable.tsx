"use client";

import { useState } from "react";
import { useTradeExecutions } from "~~/hooks/useEnvioData";
import { TradeFilters } from "~~/lib/envio/queries";

interface TradeExecutionsTableProps {
  highlightAddress?: string;
}

export function TradeExecutionsTable({ highlightAddress }: TradeExecutionsTableProps) {
  const [userAddressFilter, setUserAddressFilter] = useState("");
  const [minFromAmount, setMinFromAmount] = useState("");
  const [maxFromAmount, setMaxFromAmount] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filters: TradeFilters = {
    userAddress: userAddressFilter || undefined,
    minFromAmount: minFromAmount ? (BigInt(minFromAmount) * BigInt(10 ** 18)).toString() : undefined,
    maxFromAmount: maxFromAmount ? (BigInt(maxFromAmount) * BigInt(10 ** 18)).toString() : undefined,
    sortOrder,
  };

  const { data: trades, loading, error, refetch } = useTradeExecutions(filters);

  const handleClearFilters = () => {
    setUserAddressFilter("");
    setMinFromAmount("");
    setMaxFromAmount("");
    setSortOrder("desc");
  };

  const toggleSort = () => {
    setSortOrder(prev => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="card bg-base-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* User Address Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Filter by User Address</span>
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered w-full"
              value={userAddressFilter}
              onChange={e => setUserAddressFilter(e.target.value)}
            />
          </div>

          {/* Min Amount Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Min From Amount (ETH)</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 10"
              className="input input-bordered w-full"
              value={minFromAmount}
              onChange={e => setMinFromAmount(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>

          {/* Max Amount Filter */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Max From Amount (ETH)</span>
            </label>
            <input
              type="number"
              placeholder="e.g., 100"
              className="input input-bordered w-full"
              value={maxFromAmount}
              onChange={e => setMaxFromAmount(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>

          {/* Actions */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Actions</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={toggleSort}
                className="btn btn-outline flex-1"
                title={`Sort ${sortOrder === "desc" ? "Oldest First" : "Newest First"}`}
              >
                {sortOrder === "desc" ? "↓ Newest" : "↑ Oldest"}
              </button>
              <button onClick={handleClearFilters} className="btn btn-ghost" title="Clear all filters">
                Clear
              </button>
              <button onClick={refetch} className="btn btn-primary" disabled={loading}>
                {loading ? "..." : "↻"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-8">
          <span className="loading loading-spinner loading-md"></span>
          <span>Loading trade executions...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          <span>❌ Error: {error.message}</span>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && trades && (
        <div>
          <p className="mb-4 text-sm text-gray-600">
            Found {trades.length} trade execution{trades.length !== 1 ? "s" : ""}
          </p>
          {trades.length === 0 ? (
            <div className="alert alert-info">
              <span>No trade executions found matching your filters.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>From Amount</th>
                    <th>To Amount</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map(trade => {
                    const isUserRow = highlightAddress && trade.user.toLowerCase() === highlightAddress.toLowerCase();
                    return (
                      <tr key={trade.id} className={isUserRow ? "bg-primary/10 border-l-4 border-l-primary" : ""}>
                        <td className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://sepolia.etherscan.io/address/${trade.user}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary"
                            >
                              {trade.user.slice(0, 6)}...{trade.user.slice(-4)}
                            </a>
                            {isUserRow && <span className="badge badge-primary badge-sm">You</span>}
                          </div>
                        </td>
                        <td className="font-semibold">
                          {(BigInt(trade.fromAmount) / BigInt(10 ** 18)).toString()} ETH
                        </td>
                        <td className="font-semibold text-success">
                          {(BigInt(trade.toAmount) / BigInt(10 ** 18)).toString()} ETH
                        </td>
                        <td className="text-sm">{new Date(Number(trade.timestamp) * 1000).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
