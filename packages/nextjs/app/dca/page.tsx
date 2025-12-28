"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { CreateDCAOrder } from "~~/components/dca/CreateDCAOrder";
import { DCAExecutionsTable } from "~~/components/dca/DCAExecutionsTable";
import { DCAOrdersTable } from "~~/components/dca/DCAOrdersTable";

export default function DCAPage() {
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<"create" | "orders" | "executions">("create");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">🔄 DCA Automation</h1>
            <p className="text-gray-600">Create recurring buy orders powered by ERC-7715 Advanced Permissions</p>
          </div>
          <Link href="/dashboard" className="btn btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Connection Required */}
      {!isConnected && (
        <div className="alert alert-warning mb-8">
          <span>⚠️ Please connect your wallet to create and manage DCA orders.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-8">
        <button className={`tab ${activeTab === "create" ? "tab-active" : ""}`} onClick={() => setActiveTab("create")}>
          ➕ Create Order
        </button>
        <button className={`tab ${activeTab === "orders" ? "tab-active" : ""}`} onClick={() => setActiveTab("orders")}>
          📋 My Orders
        </button>
        <button
          className={`tab ${activeTab === "executions" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("executions")}
        >
          📊 Execution History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "create" && (
        <div className="mb-12">
          <CreateDCAOrder />
        </div>
      )}

      {activeTab === "orders" && (
        <div className="mb-12">
          <DCAOrdersTable />
        </div>
      )}

      {activeTab === "executions" && (
        <div className="mb-12">
          <DCAExecutionsTable />
        </div>
      )}

      {/* Info Section */}
      <div className="card bg-base-200 mt-8">
        <div className="card-body">
          <h3 className="card-title">How DCA Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="badge badge-primary badge-lg">1</div>
              <div>
                <h4 className="font-semibold">Create Order</h4>
                <p className="text-sm text-base-content/70">Set your token pair, amount, and frequency</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="badge badge-secondary badge-lg">2</div>
              <div>
                <h4 className="font-semibold">Grant Permission</h4>
                <p className="text-sm text-base-content/70">Approve spending via ERC-7715</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="badge badge-accent badge-lg">3</div>
              <div>
                <h4 className="font-semibold">Auto Execute</h4>
                <p className="text-sm text-base-content/70">Orders execute automatically on schedule</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
