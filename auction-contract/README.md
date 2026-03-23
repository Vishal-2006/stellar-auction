# Auction Pulse - Soroban Smart Contract

A Soroban smart contract for the Auction Pulse real-time bidding dApp on Stellar Network.

## Features

- ✅ Real-time bid placement
- ✅ Automatic validation of bid amounts
- ✅ Event emission on new bids ("new_bid")
- ✅ Persistent bid history
- ✅ Top bidder tracking
- ✅ Reset functionality (for testing)

## Project Structure

```
auction-contract/
├── Cargo.toml                 # Workspace root
├── contracts/
│   └── auction/
│       ├── Cargo.toml        # Contract crate
│       └── src/
│           ├── lib.rs        # Main contract code
│           └── test.rs       # Unit tests
└── README.md
```

## Prerequisites

### Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup update stable
```

### Install Soroban CLI
```bash
# Download from: https://github.com/stellar/stellar-cli/releases
# Or compile from source:
cargo install --locked stellar-cli
```

### Verify Installation
```bash
rustc --version
stellar --version
```

## Build Steps

### Step 1: Build Locally
```bash
cd auction-contract
cargo build --target wasm32-unknown-unknown --release
```

**Output**: `target/wasm32-unknown-unknown/release/auction_contract.wasm`

### Step 2: Verify WASM Binary
```bash
# Check file exists
dir target\wasm32-unknown-unknown\release\auction_contract.wasm

# Check file size (should be < 200KB)
```

### Step 3: Build With Stellar CLI
```bash
stellar contract build --out-dir ./wasm
```

## Deployment to Testnet

### Step 1: Create Stellar Account
```bash
# Generate account
stellar keys generate my-auction-account --network testnet

# Get the public key
stellar keys show my-auction-account

# Fund account (visit: https://friendbot.stellar.org/?addr=GXXXXXX)
```

### Step 2: Deploy Contract
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/auction_contract.wasm \
  --source my-auction-account \
  --network testnet
```

**Save the contract ID from output!**

### Step 3: Add to Frontend
Create `.env.local` in `../auction-pulse/`:
```env
NEXT_PUBLIC_AUCTION_CONTRACT_ID=CABC3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ
```

## Testing

### Run Unit Tests
```bash
cargo test --lib
```

### Query Contract on Testnet
```bash
# Get top bid
stellar contract invoke \
  --id CAB3Z5G7... \
  --source my-auction-account \
  --network testnet \
  -- get_top_bid

# Place a bid
stellar contract invoke \
  --id CAB3Z5G7... \
  --source my-auction-account \
  --network testnet \
  -- place_bid \
  --bidder "GXXXXX..." \
  --amount 1000
```

## Contract Methods

### `get_top_bid() -> (String, i128)`
Returns the current top bidder address and bid amount.

```rust
let (bidder, amount) = client.get_top_bid();
```

### `place_bid(bidder: String, amount: i128) -> Result<bool, String>`
Place a new bid on the auction.

**Parameters**:
- `bidder`: Bidder's Stellar address
- `amount`: Bid amount (unit: stroops, 1 XLM = 10^7 stroops)

**Returns**: `Ok(true)` on success, `Err(message)` on failure

**Validation**:
- Amount must be > 0
- Amount must be > current top bid
- Bidder address cannot be empty

**Emits**: `new_bid` event with (bidder, amount)

### `get_bid_history() -> Vec<(String, i128)>`
Returns bid history (currently top bidder only).

### `is_top_bidder(address: String) -> bool`
Check if an address is the current winning bidder.

### `version() -> String`
Returns contract version.

### `reset()`
Reset the auction (for testing only - requires authorization in production).

## Events

### `new_bid`
Emitted when a new bid is placed.

**Data**:
```
(bidder: String, amount: i128)
```

**Listen for events**:
```javascript
server.getEvents({
  filters: [
    {
      type: "contract",
      contractId: CONTRACT_ID,
      topics: ["AAAADwAAAAtuZXdfdmlk"], // "new_bid" in base64
    },
  ],
});
```

## Error Codes

| Error | Meaning |
|-------|---------|
| "Bid amount must be positive" | Amount ≤ 0 |
| "Bidder address cannot be empty" | Bidder string is empty |
| "Bid must be higher than current top bid" | Amount ≤ current top bid |

## Gas & Performance

- **Deployment cost**: ~500-1000 stroops
- **place_bid cost**: ~100-200 stroops
- **get_top_bid cost**: ~50 stroops (read-only)

## Security Considerations

⚠️ **WARNING**: This is a demonstration contract. For production use:

1. Add proper authorization/authentication
2. Implement access control for admin functions
3. Add auction end time logic
4. Implement refund mechanism for outbid participants
5. Audit contract before mainnet deployment
6. Add rate limiting for bids

## Integration with Frontend

See `../auction-pulse/src/lib/stellar.ts` for integration examples.

## Resources

- [Soroban Documentation](https://developers.stellar.org/docs/build/smart-contracts)
- [Stellar CLI Docs](https://developers.stellar.org/docs/build/tools/cli)
- [JavaScript SDK](https://js.stellar.org/)
- [Testnet Friendbot](https://friendbot.stellar.org/)

## License

This project is licensed under the Apache License 2.0.
