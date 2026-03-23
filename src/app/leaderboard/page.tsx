"use client";

import { motion } from "framer-motion";
import { MainLayout } from "@/components/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuction } from "@/app/hooks/useAuction";

type LeaderRow = {
  bidder: string;
  total: number;
  highest: number;
};

function LeaderboardPageContent() {
  const { state } = useAuction();

  const leaders = state.bids.reduce<LeaderRow[]>((acc, bid) => {
    const amount = parseFloat(bid.amount);
    if (Number.isNaN(amount)) return acc;
    const existing = acc.find((row) => row.bidder === bid.bidder);
    if (existing) {
      existing.total += amount;
      existing.highest = Math.max(existing.highest, amount);
    } else {
      acc.push({ bidder: bid.bidder, total: amount, highest: amount });
    }
    return acc;
  }, []);

  leaders.sort((a, b) => b.highest - a.highest);

  const formatAddress = (address: string) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="mb-6 text-3xl font-bold text-slate-200">Leaderboard</h1>

      {leaders.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
          <p className="text-center text-slate-400">No bids yet. Place the first bid!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaders.map((leader, index) => (
            <div
              key={leader.bidder}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/20 text-sm font-semibold text-emerald-300">
                  {index + 1}
                </div>
                <div>
                  <p className="font-mono text-sm text-slate-200">
                    {formatAddress(leader.bidder)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Total Bid Volume: {leader.total.toFixed(2)} XLM
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Highest Bid</p>
                <p className="font-mono text-lg font-bold text-emerald-400">
                  {leader.highest.toFixed(2)} XLM
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <LeaderboardPageContent />
      </MainLayout>
    </ProtectedRoute>
  );
}
