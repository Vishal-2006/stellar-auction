"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface AuctionHeroProps {
  currentBidAmount: string;
  currentBidder: string;
  isPulsing?: boolean;
}

/**
 * AuctionHero component with animated pulse effect on new bids
 */
export function AuctionHero({
  currentBidAmount,
  currentBidder,
  isPulsing = false,
}: AuctionHeroProps) {
  const pulseVariants = {
    initial: { scale: 1, opacity: 1 },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 0.6,
      },
    },
  };

  const glowVariants = {
    initial: { boxShadow: "0 0 0 rgba(34, 197, 94, 0)" },
    pulse: {
      boxShadow: [
        "0 0 0 rgba(34, 197, 94, 0)",
        "0 0 40px rgba(34, 197, 94, 0.6)",
        "0 0 0 rgba(34, 197, 94, 0)",
      ],
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <motion.div
      className="w-full rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 text-center"
      variants={glowVariants}
      animate={isPulsing ? "pulse" : "initial"}
    >
      <div className="mb-4 flex items-center justify-center gap-2">
        <Zap className="h-5 w-5 text-yellow-400" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
          Live Auction
        </h2>
        <Zap className="h-5 w-5 text-yellow-400" />
      </div>

      <motion.div
        variants={pulseVariants}
        animate={isPulsing ? "pulse" : "initial"}
      >
        <div className="mb-6">
          <p className="mb-2 text-sm text-slate-400">Current Top Bid</p>
          <motion.p
            className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
            layout
          >
            {currentBidAmount} XLM
          </motion.p>
        </div>

        <div className="mb-4">
          <p className="text-xs text-slate-500">Leading Bidder</p>
          <p className="truncate font-mono text-sm text-slate-300">
            {currentBidder.substring(0, 8)}...
            {currentBidder.substring(currentBidder.length - 8)}
          </p>
        </div>
      </motion.div>

      {isPulsing && (
        <motion.div
          className="mt-4 text-xs font-semibold text-green-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ✓ New Bid Placed!
        </motion.div>
      )}
    </motion.div>
  );
}
