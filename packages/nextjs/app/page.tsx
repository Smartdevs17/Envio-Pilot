"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { LandingHeader } from "~~/components/LandingHeader";

const Home: NextPage = () => {
  const { isConnected } = useAccount();

  return (
    <>
      {/* Minimal Landing Header */}
      <LandingHeader />

      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-indigo-50 to-purple-50 pt-20">
        <div className="container mx-auto px-6 py-20">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Headline */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Automate Your Crypto Trading
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-2xl md:text-3xl text-gray-700 mb-8 font-light">
              Set it once, trade forever. All with proof.
            </p>

            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Tell our AI what to trade, when to trade, and how much. Never approve a transaction manually again. Every
              action is tracked and verified on the blockchain.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/ai"
                className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                🤖 Start with AI Assistant
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 text-lg font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200"
              >
                📊 View Live Dashboard
              </Link>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Every action verified on blockchain</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">Why Choose EnvioPilot?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-200">
                  🤖
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">AI-Powered Trading</h3>
              <p className="text-gray-600 leading-relaxed">
                Tell our AI what you want in plain English. &quot;Buy $50 ETH every week&quot; - that&apos;s it. No
                coding, no complexity.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-200">
                  📊
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Complete Transparency</h3>
              <p className="text-gray-600 leading-relaxed">
                See exactly what happened, when it happened, and verify it on the blockchain. No black boxes, no
                secrets.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-200">
                  ⚡
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Set & Forget</h3>
              <p className="text-gray-600 leading-relaxed">
                Approve once, trade for 30 days. No more clicking &quot;confirm&quot; on every single transaction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">How It Works</h2>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Connect Your Wallet</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Link your MetaMask wallet (takes 10 seconds). Your funds stay in your wallet - we never hold them.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Tell Our AI What You Want</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  &quot;Buy $100 of ETH every Monday&quot; or &quot;Invest $50 weekly&quot; - just type it in plain
                  English. The AI handles the rest.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Watch It Happen</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Your trades execute automatically. Every action is tracked on the blockchain and visible on your
                  dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Card */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-center text-white shadow-2xl">
              <h3 className="text-3xl font-bold mb-4">Ready to Automate Your Crypto?</h3>
              <p className="text-xl mb-8 opacity-90">
                {isConnected
                  ? "You're connected! Start chatting with the AI assistant."
                  : "Connect your wallet and start in under a minute."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/ai"
                  className="px-8 py-4 text-lg font-semibold bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  Get Started Free →
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-indigo-600 transition-all duration-200"
                >
                  See Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
