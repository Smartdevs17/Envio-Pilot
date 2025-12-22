"use client";

import { useState } from "react";
import { usePermissionGrants } from "~~/hooks/useEnvioData";
import { PermissionFilters } from "~~/lib/envio/queries";

interface PermissionGrantsTableProps {
  highlightAddress?: string;
}

export function PermissionGrantsTable({ highlightAddress }: PermissionGrantsTableProps) {
  const [permissionSearch, setPermissionSearch] = useState("");
  const [userAddressFilter, setUserAddressFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filters: PermissionFilters = {
    permission: permissionSearch || undefined,
    userAddress: userAddressFilter || undefined,
    sortOrder,
  };

  const { data: permissions, loading, error, refetch } = usePermissionGrants(filters);

  const handleClearFilters = () => {
    setPermissionSearch("");
    setUserAddressFilter("");
    setSortOrder("desc");
  };

  const toggleSort = () => {
    setSortOrder(prev => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="card bg-base-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Permission Search */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search Permission</span>
            </label>
            <input
              type="text"
              placeholder="e.g., TRADE, SWAP, TRANSFER"
              className="input input-bordered w-full"
              value={permissionSearch}
              onChange={e => setPermissionSearch(e.target.value)}
            />
          </div>

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
          <span>Loading permission grants...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          <span>❌ Error: {error.message}</span>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && permissions && (
        <div>
          <p className="mb-4 text-sm text-gray-600">
            Found {permissions.length} permission grant{permissions.length !== 1 ? "s" : ""}
          </p>
          {permissions.length === 0 ? (
            <div className="alert alert-info">
              <span>No permission grants found matching your filters.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Permission</th>
                    <th>Amount</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map(permission => {
                    const isUserRow =
                      highlightAddress && permission.user.toLowerCase() === highlightAddress.toLowerCase();
                    return (
                      <tr key={permission.id} className={isUserRow ? "bg-primary/10 border-l-4 border-l-primary" : ""}>
                        <td className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://sepolia.etherscan.io/address/${permission.user}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary"
                            >
                              {permission.user.slice(0, 6)}...{permission.user.slice(-4)}
                            </a>
                            {isUserRow && <span className="badge badge-primary badge-sm">You</span>}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-primary">{permission.permission}</span>
                        </td>
                        <td className="font-semibold">
                          {(BigInt(permission.amount) / BigInt(10 ** 18)).toString()} ETH
                        </td>
                        <td className="text-sm">{new Date(Number(permission.timestamp) * 1000).toLocaleString()}</td>
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
