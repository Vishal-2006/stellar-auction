"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { motion } from "framer-motion";
import { useAuction } from "@/app/hooks/useAuction";
import { MainLayout } from "@/components/MainLayout";
import { BalanceCard } from "@/components/BalanceCard";
import { AuctionHero } from "@/components/AuctionHero";
import { BidConsole } from "@/components/BidConsole";
import { BidLeaderboard } from "@/components/BidLeaderboard";
import { EventListener, useOutbidNotification } from "@/components/EventListener";

export default function Dashboard() {
  const { state, refreshBalance } = useAuction();
  const router = useRouter();
  const [isPulsing, setIsPulsing] = useState(false);
  const { showOutbidNotification } = useOutbidNotification();
  const lastBidRef = useRef<string | null>(null);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [, startTransition] = useTransition();

  // Redirect to home if wallet is not connected
  useEffect(() => {
    if (!state.isConnected && !state.isLoading) {
      router.push("/");
    }
  }, [state.isConnected, state.isLoading, router]);

  // Trigger pulse animation and notification when user is outbid
  useEffect(() => {
    if (
      state.topBid &&
      state.topBid.bidder !== state.userAddress &&
      state.topBid.amount !== lastBidRef.current
    ) {
      lastBidRef.current = state.topBid.amount;

      startTransition(() => {
        setIsPulsing(true);
      });

      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }

      showOutbidNotification(state.topBid.amount);

      pulseTimeoutRef.current = setTimeout(() => {
        startTransition(() => {
          setIsPulsing(false);
        });
      }, 2000);
    }

    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, [state.topBid, state.userAddress, showOutbidNotification, startTransition]);

  // Show loading state while checking wallet connection
  if (!state.isConnected && state.isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
            <p className="text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div>
          <h1 className="mb-2 text-4xl font-bold text-slate-200">Live Auction</h1>
          <p className="text-slate-400">Track the latest bids and place your offer</p>
        </div>

        {/* Main Grid */}
        <motion.div
          className="grid gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {/* Top Section - Auction Hero and Balance */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Auction Hero - 2 cols */}
            <motion.div className="lg:col-span-2">
              <AuctionHero
                currentBidAmount={state.topBid?.amount || "0"}
                currentBidder={state.topBid?.bidder || "..."}
                isPulsing={isPulsing}
              />
            </motion.div>

            {/* Balance Card - 1 col */}
            <motion.div>
              {state.isConnected ? (
                <BalanceCard
                  xlmBalance={state.userBalance}
                  onRefresh={refreshBalance}
                  isLoading={state.isLoading}
                />
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="text-5xl">🔓</div>
                    <h3 className="font-semibold text-slate-300">Connect Wallet</h3>
                    <p className="text-xs text-slate-500 text-center">
                      Connect your wallet to see balance
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Bid Console */}
          <motion.div>
            <BidConsole />
          </motion.div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-3">
            <motion.div
              className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-slate-400">Total Bids</p>
              <p className="mt-3 text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {state.bids.length}
              </p>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-slate-400">Highest Bid</p>
              <p className="mt-3 text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {state.topBid?.amount || "0"}
              </p>
              <p className="mt-1 text-xs text-slate-500">XLM</p>
            </motion.div>

            <motion.div
              className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6"
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm text-slate-400">Your Status</p>
              <p className="mt-3 flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${
                  state.isConnected ? "bg-emerald-500" : "bg-slate-600"
                }`} />
                <span className="text-lg font-bold text-slate-200">
                  {state.isConnected ? "Connected" : "Disconnected"}
                </span>
              </p>
            </motion.div>
          </div>

          {/* Bid Leaderboard */}
          <motion.div>
            <BidLeaderboard bids={state.bids} userAddress={state.userAddress} />
          </motion.div>
        </motion.div>
      </div>

      {/* Event Listener */}
      <EventListener userAddress={state.userAddress} />

      {/* Toast Container */}
      <Toaster position="top-right" theme="dark" richColors expand />
    </MainLayout>
  );
}
