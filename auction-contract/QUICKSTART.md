# 🚀 Auction Pulse - Quick Start Guide

## Overview

This directory contains the complete **Soroban smart contract** for the Auction Pulse dApp.

**Structure:**
```
auction-contract/
├── Cargo.toml              # Workspace configuration
├── contracts/
│   └── auction/
│       ├── Cargo.toml      # Contract crate
│       └── src/
│           ├── lib.rs      # Contract implementation (125 lines)
│           └── test.rs     # Unit tests
├── scripts/
│   ├── deploy.ps1          # PowerShell helper (Windows)
│   ├── setup.sh            # Bash helper (Mac/Linux)
│   └── deploy.bat          # Batch helper (Windows)
└── README.md               # Full documentation
```

---

## ⚡ Quick Commands

### **Windows (PowerShell)**
```powershell
cd auction-contract

# Check everything
.\scripts\deploy.ps1 build
.\scripts\deploy.ps1 test

# Deploy (after creating Stellar account)
.\scripts\deploy.ps1 deploy -sourceKey auction-key -network testnet
```

### **Windows (Command Prompt)**
```cmd
cd auction-contract

# Check everything
scripts\deploy.bat build
scripts\deploy.bat test

# Deploy
scripts\deploy.bat deploy auction-key testnet
```

### **Mac/Linux**
```bash
cd auction-contract

# Make executable
chmod +x scripts/setup.sh

# Check everything
./scripts/setup.sh check
./scripts/setup.sh build
./scripts/setup.sh test

# Deploy
./scripts/setup.sh deploy auction-key testnet
```

---

## 📋 Step-by-Step Setup

### **1️⃣ Prerequisites (5 min)**

- **Rust toolchain**: [install.rust-lang.org](https://www.rust-lang.org/tools/install)
- **Stellar CLI**: [github.com/stellar/stellar-cli/releases](https://github.com/stellar/stellar-cli/releases)

**Verify:**
```bash
rustc --version     # Should show 1.70+
cargo --version
stellar --version
```

### **2️⃣ Build Contract (2-5 min)**

```bash
cd auction-contract
cargo build --target wasm32-unknown-unknown --release
```

**Success indicator:** WASM file created at `target/wasm32-unknown-unknown/release/auction_contract.wasm` (~100-150 KB)

### **3️⃣ Run Tests (1 min)**

```bash
cargo test --lib
```

**Expected output:**
```
test test::test_place_bid ... ok
test test::test_reject_lower_bid ... ok
test test::test_reject_negative_bid ... ok
```

### **4️⃣ Create Stellar Account (2 min)**

```bash
# Generate key pair
stellar keys generate --network testnet --name auction-key
# Output: G... (save this!)

# Fund with testnet XLM
# Visit: https://friendbot.stellar.org/?addr=G...
```

### **5️⃣ Deploy to Testnet (2 min)**

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/auction_contract.wasm \
  --source auction-key \
  --network testnet
```

**Expected output:**
```
Contract ID: C...xxxxxx
```

**⚠️ SAVE THIS ID** - You'll need it for the frontend!

### **6️⃣ Test on Testnet (1 min)**

```bash
# Get top bid (should be empty/default)
stellar contract invoke \
  --id <contract-id> \
  --source auction-key \
  --network testnet \
  -- get_top_bid

# Place a bid
stellar contract invoke \
  --id <contract-id> \
  --source auction-key \
  --network testnet \
  -- place_bid \
  --bidder "G..." \
  --amount "1000000"
```

### **7️⃣ Connect to Frontend (5 min)**

In your frontend project (`../auction-pulse/`), create `.env.local`:

```env
NEXT_PUBLIC_AUCTION_CONTRACT_ID=C...xxxxxx
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

Then update contract calls in `src/lib/stellar.ts`:
```typescript
import { SorobanRpc } from '@stellar/stellar-sdk';

const CONTRACT_ID = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ID!;
const rpc = new SorobanRpc.Server(process.env.NEXT_PUBLIC_SOROBAN_RPC_URL!);

// Contract methods will now work end-to-end
```

---

## 🧪 Contract Methods

### **Reading Bids**
```bash
# Get current top bid
stellar contract invoke --id <contract-id> --source <key> \
  --network testnet -- get_top_bid

# Get bid history (last 10)
stellar contract invoke --id <contract-id> --source <key> \
  --network testnet -- get_bid_history

# Check if user is top bidder
stellar contract invoke --id <contract-id> --source <key> \
  --network testnet -- is_top_bidder --address "G..."
```

### **Placing Bids**
```bash
# Place a bid of 1 XLM (10^7 stroops)
stellar contract invoke --id <contract-id> --source <key> \
  --network testnet -- place_bid \
  --bidder "G..." \
  --amount "10000000"
```

### **Admin Operations**
```bash
# Reset auction (clear all bids)
stellar contract invoke --id <contract-id> --source <key> \
  --network testnet -- reset
```

---

## 🐛 Troubleshooting

### **"Rust not found"**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown
```

### **"stellar: command not found"**
- Download: [stellar-cli/releases](https://github.com/stellar/stellar-cli/releases)
- Add to PATH or run with full path

### **Build error: "edition 2021"**
Ensure `Cargo.toml` has:
```toml
edition = "2021"
```

### **Deployment fails: "Account not found"**
1. Fund account first: https://friendbot.stellar.org/?addr=G...
2. Wait 10-30 seconds for network sync
3. Retry deployment

### **Contract timeout**
RPC calls from Testnet can be slow. Check status:
```bash
stellar transaction info <tx-hash> --network testnet
```

---

## 📚 Documentation

- **[README.md](./README.md)** - Full contract documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Detailed deployment guide (7 phases)
- **[../README.md](../README.md)** - Frontend dApp documentation

---

## 🎯 What's Next?

1. ✅ Smart contract is built and tested
2. ✅ Scripts are ready for deployment
3. ⏳ **YOU**: Deploy to Testnet and get contract ID
4. ⏳ Add contract ID to frontend `.env.local`
5. ⏳ Test end-to-end bidding flow

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for 7-phase step-by-step guide.

---

## 📦 Project Context

This contract is part of the **Auction Pulse** Level 2 dApp for Stellar:
- Real-time bidding with WebSocket updates
- Freighter wallet integration
- 3+ error handling types
- Dark theme with animations
- Full frontend in `../auction-pulse/`

**Total build time:** 5-10 minutes
**Gas estimates:** ~500 ops per bid (included in README.md)
