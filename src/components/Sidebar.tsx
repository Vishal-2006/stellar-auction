"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  History,
  Trophy,
  Wallet,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  userAddress: string | null;
  walletProvider: string | null;
  onDisconnect: () => void;
}

export function Sidebar({ userAddress, walletProvider, onDisconnect }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detect mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: History, label: "Bid History", href: "/history" },
    { icon: Trophy, label: "Leaderboard", href: "/leaderboard" },
    { icon: Wallet, label: "Wallet Info", href: "/wallet" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          className="fixed left-5 top-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-900/80 shadow-lg backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-500/60 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
        >
          {isOpen ? (
            <X className="h-5 w-5 text-slate-200" />
          ) : (
            <Menu className="h-5 w-5 text-slate-200" />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Animated on Mobile, Static on Desktop */}
      <motion.div
        initial={isMobile ? { x: -300 } : false}
        animate={isMobile ? { x: isOpen ? 0 : -300 } : false}
        transition={
          isMobile ? { type: "spring", stiffness: 320, damping: 28 } : undefined
        }
        className={`${
          isMobile
            ? "fixed left-0 top-0 z-40 h-screen w-72"
            : "fixed left-0 top-0 z-30 h-screen w-72"
        } overflow-y-auto border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-6`}
      >
        {/* Logo */}
        <div className="mb-8 mt-8 lg:mt-0">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            ⚡ Auction Pulse
          </h2>
        </div>

        {/* Navigation */}
        <nav className="mb-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  active
                    ? "bg-emerald-900/40 text-emerald-300 ring-1 ring-emerald-500/20"
                    : "text-slate-400 hover:-translate-y-0.5 hover:bg-slate-800/80 hover:text-slate-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mb-6 h-px bg-slate-800" />

        {/* Wallet Info */}
        {userAddress ? (
          <div className="mb-6 space-y-3">
            <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 p-4">
              <p className="mb-2 text-xs text-slate-400">Connected Wallet</p>
              <p className="mb-2 font-mono text-xs text-emerald-400 break-all">
                {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
              </p>
              <p className="text-xs text-slate-500">
                {walletProvider || "Unknown"}
              </p>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => {
                onDisconnect();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg border border-red-900/30 bg-red-900/20 px-4 py-2 text-sm text-red-300 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        ) : null}

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6 text-xs text-slate-500">
          <p>Stellar Testnet</p>
          <p>Contract ID: {process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ID?.slice(0, 12)}...</p>
        </div>
      </motion.div>
    </>
  );
}
