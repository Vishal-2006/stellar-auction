"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, ExternalLink } from "lucide-react";

interface WalletNotFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: "freighter" | "albedo" | "generic";
}

export function WalletNotFoundModal({
  isOpen,
  onClose,
  reason = "generic",
}: WalletNotFoundModalProps) {
  const getContent = () => {
    switch (reason) {
      case "freighter":
        return {
          title: "Freighter Not Found",
          description:
            "Freighter wallet extension is not installed on your browser.",
          steps: [
            "Download Freighter from the official website",
            "Add extension to Chrome, Firefox, or Brave",
            "Create or import your Stellar account",
            "Return to Auction Pulse and connect",
          ],
          link: "https://freighter.app",
          linkText: "Install Freighter →",
        };
      case "albedo":
        return {
          title: "Albedo Account Not Found",
          description:
            "Your Albedo account needs to be set up before connecting to Auction Pulse.",
          steps: [
            "Visit albedo.finance in a new tab",
            "Create or log into your Albedo account",
            "Set up your account with a signer",
            "Return to Auction Pulse and try connecting again",
          ],
          link: "https://albedo.finance",
          linkText: "Go to Albedo →",
        };
      default:
        return {
          title: "Wallet Not Found",
          description:
            "No supported Stellar wallet was detected. Please install one of the supported wallets.",
          steps: [
            "Install Freighter (browser extension) or Albedo (web-based)",
            "Freighter: Works offline, stores keys locally",
            "Albedo: No installation needed, works on any browser",
            "Return to Auction Pulse and select your wallet",
          ],
          link: "https://freighter.app",
          linkText: "Download Wallet →",
        };
    }
  };

  const content = getContent();

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
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-red-900/50 bg-gradient-to-br from-red-950 to-slate-950 p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-900/30 p-2">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-red-300">{content.title}</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close wallet help modal"
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <p className="mb-6 text-sm text-slate-300">{content.description}</p>

            {/* Steps */}
            <div className="mb-6 space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase">Setup Steps:</p>
              {content.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 rounded-full bg-red-900/30 w-6 h-6 flex items-center justify-center">
                    <span className="text-xs font-semibold text-red-400">{idx + 1}</span>
                  </div>
                  <p className="text-sm text-slate-300">{step}</p>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <a
              href={content.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 font-semibold text-white transition-all hover:from-red-500 hover:to-red-600 mb-3"
            >
              {content.linkText}
              <ExternalLink className="h-4 w-4" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800 hover:text-slate-200"
            >
              I&apos;ll Do This Later
            </button>

            {/* Footer Tip */}
            <p className="mt-4 text-xs text-slate-500 text-center">
              💡 <strong>Tip:</strong> Freighter works offline, Albedo requires internet connection
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
