# Auction Pulse Contract - Step-by-Step Deployment Guide

Follow these exact steps to deploy your smart contract to Stellar Testnet.

## Phase 1: Setup & Prerequisites

### 1.1 - Verify Rust Installation
```powershell
# In PowerShell
rustc --version
# Expected output: rustc 1.XX.X (...)

cargo --version
# Expected output: cargo 1.XX.X
```

✅ If both show versions, proceed to 1.2

❌ If not installed:
```powershell
# Install Rust
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri https://win.rustup.rs -OutFile rustup-init.exe
.\rustup-init.exe -y
$env:PATH += ";$env:USERPROFILE\.cargo\bin"
```

### 1.2 - Install wasm32 Target
```powershell
rustup target add wasm32-unknown-unknown
```

### 1.3 - Install Stellar CLI
Download from: https://github.com/stellar/stellar-cli/releases/download/v21.6.0/stellar-cli-21.6.0-x86_64-pc-windows-msvc.exe

Or via Scoop (if installed):
```powershell
scoop install stellar-cli
```

Verify installation:
```powershell
stellar --version
# Expected: stellar 21.6.0 (or newer)
```

---

## Phase 2: Build the Contract

### 2.1 - Navigate to Contract Directory
```powershell
cd c:\Users\visha\auction-contract
```

### 2.2 - Build WASM Binary
```powershell
cargo build --target wasm32-unknown-unknown --release
```

Expected output:
```
Compiling auction-contract v0.1.0
Finished `release` profile [optimized] target(s) in 45.23s
```

### 2.3 - Verify WASM File
```powershell
# Check file exists
Test-Path "target\wasm32-unknown-unknown\release\auction_contract.wasm"
# Should return: True

# Check file size
(Get-Item "target\wasm32-unknown-unknown\release\auction_contract.wasm").Length
# Should be less than 200KB
```

---

## Phase 3: Create Stellar Account

### 3.1 - Generate Key Pair
```powershell
stellar keys generate auction-key --network testnet
```

Expected output:
```
Public Key:  GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Secret Key:  SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ SAVE THE SECRET KEY - You'll need it for signing!**

### 3.2 - Fund Your Account
1. Go to: https://friendbot.stellar.org/
2. Paste your **Public Key** (starts with 'G')
3. Click "Get Stellar Lumens"
4. Wait for confirmation

### 3.3 - Verify Account Funded
```powershell
stellar account info \
  --source-account GXXXXXXXXX \
  --network testnet
```

Expected output:
```
Account ID: GXXXXXXXXX
Sequence: 123456789
Balance: 10000 XLM
```

---

## Phase 4: Deploy Contract

### 4.1 - Deploy to Testnet
```powershell
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/auction_contract.wasm \
  --source auction-key \
  --network testnet
```

⏳ Wait for confirmation. Expected output:
```
Deployed contract with ID: CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ
```

**⭐ SAVE THIS CONTRACT ID - You need it for the frontend!**

### 4.2 - Verify Deployment
```powershell
stellar contract info \
  --id CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ \
  --network testnet
```

Should show contract details.

---

## Phase 5: Test Contract on Testnet

### 5.1 - Get Top Bid (Initial - Should be Empty)
```powershell
stellar contract invoke \
  --id CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ \
  --source auction-key \
  --network testnet \
  -- get_top_bid
```

Expected: Empty result (no bids yet)

### 5.2 - Place First Bid
```powershell
stellar contract invoke \
  --id CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ \
  --source auction-key \
  --network testnet \
  -- place_bid \
  --bidder "alice" \
  --amount 1000
```

Expected output:
```
Success! Invoked contract
```

### 5.3 - Verify Bid Recorded
```powershell
stellar contract invoke \
  --id CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ \
  --source auction-key \
  --network testnet \
  -- get_top_bid
```

Expected output:
```
[
  "alice",
  1000
]
```

### 5.4 - Try Invalid Bid (Lower Amount)
```powershell
stellar contract invoke \
  --id CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ \
  --source auction-key \
  --network testnet \
  -- place_bid \
  --bidder "bob" \
  --amount 500
```

Expected error:
```
Error: Bid must be higher than current top bid
```

✅ This is correct behavior!

### 5.5 - Place Higher Bid (Should Succeed)
```powershell
stellar contract invoke \
  --id CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ \
  --source auction-key \
  --network testnet \
  -- place_bid \
  --bidder "bob" \
  --amount 2000
```

Expected: Success

### 5.6 - Verify New Top Bid
```powershell
stellar contract invoke \
  --id CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ \
  --source auction-key \
  --network testnet \
  -- get_top_bid
```

Expected output:
```
[
  "bob",
  2000
]
```

---

## Phase 6: Connect to Frontend

### 6.1 - Update Frontend Environment
Edit: `c:\Users\visha\auction-pulse\.env.local`

Add the line:
```env
NEXT_PUBLIC_AUCTION_CONTRACT_ID=CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ
```

Replace with your actual contract ID from Phase 4.1

### 6.2 - Restart Frontend Dev Server
```powershell
cd c:\Users\visha\auction-pulse
npm run dev
```

### 6.3 - Test Integration
1. Open http://localhost:3000
2. Connect wallet (Freighter)
3. Click "Place Bid"
4. Enter amount and confirm
5. Check if bid appears in Bid Leaderboard

---

## Phase 7: Troubleshooting

### Issue: "Command not found: stellar"
**Solution**: Stellar CLI not in PATH
```powershell
# Add to PATH
$env:PATH += ";C:\Program Files\stellar-cli"
stellar --version
```

### Issue: "wasm32-unknown-unknown not installed"
**Solution**: Install the target
```powershell
rustup target add wasm32-unknown-unknown
```

### Issue: "Contract already exists"
**Solution**: Use a different account or network. Each deployment must be unique.

### Issue: "Insufficient funds"
**Solution**: Get more testnet XLM from friendbot: https://friendbot.stellar.org/

### Issue: "Bid validation failed in frontend"
**Solution**: Update frontend contract invocation. See `src/lib/stellar.ts`

---

## Summary Checklist

- ✅ Rust + Cargo installed
- ✅ wasm32 target installed
- ✅ Stellar CLI installed (v21.6.0+)
- ✅ Contract built locally (WASM file exists)
- ✅ Stellar account created
- ✅ Account funded with testnet XLM
- ✅ Contract deployed to testnet
- ✅ Contract ID saved
- ✅ Contract tested with CLI
- ✅ Frontend environment updated
- ✅ Frontend successfully connects to contract

---

## Useful Commands (Copy/Paste Ready)

```powershell
# Build contract
cargo build --target wasm32-unknown-unknown --release

# Check WASM file
Test-Path "target\wasm32-unknown-unknown\release\auction_contract.wasm"

# Generate key
stellar keys generate auction-key --network testnet

# Deploy contract
stellar contract deploy `
  --wasm target/wasm32-unknown-unknown/release/auction_contract.wasm `
  --source auction-key `
  --network testnet

# Get top bid
stellar contract invoke `
  --id CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ `
  --source auction-key `
  --network testnet `
  -- get_top_bid

# Place a bid
stellar contract invoke `
  --id CAB3Z5G7IVK2KTFXL4Z2ZQXX5XQZVXKVVDQGVWZ7U4ZKDFKQ5KRBVZ `
  --source auction-key `
  --network testnet `
  -- place_bid `
  --bidder "your-name" `
  --amount 5000
```

---

## Support

For issues:
1. Check [Stellar Docs](https://developers.stellar.org/)
2. Review [Soroban CLI Reference](https://developers.stellar.org/docs/build/tools/cli)
3. Check Testnet status: https://status.stellar.org/

Good luck! 🚀
