"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BoltIcon, ChartBarIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  const { isConnected } = useAccount();

  return (
    <>
      {/* Hero Section */}
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-center mb-8">
              <span className="block text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EnvioPilot
              </span>
              <span className="block text-2xl text-base-content/70">
                MetaMask Advanced Permissions + Envio HyperIndex
              </span>
            </h1>

            <p className="text-center text-lg max-w-3xl mb-8 text-base-content/80">
              Experience the future of Web3 with ERC-7715 Advanced Permissions and real-time blockchain event indexing.
              Grant permissions, execute transactions, and visualize on-chain activity—all in one seamless flow.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 mb-12">
              <Link href="/erc-7715-permissions" className="btn btn-primary btn-lg">
                🔐 Grant Permission
              </Link>
              <Link href="/dashboard" className="btn btn-outline btn-lg">
                📊 View Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-base-200 w-full py-16 px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                  <ShieldCheckIcon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="card-title text-lg">ERC-7715 Permissions</h3>
                  <p className="text-sm text-base-content/70">
                    Grant advanced permissions using MetaMask Flask cutting-edge ERC-7715 standard
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                  <BoltIcon className="h-12 w-12 text-secondary mb-4" />
                  <h3 className="card-title text-lg">Real-time Indexing</h3>
                  <p className="text-sm text-base-content/70">
                    Envio HyperIndex captures and indexes blockchain events in real-time with GraphQL
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                  <ChartBarIcon className="h-12 w-12 text-accent mb-4" />
                  <h3 className="card-title text-lg">Interactive Dashboard</h3>
                  <p className="text-sm text-base-content/70">
                    Filter, sort, and analyze indexed events with a beautiful, responsive interface
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                  <SparklesIcon className="h-12 w-12 text-info mb-4" />
                  <h3 className="card-title text-lg">User Highlighting</h3>
                  <p className="text-sm text-base-content/70">
                    See your own permissions and trades highlighted with personalized activity stats
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="w-full py-16 px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="badge badge-primary badge-lg">1</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Grant Permission</h3>
                  <p className="text-base-content/70">
                    Use MetaMask Flask to grant ERC-7715 permissions for executing transactions on your behalf
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="badge badge-secondary badge-lg">2</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Execute Transaction</h3>
                  <p className="text-base-content/70">
                    Your smart contract emits events when permissions are granted or trades are executed
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="badge badge-accent badge-lg">3</div>
                <div>
                  <h3 className="font-bold text-lg mb-2">View Indexed Events</h3>
                  <p className="text-base-content/70">
                    Envio indexes the events in real-time, and you can explore them on the interactive dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Get Started */}
            <div className="text-center mt-12">
              <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
                <div className="card-body">
                  <h3 className="card-title justify-center">Ready to Get Started?</h3>
                  <p className="text-base-content/70">
                    {isConnected
                      ? "You are connected! Grant your first permission or explore the dashboard."
                      : "Connect your wallet to begin exploring EnvioPilot."}
                  </p>
                  <div className="card-actions justify-center mt-4">
                    <Link href="/erc-7715-permissions" className="btn btn-primary">
                      Get Started →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
