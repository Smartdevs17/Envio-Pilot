"use client";

import { useAccount } from "wagmi";
import { usePermissionGrants, useTradeExecutions } from "~~/hooks/useEnvioData";

export function UserActivityCard() {
  const { address } = useAccount();

  const { data: allPermissions } = usePermissionGrants();
  const { data: allTrades } = useTradeExecutions();

  if (!address) {
    return (
      <div className="card bg-base-200 p-6">
        <div className="text-center">
          <p className="text-base-content/60">Connect your wallet to see your activity</p>
        </div>
      </div>
    );
  }

  const userPermissions = allPermissions?.filter(p => p.user.toLowerCase() === address.toLowerCase()) || [];

  const userTrades = allTrades?.filter(t => t.user.toLowerCase() === address.toLowerCase()) || [];

  const lastActivity = [...userPermissions, ...userTrades].sort((a, b) => Number(b.timestamp) - Number(a.timestamp))[0];

  return (
    <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">👤 Your Activity</h3>
        <div className="badge badge-primary">Connected</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Permissions Count */}
        <div className="stat bg-base-100 rounded-lg p-4">
          <div className="stat-title text-sm">Permissions Granted</div>
          <div className="stat-value text-3xl text-primary">{userPermissions.length}</div>
          <div className="stat-desc">Total permissions</div>
        </div>

        {/* Trades Count */}
        <div className="stat bg-base-100 rounded-lg p-4">
          <div className="stat-title text-sm">Trades Executed</div>
          <div className="stat-value text-3xl text-secondary">{userTrades.length}</div>
          <div className="stat-desc">Total trades</div>
        </div>

        {/* Last Activity */}
        <div className="stat bg-base-100 rounded-lg p-4">
          <div className="stat-title text-sm">Last Activity</div>
          <div className="stat-value text-2xl">
            {lastActivity ? (
              <span className="text-accent">
                {new Date(Number(lastActivity.timestamp) * 1000).toLocaleDateString()}
              </span>
            ) : (
              <span className="text-base-content/40">None</span>
            )}
          </div>
          <div className="stat-desc">
            {lastActivity ? new Date(Number(lastActivity.timestamp) * 1000).toLocaleTimeString() : "No activity yet"}
          </div>
        </div>
      </div>

      {userPermissions.length === 0 && userTrades.length === 0 && (
        <div className="mt-4 p-4 bg-info/10 border border-info/20 rounded-lg">
          <p className="text-sm text-center">
            You have not granted any permissions or executed any trades yet.
            <br />
            <a href="/erc-7715-permissions" className="link link-primary mt-2 inline-block">
              Grant your first permission →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
