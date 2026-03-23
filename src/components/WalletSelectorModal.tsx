"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface WalletProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const WALLET_PROVIDERS: WalletProvider[] = [
  {
    id: "freighter",
    name: "Freighter",
    icon: "🪟",
    description: "Most popular Stellar wallet. Browser extension for Chrome, Firefox, and Brave.",
    color: "from-blue-600 to-blue-700",
  },
  {
    id: "albedo",
    name: "Albedo",
    icon: "🌐",
    description: "Web-based Stellar wallet. No installation required. Works on any browser.",
    color: "from-purple-600 to-purple-700",
  },
  {
    id: "xbull",
    name: "xBull",
    icon: "🐂",
    description: "Multi-platform Stellar wallet with extension and web app support.",
    color: "from-emerald-600 to-emerald-700",
  },
];

interface WalletSelectorModalProps {
  isOpen: boolean;
  onSelect: (walletId: string) => void;
  onClose: () => void;
  isLoading?: string | false;
}

export function WalletSelectorModal({
  isOpen,
  onSelect,
  onClose,
  isLoading = false,
}: WalletSelectorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-200">Select Wallet</h2>
              <button
                onClick={onClose}
                disabled={!!isLoading}
                aria-label="Close wallet selector"
                title="Close"
                className="rounded-lg p-1 text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <p className="mb-6 text-sm text-slate-400">
              Choose your wallet provider to connect to Auction Pulse
            </p>

            {/* Wallet Options */}
            <div className="space-y-3">
              {WALLET_PROVIDERS.map((provider) => (
                <motion.button
                  key={provider.id}
                  onClick={() => onSelect(provider.id)}
                  disabled={!!isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-500/60 hover:bg-slate-800/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{provider.icon}</span>
                      <div>
                        <h3 className="font-semibold text-slate-200">
                          {provider.name}
                          {isLoading === provider.id && (
                            <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                          )}
                        </h3>
                        <p className="text-xs text-slate-400">{provider.description}</p>
                      </div>
                    </div>
                    <div className={`rounded-full bg-gradient-to-br ${provider.color} h-2 w-2`} />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer Info */}
            <div className="mt-6 rounded-lg border border-slate-700/50 bg-slate-900/30 p-3 text-xs text-slate-500">
              💡 <strong>Don&apos;t have a wallet?</strong> Install Freighter extension or use
              Albedo (no installation needed).
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
