"use client";

import { motion } from "framer-motion";
import { MainLayout } from "@/components/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BidLeaderboard } from "@/components/BidLeaderboard";
import { useAuction } from "@/app/hooks/useAuction";

function HistoryPageContent() {
  const { state } = useAuction();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="mb-6 text-3xl font-bold text-slate-200">Bid History</h1>
      <BidLeaderboard bids={state.bids} userAddress={state.userAddress} />
    </motion.div>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <HistoryPageContent />
      </MainLayout>
    </ProtectedRoute>
  );
}
