"use client";

import { usePermissionGrants, useTradeExecutions } from "~~/hooks/useEnvioData";
import { getEnvioEndpoint } from "~~/lib/envio/client";

export default function TestEnvioPage() {
  const {
    data: permissions,
    loading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = usePermissionGrants();
  const { data: trades, loading: tradesLoading, error: tradesError, refetch: refetchTrades } = useTradeExecutions();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">🧪 Envio GraphQL Test Page</h1>
        <p className="text-gray-600 mb-2">
          Testing connection to Envio indexer at:{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">{getEnvioEndpoint()}</code>
        </p>
        <div className="flex gap-4">
          <button onClick={refetchPermissions} className="btn btn-primary btn-sm" disabled={permissionsLoading}>
            {permissionsLoading ? "Loading..." : "Refresh Permissions"}
          </button>
          <button onClick={refetchTrades} className="btn btn-primary btn-sm" disabled={tradesLoading}>
            {tradesLoading ? "Loading..." : "Refresh Trades"}
          </button>
        </div>
      </div>

      {/* Permission Grants Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">📝 Permission Grants</h2>

        {permissionsLoading && (
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-md"></span>
            <span>Loading permission grants...</span>
          </div>
        )}

        {permissionsError && (
          <div className="alert alert-error">
            <span>❌ Error: {permissionsError.message}</span>
          </div>
        )}

        {!permissionsLoading && !permissionsError && permissions && (
          <div>
            <p className="mb-4 text-sm text-gray-600">
              Found {permissions.length} permission grant{permissions.length !== 1 ? "s" : ""}
            </p>
            {permissions.length === 0 ? (
              <div className="alert alert-info">
                <span>No permission grants found. Run the emitEvents.js script to generate some!</span>
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
                    {permissions.map(permission => (
                      <tr key={permission.id}>
                        <td className="font-mono text-sm">{permission.user.slice(0, 10)}...</td>
                        <td className="font-semibold">{permission.permission}</td>
                        <td>{(BigInt(permission.amount) / BigInt(10 ** 18)).toString()} ETH</td>
                        <td>{new Date(Number(permission.timestamp) * 1000).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trade Executions Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">💱 Trade Executions</h2>

        {tradesLoading && (
          <div className="flex items-center gap-2">
            <span className="loading loading-spinner loading-md"></span>
            <span>Loading trade executions...</span>
          </div>
        )}

        {tradesError && (
          <div className="alert alert-error">
            <span>❌ Error: {tradesError.message}</span>
          </div>
        )}

        {!tradesLoading && !tradesError && trades && (
          <div>
            <p className="mb-4 text-sm text-gray-600">
              Found {trades.length} trade execution{trades.length !== 1 ? "s" : ""}
            </p>
            {trades.length === 0 ? (
              <div className="alert alert-info">
                <span>No trade executions found. Run the emitEvents.js script to generate some!</span>
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
                    {trades.map(trade => (
                      <tr key={trade.id}>
                        <td className="font-mono text-sm">{trade.user.slice(0, 10)}...</td>
                        <td>{(BigInt(trade.fromAmount) / BigInt(10 ** 18)).toString()} ETH</td>
                        <td>{(BigInt(trade.toAmount) / BigInt(10 ** 18)).toString()} ETH</td>
                        <td>{new Date(Number(trade.timestamp) * 1000).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Indicator */}
      {!permissionsLoading && !tradesLoading && !permissionsError && !tradesError && (
        <div className="alert alert-success">
          <span>✅ GraphQL client is working correctly! Connection to Envio indexer established.</span>
        </div>
      )}
    </div>
  );
}
