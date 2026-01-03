"use client";

import Link from "next/link";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

/**
 * Minimal header for landing page (homepage)
 * Clean design without technical navigation
 */
export function LandingHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              EnvioPilot
            </span>
          </Link>

          {/* Simple CTA */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden md:block text-gray-600 hover:text-gray-900 font-medium">
              Dashboard
            </Link>
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}
