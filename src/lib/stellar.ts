import {
  Contract,
  Horizon,
  TransactionBuilder,
  FeeBumpTransaction,
  rpc,
  nativeToScVal,
  scValToNative,
  BASE_FEE,
} from "@stellar/stellar-sdk";

/**
 * Stellar Testnet Soroban RPC endpoint
 */
export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";

/**
 * Stellar Horizon Server for fetching account data and events
 */
export const HORIZON_SERVER = new Horizon.Server("https://horizon-testnet.stellar.org");

/**
 * Network passphrase for testnet
 */
export const TEST_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

/**
 * Auction contract address (replace with your deployed contract)
 */
export const AUCTION_CONTRACT_ID = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ID || "";

const SOROBAN_RPC = new rpc.Server(SOROBAN_RPC_URL);

function getContractId(): string {
  if (!AUCTION_CONTRACT_ID) {
    throw new Error("Missing NEXT_PUBLIC_AUCTION_CONTRACT_ID");
  }
  return AUCTION_CONTRACT_ID;
}

const STROOPS_PER_XLM = BigInt(10_000_000);

function toStroops(amount: string): bigint {
  const [wholePart, fractionPart = ""] = amount.trim().split(".");
  const safeWhole = wholePart.length ? wholePart : "0";
  const paddedFraction = (fractionPart + "0000000").slice(0, 7);
  const whole = BigInt(safeWhole);
  const fraction = BigInt(paddedFraction || "0");
  return whole * STROOPS_PER_XLM + fraction;
}

function stroopsToXlm(amount: bigint): string {
  const isNegative = amount < BigInt(0);
  const abs = isNegative ? -amount : amount;
  const whole = abs / STROOPS_PER_XLM;
  const fraction = abs % STROOPS_PER_XLM;
  const fractionStr = fraction.toString().padStart(7, "0").replace(/0+$/, "");
  const value = fractionStr.length ? `${whole.toString()}.${fractionStr}` : whole.toString();
  return isNegative ? `-${value}` : value;
}

export type BidEvent = {
  id: string;
  bidder: string;
  amount: string;
  timestamp: number;
};

/**
 * Fetch the top bid from the Soroban contract
 */
export async function getTopBid(sourceAccountId?: string): Promise<{
  bidder: string;
  amount: string;
  timestamp: number;
} | null> {
  try {
    if (!sourceAccountId) {
      return null;
    }

    const account = await SOROBAN_RPC.getAccount(sourceAccountId);
    const contract = new Contract(getContractId());

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: TEST_NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("get_top_bid"))
      .setTimeout(30)
      .build();

    const sim = await SOROBAN_RPC.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`Simulation error: ${sim.error}`);
    }
    if (!rpc.Api.isSimulationSuccess(sim)) {
      return null;
    }
    const raw = sim.result?.retval;
    if (!raw) return null;

    const parsed = scValToNative(raw) as [string, bigint] | unknown;
    if (!Array.isArray(parsed) || parsed.length < 2) {
      return null;
    }

    const bidder = String(parsed[0] ?? "");
    const amountStroops = BigInt(parsed[1] ?? 0);

    return {
      bidder,
      amount: stroopsToXlm(amountStroops),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error fetching top bid:", error);
    return null;
  }
}

export async function getBidEvents(opts?: {
  cursor?: string;
  limit?: number;
}): Promise<{ bids: BidEvent[]; cursor: string | null }> {
  const limit = opts?.limit ?? 50;
  let response: rpc.Api.GetEventsResponse;
  try {
    response = await SOROBAN_RPC.getEvents({
      cursor: opts?.cursor,
      limit,
      filters: [
        {
          type: "contract",
          contractIds: [getContractId()],
        },
      ],
    });
  } catch {
    // If RPC is unavailable or no contract is set, return empty history.
    return { bids: [], cursor: null };
  }

  const bids: BidEvent[] = response.events
    .map((event) => {
      try {
        const topic0 = event.topic?.[0];
        if (!topic0) return null;
        const topicName = String(scValToNative(topic0));
        if (topicName !== "new_bid") return null;

        const parsed = scValToNative(event.value) as [string, bigint] | unknown;
        if (!Array.isArray(parsed) || parsed.length < 2) {
          return null;
        }
        const bidder = String(parsed[0] ?? "");
        const amountStroops = BigInt(parsed[1] ?? 0);
        const timestamp = Date.parse(event.ledgerClosedAt) || Date.now();

        return {
          id: event.id,
          bidder,
          amount: stroopsToXlm(amountStroops),
          timestamp,
        };
      } catch {
        return null;
      }
    })
    .filter((bid): bid is BidEvent => Boolean(bid));

  return { bids, cursor: response.cursor || null };
}

/**
 * Build a place_bid transaction for the Soroban contract
 */
export async function buildPlaceBidTransaction(
  userAddress: string,
  bidAmount: string
): Promise<string> {
  const account = await SOROBAN_RPC.getAccount(userAddress);
  const contract = new Contract(getContractId());
  const amountStroops = toStroops(bidAmount);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: TEST_NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "place_bid",
        nativeToScVal(userAddress, { type: "string" }),
        nativeToScVal(amountStroops, { type: "i128" })
      )
    )
    .setTimeout(60)
    .build();

  const sim = await SOROBAN_RPC.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation error: ${sim.error}`);
  }
  if (rpc.Api.isSimulationRestore(sim)) {
    throw new Error("Simulation requires state restoration");
  }

  const prepared = rpc.assembleTransaction(tx, sim).build();
  return prepared.toXDR();
}

export async function buildResetTransaction(userAddress: string): Promise<string> {
  const account = await SOROBAN_RPC.getAccount(userAddress);
  const contract = new Contract(getContractId());

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: TEST_NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("reset"))
    .setTimeout(60)
    .build();

  const sim = await SOROBAN_RPC.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation error: ${sim.error}`);
  }
  if (rpc.Api.isSimulationRestore(sim)) {
    throw new Error("Simulation requires state restoration");
  }

  const prepared = rpc.assembleTransaction(tx, sim).build();
  return prepared.toXDR();
}

/**
 * Fetch account data from Horizon
 */
export async function getAccountData(accountId: string) {
  try {
    return await HORIZON_SERVER.loadAccount(accountId);
  } catch (error) {
    console.error("Error loading account:", error);
    throw error;
  }
}

export async function submitSignedTransaction(
  signedXdr: string
): Promise<{ hash: string; status: "SUCCESS" | "PENDING" }> {
  let transaction;
  try {
    transaction = TransactionBuilder.fromXDR(signedXdr, TEST_NETWORK_PASSPHRASE);
  } catch (error) {
    try {
      const feeBumpFromXDR = (FeeBumpTransaction as unknown as {
        fromXDR?: (xdr: string, passphrase: string) => FeeBumpTransaction;
      }).fromXDR;
      if (!feeBumpFromXDR) {
        throw new Error("Fee bump parsing not available");
      }
      transaction = feeBumpFromXDR(signedXdr, TEST_NETWORK_PASSPHRASE);
    } catch {
      throw new Error(
        `Invalid signed XDR (wallet may not have signed a transaction). ${String(
          error
        )}`
      );
    }
  }
  const send = await SOROBAN_RPC.sendTransaction(transaction);

  if (!send.hash) {
    throw new Error("Failed to submit transaction");
  }

  const result = await SOROBAN_RPC.pollTransaction(send.hash, {
    attempts: 8,
    sleepStrategy: rpc.LinearSleepStrategy,
  });

  if (result.status !== "SUCCESS") {
    // If the network hasn't confirmed yet, treat as pending and avoid false negatives.
    return { hash: send.hash, status: "PENDING" };
  }

  return { hash: send.hash, status: "SUCCESS" };
}

/**
 * Subscribe to contract events
 */
export async function subscribeToAuctionEvents(): Promise<void> {
  try {
    // Note: Real-time event streaming would require a proper WebSocket setup
    // This is a placeholder for the event listener structure
    // In production, you would use Soroban RPC event stream
    const checkForEvents = async () => {
      try {
        // Placeholder for actual event fetching
        // Real implementation would use server.getEvents()
        console.log("Checking for new bid events...");
      } catch (error) {
        console.error("Error checking events:", error);
      }
    };

    // Poll for events every 10 seconds
    setInterval(checkForEvents, 10000);
  } catch (error) {
    console.error("Error subscribing to events:", error);
  }
}

/**
 * Helper to validate bid amount
 */
export function validateBidAmount(
  bidAmount: string,
  userBalance: string,
  currentTopBid: string
): { valid: boolean; error?: string } {
  const bid = parseFloat(bidAmount);
  const balance = parseFloat(userBalance);
  const topBid = parseFloat(currentTopBid);

  if (isNaN(bid) || bid <= 0) {
    return { valid: false, error: "Invalid bid amount" };
  }

  if (bid > balance) {
    return { valid: false, error: "Insufficient balance" };
  }

  if (bid <= topBid) {
    return { valid: false, error: "Bid must be higher than current top bid" };
  }

  return { valid: true };
}
