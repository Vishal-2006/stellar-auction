# Auction Pulse

Premium Web3 auction dashboard for Stellar Testnet with multi-wallet support, real-time event updates, and a responsive dashboard UX. Built to satisfy Yellow Belt Level 2 requirements with explicit error handling and verifiable transactions.

## Requirements Satisfied

- Multi-wallet integration via StellarWalletsKit (Freighter + Albedo + xBull)
- Explicit error handling:
  - Wallet Not Found
  - Transaction Rejected
  - Insufficient Balance
- Real-time event sync (Soroban RPC events + Horizon stream fallback)
- Transaction hash display with StellarExpert link on bid success
- Responsive UI with protected dashboard routes

## Features

- Wallet selector modal with provider-specific guidance
- Connected wallet badge and account display
- Bid validation and balance checks
- Outbid notifications with audio cue
- Transaction link: https://stellar.expert/explorer/testnet/tx/{hash}

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- framer-motion
- @creit.tech/stellar-wallets-kit
- @stellar/stellar-sdk

## Project Structure

- src/app/page.tsx: Landing page + wallet connect flow
- src/app/dashboard/page.tsx: Protected dashboard
- src/components/WalletSelectorModal.tsx: Multi-wallet selection UI
- src/components/WalletNotFoundModal.tsx: Wallet guidance modal
- src/components/BidConsole.tsx: Bid input and validations
- src/components/EventListener.tsx: Real-time notifications
- src/lib/stellar.ts: Soroban RPC helpers, Horizon client
- src/lib/walletKit.ts: Wallet connect/sign logic

## Environment Variables

Create a .env.local with:

```
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_AUCTION_CONTRACT_ID=CBJKU6MOUVZDJQ7T3WI4FLWUFFAGEOSUILLPQRGKU3JGSM4OT73BOXE
```

## Getting Started

Install dependencies:

```
npm install
```

Run the dev server:

```
npm run dev
```

Open http://localhost:3000

## Wallet Notes

- Freighter: browser extension required
- Albedo: requires account setup at https://albedo.finance
- xBull: optional additional wallet support

## Error Handling Behavior

- Wallet Not Found: shows guidance modal or message
- Transaction Rejected: shows toast with cancel notice
- Insufficient Balance: blocks bid and shows balance

## Screenshots (Submission Order)

1. Multi-Wallet Selector
   - Capture the WalletsKit modal showing Freighter + Albedo + xBull options.
   - File: public/screenshots/Screenshot%202026-03-23%20205733.png
2. Contract State (Live Data)
   - Capture AuctionHero or Leaderboard showing live on-chain data (Highest Bid or Timer).
   - File: public/screenshots/Screenshot%202026-03-23%20204019.png
3. Signing a Bid (Popup)
   - Capture the Freighter or Albedo signing popup for place_bid.
   - File: public/screenshots/Screenshot%202026-03-23%20203942.png
4. Successful Bid + Event Toast
   - Capture the dashboard with the sonner success toast for New Bid event.
   - File: public/screenshots/Screenshot%202026-03-23%20204005.png

Additional evidence:
- Error Handling (User Rejected): red alert message.
- Error Handling (Insufficient Balance): orange warning banner.
- Wallet Not Found: install prompt in wallet modal.

### Screenshot Embeds

Add your images here once captured:

![Multi-wallet selector](public/screenshots/Screenshot%202026-03-23%20205733.png)
![Contract state live data](public/screenshots/Screenshot%202026-03-23%20204019.png)
![Signing popup](public/screenshots/Screenshot%202026-03-23%20203942.png)
![Success toast](public/screenshots/Screenshot%202026-03-23%20204005.png)

## Verification Links

- Contract ID: CBJKU6MOUVZDJQ7T3WI4FLWUFFAGEOSUILLPQRGKU3JGSM4OT73BOXE
- Transaction Hash: https://stellar.expert/explorer/testnet/tx/29d4f1b396ba112c76dd6d3194bd9b0065783a03078a334978927b117ecfd213

## Submission Checklist

- Public GitHub repository
- README with setup instructions
- Minimum 2+ meaningful commits
- Screenshot: wallet options available
- Deployed contract address
- Transaction hash link (verifiable on StellarExpert)

## Scripts

- npm run dev
- npm run build
- npm run lint
