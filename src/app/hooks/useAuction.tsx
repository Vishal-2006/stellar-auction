"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as StellarLib from "@/lib/stellar";
import * as WalletLib from "@/lib/walletKit";
import type { ReactNode } from "react";

export interface Bid {
  id?: string;
  bidder: string;
  amount: string;
  timestamp: number;
}

export interface AuctionState {
  topBid: Bid | null;
  winner: Bid | null;
  userBalance: string;
  userAddress: string | null;
  walletProvider: string | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  bids: Bid[];
}

const initialState: AuctionState = {
  topBid: null,
  winner: null,
  userBalance: "0",
  userAddress: null,
  walletProvider: null,
  isLoading: false,
  error: null,
  isConnected: false,
  bids: [],
};

const BIDS_STORAGE_KEY = "auction-pulse:bids";
const TOP_BID_STORAGE_KEY = "auction-pulse:top-bid";
const WINNER_STORAGE_KEY = "auction-pulse:winner";
const ADMIN_STORAGE_KEY = "auction-pulse:admin-address";

const CONFIGURED_ADMIN_ADDRESS =
  process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadCachedBids(): Bid[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(BIDS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Bid[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadCachedTopBid(): Bid | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(TOP_BID_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Bid;
  } catch {
    return null;
  }
}

function loadCachedWinner(): Bid | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(WINNER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Bid;
  } catch {
    return null;
  }
}

function readStoredAdminAddress(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(ADMIN_STORAGE_KEY);
}

function storeAdminAddress(address: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ADMIN_STORAGE_KEY, normalizeAddress(address));
}

function normalizeAddress(address?: string | null): string {
  return (address || "").trim().toUpperCase();
}

/**
 * Hook for managing auction state and interactions with Soroban contract
 */
function useAuctionInternal() {
  const [state, setState] = useState<AuctionState>(initialState);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventListenerRef = useRef<NodeJS.Timeout | null>(null);
  const eventsCursorRef = useRef<string | null>(null);
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const [adminAddress, setAdminAddress] = useState<string | null>(null);

  const mergeBids = (incoming: StellarLib.BidEvent[]) => {
    if (incoming.length === 0) return;

    setState((prev) => {
      const next = [...prev.bids];
      for (const bid of incoming) {
        if (seenEventIdsRef.current.has(bid.id)) {
          continue;
        }
        seenEventIdsRef.current.add(bid.id);
        next.push({
          id: bid.id,
          bidder: bid.bidder,
          amount: bid.amount,
          timestamp: bid.timestamp,
        });
      }

      next.sort((a, b) => b.timestamp - a.timestamp);

      return {
        ...prev,
        bids: next.slice(0, 20),
      };
    });
  };

  const loadBidHistory = async (reset = false) => {
    try {
      const cursor = reset ? undefined : eventsCursorRef.current || undefined;
      const { bids, cursor: nextCursor } = await StellarLib.getBidEvents({
        cursor,
        limit: 50,
      });
      if (reset) {
        seenEventIdsRef.current.clear();
      }
      mergeBids(bids);
      eventsCursorRef.current = nextCursor;
    } catch {
      // Silence noisy errors when RPC events are unavailable.
    }
  };

  /**
   * Connect wallet and load initial data
   */
  const connectWallet = async (walletId?: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const walletInfo = await WalletLib.connectWallet(walletId);
      const address = walletInfo.address;
      const provider = walletInfo.provider;

      if (!CONFIGURED_ADMIN_ADDRESS) {
        const storedAdmin = readStoredAdminAddress();
        if (!storedAdmin) {
          storeAdminAddress(address);
          setAdminAddress(normalizeAddress(address));
        }
      }

      // Load account data
      const accountData = await StellarLib.getAccountData(address);
      const balance = accountData.balances
        .find((b) => {
          const balance = b as unknown as Record<string, unknown>;
          return balance.asset_type === "native";
        })
        ?.balance || "0";

      // Load top bid
      const topBid = await StellarLib.getTopBid(address);

      setState((prev) => ({
        ...prev,
        userAddress: address,
        walletProvider: provider,
        userBalance: balance,
        topBid: topBid || prev.topBid,
        winner: prev.winner,
        isConnected: true,
        isLoading: false,
        error: null,
      }));

      await loadBidHistory(true);
      // Start polling for top bid updates
      startBidPolling();
      // Subscribe to events
      subscribeToEvents();
    } catch (error: unknown) {
      // Comprehensive error handling for various error types
      let errorMsg = "";
      
      if (error instanceof Error) {
        errorMsg = error.message;
      } else if (typeof error === "string") {
        errorMsg = error;
      } else if (typeof error === "object" && error !== null) {
        const errorObj = error as Record<string, unknown>;
        // Check for common error object patterns
        errorMsg = 
          (errorObj.message as string) ||
          (errorObj.error as string) ||
          (errorObj.reason as string) ||
          JSON.stringify(errorObj).substring(0, 100) ||
          "Failed to connect wallet";
      } else {
        errorMsg = "Failed to connect wallet";
      }

      setState((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
    }
  };

  /**
   * Poll for top bid updates every 10 seconds
   */
  const startBidPolling = () => {
    // Clear existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll immediately and then every 10 seconds
    const pollTopBid = async () => {
      try {
      const topBid = await StellarLib.getTopBid(state.userAddress || undefined);
        setState((prev) => ({
          ...prev,
          topBid: topBid || prev.topBid,
          error: null,
        }));
      await loadBidHistory();
      } catch (error) {
        console.error("Error polling top bid:", error);
      }
    };

    void pollTopBid();
    pollIntervalRef.current = setInterval(() => {
      void pollTopBid();
    }, 10000);
  };

  /**
   * Subscribe to contract events for real-time updates
   */
  const subscribeToEvents = async () => {
    try {
      eventListenerRef.current = null; // Placeholder
      await StellarLib.subscribeToAuctionEvents();
    } catch (error) {
      console.error("Error subscribing to events:", error);
    }
  };

  /**
   * Place a bid on the auction
   */
  const placeBid = async (
    bidAmount: string
  ): Promise<{ hash: string; status: "SUCCESS" | "PENDING" } | null> => {
    if (!state.userAddress) {
      setState((prev) => ({
        ...prev,
        error: "Wallet not connected",
      }));
      return null;
    }

    const optimisticBid: Bid = {
      bidder: state.userAddress,
      amount: bidAmount,
      timestamp: Date.now(),
    };

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Validate bid
      const currentTopBid = state.topBid?.amount || "0";
      const validation = StellarLib.validateBidAmount(
        bidAmount,
        state.userBalance,
        currentTopBid
      );

      if (!validation.valid) {
        setState((prev) => ({
          ...prev,
          error: validation.error || "Invalid bid",
          isLoading: false,
        }));
        return null;
      }

      // Build transaction
      const txXDR = await StellarLib.buildPlaceBidTransaction(
        state.userAddress,
        bidAmount
      );

      // Sign transaction
      const signedXDR = await WalletLib.signTransaction(txXDR, state.userAddress);

      // Submit transaction to Soroban RPC
      const { hash, status } = await StellarLib.submitSignedTransaction(signedXDR);

      // Update state with new bid
      setState((prev) => ({
        ...prev,
        topBid: optimisticBid,
        bids: [optimisticBid, ...prev.bids].slice(0, 10),
        isLoading: false,
      }));

      return { hash, status };
    } catch (error: unknown) {
      let errorMessage = error instanceof Error ? error.message : String(error);

      // Map specific errors
      if (errorMessage.includes("Insufficient balance")) {
        errorMessage = "Insufficient Balance";
      } else if (errorMessage.includes("Transaction Rejected")) {
        errorMessage = "Transaction Rejected";
      } else if (errorMessage.includes("Wallet Not Found")) {
        errorMessage = "Wallet Not Found";
      }

      if (errorMessage.includes("Bad union switch")) {
        // Treat as pending; the network may still accept the transaction.
        setState((prev) => ({
          ...prev,
          topBid: optimisticBid,
          bids: [optimisticBid, ...prev.bids].slice(0, 10),
          isLoading: false,
          error: null,
        }));
        return { hash: "", status: "PENDING" };
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));

      return null;
    }
  };

  /**
   * Disconnect wallet and cleanup
   */
  const disconnect = async () => {
    try {
      await WalletLib.disconnectWallet();
      // Clear intervals
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      setState(initialState);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  const isAdmin =
    !!adminAddress &&
    !!state.userAddress &&
    normalizeAddress(adminAddress) === normalizeAddress(state.userAddress);

  /**
   * Announce winner (admin only)
   */
  const announceWinner = async (): Promise<void> => {
    if (!isAdmin) {
      setState((prev) => ({
        ...prev,
        error: "Admin only: cannot announce winner",
      }));
      return;
    }

    if (!state.topBid) {
      setState((prev) => ({
        ...prev,
        error: "No bids available to announce",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      winner: state.topBid,
      error: null,
    }));
  };

  const clearWinner = async (): Promise<void> => {
    if (!isAdmin) return;
    setState((prev) => ({
      ...prev,
      winner: null,
    }));
  };

  /**
   * Reset auction on-chain (admin/testing)
   */
  const resetAuction = async (): Promise<string | null> => {
    if (!state.userAddress) {
      setState((prev) => ({
        ...prev,
        error: "Wallet not connected",
      }));
      return null;
    }
    if (!isAdmin) {
      setState((prev) => ({
        ...prev,
        error: "Admin only: cannot reset auction",
      }));
      return null;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const txXDR = await StellarLib.buildResetTransaction(state.userAddress);
      const signedXDR = await WalletLib.signTransaction(txXDR, state.userAddress);
      const { hash } = await StellarLib.submitSignedTransaction(signedXDR);

      setState((prev) => ({
        ...prev,
        topBid: null,
        winner: null,
        bids: [],
        isLoading: false,
      }));

      return hash;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return null;
    }
  };

  /**
   * Refresh user balance
   */
  const refreshBalance = async () => {
    if (!state.userAddress) return;

    try {
      const accountData = await StellarLib.getAccountData(state.userAddress);
      const balance = accountData.balances
        .find((b) => {
          const balance = b as unknown as Record<string, unknown>;
          return balance.asset_type === "native";
        })
        ?.balance || "0";

      setState((prev) => ({
        ...prev,
        userBalance: balance,
      }));
    } catch (error) {
      console.error("Error refreshing balance:", error);
    }
  };

  // Restore cached bids/top bid on first load (helps after refresh)
  useEffect(() => {
    const cachedBids = loadCachedBids();
    const cachedTopBid = loadCachedTopBid();
    const cachedWinner = loadCachedWinner();
    if (cachedBids.length || cachedTopBid) {
      if (cachedBids.length) {
        const ids = cachedBids.map((bid) => bid.id).filter(Boolean) as string[];
        seenEventIdsRef.current = new Set(ids);
      }
      setState((prev) => ({
        ...prev,
        bids: cachedBids.length ? cachedBids : prev.bids,
        topBid: cachedTopBid || prev.topBid,
        winner: cachedWinner || prev.winner,
      }));
    }

    const storedAdmin = readStoredAdminAddress();
    if (CONFIGURED_ADMIN_ADDRESS) {
      setAdminAddress(normalizeAddress(CONFIGURED_ADMIN_ADDRESS));
    } else if (storedAdmin) {
      setAdminAddress(normalizeAddress(storedAdmin));
    }
  }, []);

  // Persist bids/top bid for refresh survival
  useEffect(() => {
    if (!canUseStorage()) return;
    window.localStorage.setItem(BIDS_STORAGE_KEY, JSON.stringify(state.bids));
    window.localStorage.setItem(TOP_BID_STORAGE_KEY, JSON.stringify(state.topBid));
    window.localStorage.setItem(WINNER_STORAGE_KEY, JSON.stringify(state.winner));
  }, [state.bids, state.topBid, state.winner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (eventListenerRef.current?.close) {
        eventListenerRef.current.close();
      }
    };
  }, []);

  // Attempt silent restore on first load
  useEffect(() => {
    let isMounted = true;

    const restore = async () => {
      if (state.isConnected) return;
      setState((prev) => ({ ...prev, isLoading: true }));
      const restored = await WalletLib.tryRestoreWallet();
      if (!isMounted) return;
      if (!restored) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const accountData = await StellarLib.getAccountData(restored.address);
        const balance = accountData.balances
          .find((b) => {
            const balance = b as unknown as Record<string, unknown>;
            return balance.asset_type === "native";
          })
          ?.balance || "0";

        const topBid = await StellarLib.getTopBid(restored.address);

        setState((prev) => ({
          ...prev,
          userAddress: restored.address,
          walletProvider: restored.provider,
          userBalance: balance,
          topBid: topBid || prev.topBid,
          isConnected: true,
          isLoading: false,
          error: null,
        }));

        startBidPolling();
        subscribeToEvents();
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
    };

    void restore();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    connectWallet,
    placeBid,
    disconnect,
    refreshBalance,
    resetAuction,
    announceWinner,
    clearWinner,
    isAdmin,
    adminAddress,
  };
}

type AuctionContextValue = ReturnType<typeof useAuctionInternal>;

const AuctionContext = createContext<AuctionContextValue | null>(null);

export function AuctionProvider({ children }: { children: ReactNode }) {
  const value = useAuctionInternal();
  return <AuctionContext.Provider value={value}>{children}</AuctionContext.Provider>;
}

export function useAuction() {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error("useAuction must be used within AuctionProvider");
  }
  return context;
}
