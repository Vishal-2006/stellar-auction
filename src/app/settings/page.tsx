"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuction } from "@/app/hooks/useAuction";
import { toast } from "sonner";

function SettingsPageContent() {
  const { state, resetAuction, announceWinner, clearWinner, isAdmin, adminAddress } =
    useAuction();
  const [isResetting, setIsResetting] = useState(false);
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="mb-6 text-3xl font-bold text-slate-200">Settings</h1>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <h3 className="mb-4 font-semibold text-slate-200">Appearance</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Dark Mode</p>
                <p className="text-xs text-slate-500">Currently enabled</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-emerald-600" />
            </div>
          </div>
        </div>

        {/* Network Settings */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <h3 className="mb-4 font-semibold text-slate-200">Network</h3>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400">Current Network</p>
              <p className="text-sm text-emerald-400">Stellar Testnet</p>
            </div>

            <div className="h-px bg-slate-800" />

            <div>
              <p className="text-xs text-slate-400">RPC URL</p>
              <p className="font-mono text-xs text-slate-400 break-all">
                {process.env.NEXT_PUBLIC_SOROBAN_RPC_URL}
              </p>
            </div>

            <div className="h-px bg-slate-800" />

            <div>
              <p className="text-xs text-slate-400">Contract ID</p>
              <p className="font-mono text-xs text-slate-400 break-all">
                {process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ID}
              </p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <h3 className="mb-4 font-semibold text-slate-200">Account</h3>

          <div>
            <p className="text-xs text-slate-400">Status</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <p className="text-sm text-slate-300">
                {state.isConnected ? "Connected" : "Disconnected"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6">
          <h3 className="mb-2 font-semibold text-red-200">Auction Admin</h3>
          <p className="text-xs text-red-300">
            Admin wallet:{" "}
            <span className="font-mono">{adminAddress || "Not set"}</span>
          </p>
          <p className="mt-1 text-xs text-red-300">
            Current wallet:{" "}
            <span className="font-mono">{state.userAddress || "Not connected"}</span>
          </p>
          <p className="mt-2 text-xs text-red-300">
            Reset clears the current top bid on-chain. Winner announcement is
            stored in the UI for all users.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={async () => {
                if (!state.isConnected || isResetting || !isAdmin) return;
                setIsResetting(true);
                const hash = await resetAuction();
                if (hash) {
                  toast.success("Auction reset submitted", {
                    description: "Refresh the dashboard to see the reset state.",
                  });
                } else {
                  toast.error("Reset failed", {
                    description: "Unable to reset the auction on-chain.",
                  });
                }
                setIsResetting(false);
              }}
              disabled={!state.isConnected || isResetting || !isAdmin}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:opacity-50"
            >
              {isResetting ? "Resetting..." : "Reset Auction"}
            </button>

            <button
              onClick={async () => {
                if (!state.isConnected || isAnnouncing || !isAdmin) return;
                setIsAnnouncing(true);
                await announceWinner();
                toast.success("Winner announced", {
                  description: "The winner banner is now visible to everyone.",
                });
                setIsAnnouncing(false);
              }}
              disabled={!state.isConnected || isAnnouncing || !isAdmin}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
            >
              {isAnnouncing ? "Announcing..." : "Announce Winner"}
            </button>

            <button
              onClick={async () => {
                if (!state.isConnected || !isAdmin) return;
                await clearWinner();
                toast.message("Winner cleared");
              }}
              disabled={!state.isConnected || !isAdmin}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-600 disabled:opacity-50"
            >
              Clear Winner
            </button>
          </div>

          {!isAdmin && (
            <p className="mt-3 text-xs text-red-300">
              Only the admin wallet can reset or announce the winner.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <SettingsPageContent />
      </MainLayout>
    </ProtectedRoute>
  );
}
