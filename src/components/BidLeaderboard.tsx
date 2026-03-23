"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Bid } from "@/app/hooks/useAuction";

interface BidLeaderboardProps {
  bids: Bid[];
  userAddress?: string | null;
}

/**
 * BidLeaderboard component displaying recent bids with animations
 */
export function BidLeaderboard({ bids, userAddress }: BidLeaderboardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Update 'now' every second so relative times stay fresh
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  const formatTime = (timestamp: number) => {
    const diff = now - timestamp;

    if (diff < 60000) {
      return "just now";
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    }
    return new Date(timestamp).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };

  return (
    <motion.div
      className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-slate-200">Bid History</h3>
      </div>

      {bids.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-400">No bids yet. Place the first bid!</p>
        </div>
      ) : (
        <motion.div
          className="space-y-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {bids.map((bid, index) => {
              const isUserBid = bid.bidder === userAddress;
              const isTopBid = index === 0;

              return (
                <motion.div
                  key={bid.id || `${bid.bidder}-${bid.timestamp}`}
                  variants={itemVariants}
                  layout
                  className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                    isTopBid
                      ? "border-green-600/50 bg-green-950/30"
                      : "border-slate-700/50 bg-slate-800/30"
                  } ${isUserBid ? "ring-1 ring-blue-500/50" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm text-slate-400">
                        {formatAddress(bid.bidder)}
                      </p>
                      {isUserBid && (
                        <span className="inline-block rounded bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                          You
                        </span>
                      )}
                      {isTopBid && (
                        <span className="inline-block rounded bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
                          ★ Top
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatTime(bid.timestamp)}
                    </p>
                  </div>

                  <motion.div
                    className="ml-4 text-right"
                    layout
                  >
                    <p className={`font-mono font-bold ${
                      isTopBid ? "text-green-400" : "text-slate-300"
                    }`}>
                      {bid.amount} XLM
                    </p>
                    {isTopBid && (
                      <motion.div
                        className="flex justify-end gap-0.5"
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="h-1 w-1 rounded-full bg-green-400"
                          />
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
