"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, AlertCircle, Wallet, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuction } from "@/app/hooks/useAuction";
import { useOutbidNotification } from "@/components/EventListener";

export function BidConsole() {
  const { state, connectWallet, placeBid, disconnect } = useAuction();
  const { showBidPlacedNotification } = useOutbidNotification();
  const [bidInput, setBidInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConnectWallet = async () => {
    try {
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
          description:
            "Please install Freighter or Albedo wallet extension",
        });
      } else {
        toast.error("Connection Failed", {
          description: errorMessage,
        });
      }

    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bidInput.trim()) {
      toast.error("Please enter a bid amount");
      return;
    }

    const bidAmount = parseFloat(bidInput);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast.error("Invalid Bid Amount", {
        description: "Please enter a valid positive number",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const topBidAmount = parseFloat(state.topBid?.amount || "0");
      const userBalance = parseFloat(state.userBalance);

      // Pre-validation checks
      if (bidAmount > userBalance) {
        toast.error("Insufficient Balance", {
          description: `Your balance is ${state.userBalance} XLM, but you're trying to bid ${bidAmount} XLM`,
          duration: 5000,
        });
        setIsSubmitting(false);
        return;
      }

      if (bidAmount <= topBidAmount) {
        toast.error("Bid Too Low", {
          description: `Bid must be higher than the current top bid of ${state.topBid?.amount || "0"} XLM`,
        });
        setIsSubmitting(false);
        return;
      }

      // Attempt to place bid
      const result = await placeBid(bidInput);

      if (result) {
        if (result.status === "SUCCESS") {
          showBidPlacedNotification(bidAmount.toString(), result.hash);
        } else {
          toast.message("Bid submitted", {
            description: "Transaction is pending confirmation on the network.",
          });
        }
        setBidInput("");
      } else if (state.error?.includes("Insufficient Balance")) {
        toast.error("Insufficient Balance", {
          description: `Your balance is ${state.userBalance} XLM, but you're trying to bid ${bidAmount} XLM`,
          duration: 5000,
        });
      } else if (state.error?.includes("Transaction Rejected")) {
        toast.error("Transaction Rejected", {
          description: "You cancelled the transaction in your wallet",
        });
      } else if (state.error?.includes("Wallet Not Found")) {
        toast.error("Wallet Not Found", {
          description: "Your wallet extension is no longer connected",
        });
      } else {
        toast.error("Bid Failed", {
          description: state.error || "An error occurred while placing your bid",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("Insufficient Balance")) {
        toast.error("Insufficient Balance", {
          description: "Your wallet balance is too low for this bid",
          duration: 5000,
        });
      } else if (errorMessage.includes("Transaction Rejected")) {
        toast.error("Transaction Rejected", {
          description: "You cancelled the transaction in your wallet",
        });
      } else if (errorMessage.includes("Wallet Not Found")) {
        toast.error("Wallet Not Found", {
          description: "Please reconnect your wallet",
        });
      } else {
        toast.error("Error", {
          description: errorMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state.isConnected) {
    return (
      <motion.div
        className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center gap-4 py-8">
          <Wallet className="h-12 w-12 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-200">
            Connect Your Wallet
          </h3>
          <p className="text-center text-sm text-slate-400">
            Connect your Freighter or Albedo wallet to start bidding
          </p>
          <button
            onClick={handleConnectWallet}
            className="mt-4 w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 active:scale-[0.98]"
          >
            Connect Wallet
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-200">Place a Bid</h3>
        <button
          onClick={disconnect}
          className="rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-800/70 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          Disconnect
        </button>
      </div>

      {/* Wallet Address Display */}
      <div className="mb-4 rounded-lg border border-emerald-900/50 bg-emerald-950/30 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-slate-400">Connected Wallet</p>
          <span className="inline-block rounded-full bg-emerald-900/50 px-2 py-1 text-xs text-emerald-300">
            {state.walletProvider || "Connecting..."}
          </span>
        </div>
        <p className="font-mono text-xs break-all text-emerald-400">
          {state.userAddress || "..."}
        </p>
      </div>

      {/* Balance Display */}
      <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
        <p className="text-xs text-slate-400">Your Balance</p>
        <p className="font-mono text-lg font-bold text-emerald-400">
          {state.userBalance} XLM
        </p>
      </div>

      {/* Current Top Bid Display */}
      {state.topBid && (
        <div className="mb-4 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
          <p className="text-xs text-slate-400">Current Top Bid</p>
          <p className="font-mono text-lg font-bold text-green-400">
            {state.topBid.amount} XLM
          </p>
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <motion.div
          className="mb-4 flex items-start gap-3 rounded-lg border border-red-900/50 bg-red-950/30 p-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">{state.error}</p>
            {state.error.includes("Insufficient Balance") && (
              <p className="mt-1 text-xs text-red-200">
                You need more XLM in your wallet to place this bid
              </p>
            )}
            {state.error.includes("Transaction Rejected") && (
              <p className="mt-1 text-xs text-red-200">
                You cancelled the transaction. Try again when you&apos;re ready.
              </p>
            )}
            {state.error.includes("Wallet Not Found") && (
              <p className="mt-1 text-xs text-red-200">
                Your wallet extension is disconnected. Please reconnect.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Bid Input Form */}
      <form onSubmit={handlePlaceBid} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-300">
            Bid Amount (XLM)
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              disabled={isSubmitting || state.isLoading}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSubmitting || state.isLoading || !bidInput}
              className="rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-2 font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-yellow-700 hover:to-orange-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60 active:scale-[0.98] disabled:opacity-50 disabled:hover:from-yellow-600 disabled:hover:to-orange-600"
            >
              {isSubmitting || state.isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Send className="h-4 w-4" />
                </motion.div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Warnings */}
        {bidInput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {parseFloat(bidInput) > parseFloat(state.userBalance) && (
              <div className="flex items-start gap-2 rounded-lg border border-orange-900/50 bg-orange-950/30 p-2">
                <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-orange-400" />
                <p className="text-xs text-orange-300">
                  Insufficient Balance for this bid
                </p>
              </div>
            )}
            {state.topBid &&
              parseFloat(bidInput) <= parseFloat(state.topBid.amount) && (
                <div className="flex items-start gap-2 rounded-lg border border-orange-900/50 bg-orange-950/30 p-2">
                  <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-orange-400" />
                  <p className="text-xs text-orange-300">
                    Bid must exceed {state.topBid.amount} XLM
                  </p>
                </div>
              )}
          </motion.div>
        )}
      </form>

      {/* Connection Status */}
      <div className="mt-4 border-t border-slate-800 pt-4">
        <p className="truncate font-mono text-xs text-slate-500">
          {state.userAddress}
        </p>
      </div>
    </motion.div>
  );
}
