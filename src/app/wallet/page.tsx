"use client";

import { motion } from "framer-motion";
import { MainLayout } from "@/components/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BalanceCard } from "@/components/BalanceCard";
import { useAuction } from "@/app/hooks/useAuction";

function WalletPageContent() {
  const { state, refreshBalance } = useAuction();

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-200">Wallet</h1>
          <p className="text-slate-400">View your wallet details and balance</p>
        </div>

        <div className="space-y-6">
          {/* Balance */}
          {state.isConnected ? (
            <BalanceCard
              xlmBalance={state.userBalance}
              onRefresh={refreshBalance}
              isLoading={state.isLoading}
            />
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="text-6xl">🔓</div>
                <h2 className="text-xl font-semibold text-slate-300">
                  Connect Your Wallet
                </h2>
                <p className="text-slate-400">
                  Please connect your wallet to view balance details
                </p>
              </div>
            </div>
          )}

          {/* Wallet Details */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
            <h3 className="mb-4 font-semibold text-slate-200">Wallet Details</h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400">Address</p>
                <p className="mt-1 font-mono text-sm text-emerald-400 break-all">
                  {state.userAddress || "Not connected"}
                </p>
              </div>

              <div className="h-px bg-slate-800" />

              <div>
                <p className="text-xs text-slate-400">Provider</p>
                <p className="mt-1 text-sm text-slate-300">
                  {state.walletProvider || "Not connected"}
                </p>
              </div>

              <div className="h-px bg-slate-800" />

              <div>
                <p className="text-xs text-slate-400">Network</p>
                <p className="mt-1 text-sm text-slate-300">Stellar Testnet</p>
              </div>

              <div className="h-px bg-slate-800" />

              <div>
                <p className="text-xs text-slate-400">Status</p>
                <p className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      state.isConnected ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                  />
                  <span className="text-sm text-slate-300">
                    {state.isConnected ? "Connected" : "Disconnected"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletPageContent />
    </ProtectedRoute>
  );
}
