"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Shield } from "lucide-react";
import { useAuction } from "@/app/hooks/useAuction";
import { toast } from "sonner";

export default function LandingPage() {
  const { state, connectWallet } = useAuction();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  // Redirect to dashboard if wallet is connected
  useEffect(() => {
    if (state.isConnected) {
      router.push("/dashboard");
    }
  }, [state.isConnected, router]);

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
      toast.success("Wallet connected successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("User Rejected")) {
        toast.error("Connection Rejected", {
          description: "You cancelled the connection request in your wallet",
        });
      } else if (errorMessage.includes("Popup Blocked")) {
        toast.error("Popup Blocked", {
          description: "Please allow popups for this site and try again",
        });
      } else if (errorMessage.includes("Wallet Not Found")) {
        toast.error("Wallet Not Found", {
          description: "Please install a Stellar wallet (Freighter, Albedo, or xBull)",
        });
      } else {
        toast.error("Connection Failed", {
          description: errorMessage,
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-50 flex flex-col items-center justify-center p-4">
      {/* Background Gradient Blur */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl space-y-8 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
            <Zap className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Auction Pulse
            </span>
          </h1>
          <p className="mt-4 text-xl text-slate-400">
            Real-time Blockchain Bidding on Stellar Network
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-lg text-slate-300">
            Connect your wallet and start bidding in real-time on the Stellar blockchain.
            Experience fast, secure, and transparent auctions powered by Soroban smart contracts.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-4"
            >
              <Shield className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-400">Secure</p>
              <p className="text-xs text-slate-400 mt-1">Smart contract powered</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-lg border border-blue-900/50 bg-blue-950/20 p-4"
            >
              <div className="h-6 w-6 mx-auto mb-2 text-blue-400 text-lg">🔗</div>
              <p className="text-sm font-semibold text-blue-400">Transparent</p>
              <p className="text-xs text-slate-400 mt-1">On-chain verification</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-lg border border-cyan-900/50 bg-cyan-950/20 p-4"
            >
              <Zap className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-cyan-400">Fast</p>
              <p className="text-xs text-slate-400 mt-1">Sub-second settlement</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Connect Wallet Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button
            onClick={handleConnectWallet}
            disabled={state.isLoading || isConnecting}
            className="mt-4 w-full rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 font-semibold text-slate-950 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-yellow-400 hover:to-orange-400 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300/60 active:scale-[0.98] disabled:opacity-50 sm:w-auto"
          >
            {state.isLoading || isConnecting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Connect Wallet
              </span>
            )}
          </button>
        </motion.div>

        {/* Error Message */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-red-900/50 bg-red-950/30 p-4"
          >
            <p className="text-sm text-red-400">
              {typeof state.error === 'string' ? state.error : String(state.error)}
            </p>
          </motion.div>
        )}

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-8 border-t border-slate-800"
        >
          <p className="text-sm text-slate-500">
            🌐 Stellar Testnet | Contract ID: {process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ID?.slice(0, 16)}...
          </p>
        </motion.div>
      </div>
    </main>
  );
}
