"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { PermissionGrantsTable } from "~~/components/envio/PermissionGrantsTable";
import { TradeExecutionsTable } from "~~/components/envio/TradeExecutionsTable";
import { UserActivityCard } from "~~/components/envio/UserActivityCard";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [showOnlyMyActivity, setShowOnlyMyActivity] = useState(false);

  // If "My Activity" is enabled, use address as filter, otherwise undefined
  const highlightAddress = isConnected ? address : undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _filterAddress = showOnlyMyActivity && isConnected ? address : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">📊 EnvioPilot Dashboard</h1>
            <p className="text-gray-600">View and analyze indexed blockchain events from your EnvioPilot contract</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {isConnected && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={showOnlyMyActivity}
                  onChange={e => setShowOnlyMyActivity(e.target.checked)}
                />
                <span className="label-text font-semibold">My Activity Only</span>
              </label>
            )}
            <Link href="/erc-7715-permissions" className="btn btn-primary">
              🔐 Grant Permission
            </Link>
          </div>
        </div>
      </div>

      {/* User Activity Card */}
      {isConnected && (
        <div className="mb-8">
          <UserActivityCard />
        </div>
      )}

      {/* Permission Grants Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">📝 Permission Grants</h2>
        </div>
        <PermissionGrantsTable highlightAddress={highlightAddress} />
      </div>

      {/* Trade Executions Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold">💱 Trade Executions</h2>
        </div>
        <TradeExecutionsTable highlightAddress={highlightAddress} />
      </div>
    </div>
  );
}
