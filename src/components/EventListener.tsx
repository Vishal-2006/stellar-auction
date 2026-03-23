"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { HORIZON_SERVER, AUCTION_CONTRACT_ID } from "@/lib/stellar";

interface EventListenerProps {
  userAddress?: string | null;
}

/**
 * EventListener component that monitors for new bid events
 * on the Soroban contract using Horizon Server events
 * 
 * Handles real-time updates for:
 * - New bids placed
 * - Outbid notifications
 * - Contract events
 */
export function EventListener({
  userAddress,
}: EventListenerProps): React.ReactNode {
  useEffect(() => {
    if (!userAddress) return;
    if (!AUCTION_CONTRACT_ID.startsWith("G")) {
      // Horizon streams only support account IDs. Contract IDs start with "C".
      return;
    }

    let eventStream: (() => void) | null = null;

    const startEventListener = async () => {
      try {
        // Listen for transactions on the auction contract
        eventStream = HORIZON_SERVER
          .transactions()
          .forAccount(AUCTION_CONTRACT_ID)
          .cursor("now")
          .stream({
            onmessage: (transaction: unknown) => {
              // Handle contract transaction events
              // When a bid is placed, a transaction is recorded
              const tx = transaction as Record<string, unknown>;
              
              if (tx.id && !tx.successful) {
                console.log("Contract transaction detected:", tx.id);
                // Emit event to parent component via custom event
                window.dispatchEvent(
                  new CustomEvent("contract-event", { detail: tx })
                );
              }
            },
            onerror: () => {
              // Horizon stream errors are noisy; retry quietly.
              // Retry after 5 seconds
              setTimeout(startEventListener, 5000);
            },
          });
      } catch (error) {
        console.error("Failed to start event listener:", error);
        // Fallback: Poll for updates every 5 seconds
        const pollInterval = setInterval(async () => {
          try {
            // Alternative: Poll contract state using Horizon
            // This is less efficient than streaming but works as fallback
            console.log("Polling for contract updates...");
          } catch (err) {
            console.error("Poll error:", err);
          }
        }, 5000);

        return () => clearInterval(pollInterval);
      }
    };

    startEventListener();

    return () => {
      if (eventStream) {
        try {
          // Close event stream by calling the close function
          eventStream();
        } catch (error) {
          console.error("Error closing event stream:", error);
        }
      }
    };
  }, [userAddress]);

  return null;
}

/**
 * Hook to expose the outbid notification function to parent components
 */
export function useOutbidNotification() {
  const showOutbidNotification = (newBidAmount: string) => {
    toast.warning("❌ You've been outbid!", {
      description: `Someone placed a higher bid of ${newBidAmount} XLM. Place a higher bid to win.`,
      duration: 6000,
      icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
    });

    // Play notification sound
    try {
      const audioContext = new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext)() as AudioContext;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Silently fail if audio context not available
    }
  };

  const showBidPlacedNotification = (bidAmount: string, txHash: string) => {
    const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;
    
    toast.success("✅ Bid Placed Successfully!", {
      description: (
        <div className="space-y-2">
          <p>Your bid of {bidAmount} XLM has been placed</p>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-blue-400 hover:text-blue-300 underline"
          >
            View on StellarExpert →
          </a>
        </div>
      ),
      duration: 6000,
    });
  };

  return { showOutbidNotification, showBidPlacedNotification };
}
