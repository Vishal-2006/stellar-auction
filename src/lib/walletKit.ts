"use client";

import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { Networks } from "@creit.tech/stellar-wallets-kit/types";
import { AlbedoModule, ALBEDO_ID } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { FreighterModule, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { xBullModule, XBULL_ID } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import {
  getAddress as freighterGetAddress,
  requestAccess as freighterRequestAccess,
} from "@stellar/freighter-api";

let walletKitInstance: StellarWalletsKit | null = null;
let selectedWalletId: string | null = null;
const WALLET_STORAGE_KEY = "auction-pulse:last-wallet";
const WALLET_INFO_KEY = "auction-pulse:last-wallet-info";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function storeWalletId(id: string | null) {
  if (!canUseStorage()) return;
  if (id) {
    window.localStorage.setItem(WALLET_STORAGE_KEY, id);
  } else {
    window.localStorage.removeItem(WALLET_STORAGE_KEY);
  }
}

function readStoredWalletId(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(WALLET_STORAGE_KEY);
}

function storeWalletInfo(info: { id: string; address: string; provider: string } | null) {
  if (!canUseStorage()) return;
  if (info) {
    window.localStorage.setItem(WALLET_INFO_KEY, JSON.stringify(info));
  } else {
    window.localStorage.removeItem(WALLET_INFO_KEY);
  }
}

function readStoredWalletInfo():
  | { id: string; address: string; provider: string }
  | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(WALLET_INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; address: string; provider: string };
  } catch {
    return null;
  }
}

function inferWalletIdFromProvider(provider: string): string | null {
  const normalized = provider.toLowerCase();
  if (normalized.includes("freighter")) return FREIGHTER_ID;
  if (normalized.includes("albedo")) return ALBEDO_ID;
  if (normalized.includes("xbull")) return XBULL_ID;
  return null;
}

/**
 * Initialize and return the WalletsKit instance
 * Supports Freighter and Albedo wallet modules
 */
export function initializeWalletKit(): StellarWalletsKit {
  if (walletKitInstance) {
    return walletKitInstance;
  }

  StellarWalletsKit.init({
    modules: [new FreighterModule(), new AlbedoModule(), new xBullModule()],
    network: Networks.TESTNET,
    authModal: {
      showInstallLabel: true,
      hideUnsupportedWallets: false,
    },
  });
  walletKitInstance = new StellarWalletsKit();

  return walletKitInstance;
}

/**
 * Get the singleton WalletsKit instance
 */
export function getWalletKit(): StellarWalletsKit {
  if (!walletKitInstance) {
    return initializeWalletKit();
  }
  return walletKitInstance;
}

/**
 * Detect which wallet provider is available
 */
export function detectWalletProvider(): string {
  if (selectedWalletId === FREIGHTER_ID) {
    return "Freighter";
  }
  if (selectedWalletId === ALBEDO_ID) {
    return "Albedo";
  }
  if (selectedWalletId === XBULL_ID) {
    return "xBull";
  }
  if (typeof window !== "undefined") {
    const windowObj = window as Window & { freighter?: unknown; albedo?: unknown };
    // Check for Freighter
    if (windowObj.freighter !== undefined) {
      return "Freighter";
    }
    // Check for Albedo
    if (windowObj.albedo !== undefined) {
      return "Albedo";
    }
  }
  return "Unknown";
}

/**
 * Connect wallet and return user address and provider info
 */
export async function connectWallet(
  walletId?: string
): Promise<{ address: string; provider: string }> {
  try {
    initializeWalletKit();
    if (walletId) {
      StellarWalletsKit.setWallet(walletId);
      selectedWalletId = walletId;
    }

    let result: { address: string };

    if (walletId === FREIGHTER_ID) {
      const accessResult = await freighterRequestAccess();
      if (accessResult.error) {
        throw new Error(String(accessResult.error));
      }
      result = await StellarWalletsKit.getAddress();
    } else if (walletId === ALBEDO_ID) {
      try {
        result = await StellarWalletsKit.getAddress();
      } catch (albedoError: unknown) {
        const errorMsg =
          albedoError instanceof Error
            ? albedoError.message
            : String(albedoError);
        // Albedo-specific error handling
        if (
          errorMsg.includes("Not Found") ||
          errorMsg.includes("404") ||
          errorMsg.includes("no signers")
        ) {
          throw new Error(
            "Albedo connection failed. Please visit albedo.finance to set up your account."
          );
        }
        throw albedoError;
      }
    } else if (walletId === XBULL_ID) {
      result = await StellarWalletsKit.getAddress();
    } else {
      result = await StellarWalletsKit.authModal();
    }

    // Check if result has an error property (StellarWalletsKit returns error objects)
    const resultObj = result as unknown as Record<string, unknown>;
    if (resultObj?.error) {
      const errorMsg = resultObj.error;
      throw new Error(String(errorMsg));
    }

    if (!result || !result.address) {
      throw new Error("Wallet Not Found: Please install Freighter or Albedo");
    }

    const provider =
      StellarWalletsKit.selectedModule?.productName || detectWalletProvider();
    const inferredId =
      walletId ||
      StellarWalletsKit.selectedModule?.productId ||
      selectedWalletId ||
      inferWalletIdFromProvider(provider) ||
      null;
    if (inferredId) {
      storeWalletId(inferredId);
      storeWalletInfo({ id: inferredId, address: result.address, provider });
    }

    return {
      address: result.address,
      provider: provider,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // Catch Albedo setup message
    if (errorMsg.includes("albedo.finance")) {
      throw error;
    }
    
    if (
      errorMsg.includes("not installed") ||
      errorMsg.includes("not connected") ||
      errorMsg.includes("No wallet has been connected") ||
      errorMsg.includes("Wallet Not Found") ||
      errorMsg.includes("closed the modal") ||
      errorMsg.includes("Modal closed") ||
      errorMsg.includes("No suitable") ||
      errorMsg.includes("Not Found")
    ) {
      throw new Error("Wallet Not Found");
    }
    if (
      errorMsg.includes("canceled") ||
      errorMsg.includes("cancelled") ||
      errorMsg.includes("rejected") ||
      errorMsg.includes("User declined")
    ) {
      throw new Error("User Rejected");
    }
    if (errorMsg.toLowerCase().includes("popup") || errorMsg.toLowerCase().includes("blocked")) {
      throw new Error("Popup Blocked");
    }
    throw error;
  }
}

/**
 * Sign a transaction with the connected wallet
 */
export async function signTransaction(
  transactionXDR: string,
  address?: string
): Promise<string> {
  try {
    const result = await StellarWalletsKit.signTransaction(transactionXDR, {
      networkPassphrase: "Test SDF Network ; September 2015",
      address,
    });

    // Check if result has an error property
    const resultObj = result as unknown as Record<string, unknown>;
    if (resultObj?.error) {
      const errorMsg = resultObj.error;
      throw new Error(String(errorMsg));
    }

    if (!result || !result.signedTxXdr) {
      throw new Error("Failed to sign transaction");
    }

    return result.signedTxXdr;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    // Detect transaction rejection
    if (
      errorMsg.includes("canceled") ||
      errorMsg.includes("rejected") ||
      errorMsg.includes("User declined")
    ) {
      throw new Error("Transaction Rejected");
    }
    throw error;
  }
}

/**
 * Attempt to restore a previous wallet connection without prompting the user.
 * Returns null if it cannot restore silently.
 */
export async function tryRestoreWallet(): Promise<{ address: string; provider: string } | null> {
  const storedInfo = readStoredWalletInfo();
  const storedId = storedInfo?.id || readStoredWalletId();
  if (!storedId) return null;

  try {
    initializeWalletKit();
    StellarWalletsKit.setWallet(storedId);
    selectedWalletId = storedId;

    let result: { address: string };
    if (storedId === FREIGHTER_ID) {
      const freighterResult = await freighterGetAddress();
      if (!freighterResult?.address) return null;
      result = { address: freighterResult.address };
    } else {
      result = await StellarWalletsKit.getAddress();
    }
    const resultObj = result as unknown as Record<string, unknown>;
    if (resultObj?.error) return null;
    if (!result?.address) return null;

    const provider =
      StellarWalletsKit.selectedModule?.productName || detectWalletProvider();
    storeWalletInfo({ id: storedId, address: result.address, provider });
    return { address: result.address, provider };
  } catch {
    return null;
  }
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
  try {
    await StellarWalletsKit.disconnect();
    walletKitInstance = null;
    selectedWalletId = null;
    storeWalletId(null);
    storeWalletInfo(null);
  } catch (error) {
    console.error("Error disconnecting wallet:", error);
  }
}
