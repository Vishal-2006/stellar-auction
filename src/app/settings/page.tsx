"use client";

import { motion } from "framer-motion";
import { MainLayout } from "@/components/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuction } from "@/app/hooks/useAuction";

function SettingsPageContent() {
  const { state } = useAuction();

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
