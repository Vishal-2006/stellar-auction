"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, TrendingUp } from "lucide-react";

interface BalanceCardProps {
  xlmBalance: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function BalanceCard({ xlmBalance, onRefresh, isLoading = false }: BalanceCardProps) {
  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch XLM/USD price from CoinGecko API
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setPriceLoading(true);
        const response = await fetch("/api/xlm-price", { cache: "no-store" });
        if (!response.ok) {
          // Keep last known price and avoid noisy console errors for rate limits.
          setPriceLoading(false);
          return;
        }
        const data = await response.json();
        setUsdPrice(data.usd ?? null);
      } catch (error) {
        console.warn("Failed to fetch XLM price:", error);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const balanceNum = parseFloat(xlmBalance || "0");
  const usdValue = usdPrice ? (balanceNum * usdPrice).toFixed(2) : null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-200">Your Balance</h3>
        <button
          onClick={handleRefresh}
          disabled={isLoading || priceLoading}
          className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-500/60 hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:opacity-50"
          title="Refresh balance and XLM price"
        >
          <RefreshCw
            className={`h-4 w-4 text-emerald-400 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* XLM Balance */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-emerald-400">
          {balanceNum.toFixed(2)}
        </span>
        <span className="text-lg text-slate-400">XLM</span>
      </div>

      {/* USD Value */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
        <TrendingUp className="h-4 w-4 text-emerald-400" />
        <div>
          <p className="text-xs text-slate-400">USD Value</p>
          <p className="font-mono font-semibold text-slate-200">
            {priceLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : usdValue ? (
              <>${usdValue}</>
            ) : (
              "N/A"
            )}
          </p>
        </div>
      </div>

      {/* Exchange Rate */}
      {usdPrice && (
        <div className="text-xs text-slate-500">
          1 XLM ≈ ${usdPrice.toFixed(4)} USD
        </div>
      )}
    </motion.div>
  );
}
