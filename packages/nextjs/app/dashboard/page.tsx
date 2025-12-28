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
      {isConnected ? (
        <div className="mb-8">
          <UserActivityCard />
        </div>
      ) : (
        <div className="mb-8">
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">Connect your wallet to see personalized activity</h3>
              <div className="text-sm">
                You can still view all events below, but connecting your wallet will highlight your transactions and
                show your activity summary.
              </div>
            </div>
          </div>
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
