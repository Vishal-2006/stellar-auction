# 🚀 Auction Pulse - Real-Time Soroban Auction Dashboard

[![Stellar](https://img.shields.io/badge/Stellar-Blockchain-blue?style=for-the-badge)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 📝 About the Project

Auction Pulse is a Soroban-powered auction dApp on Stellar Testnet. It delivers multi-wallet connectivity, live on-chain bidding, and real-time event sync so the UI updates without page refresh. All bids are validated client-side and verified on-chain for transparency.

![Dashboard Preview](public/screenshots/Screenshot%202026-03-23%20204019.png)
![Dashboard Preview](public/screenshots/Screenshot%202026-03-23%20203912.png)

---

## ✨ Key Features

- 🔐 **Multi-Wallet Integration** - StellarWalletsKit with Freighter, Albedo, and xBull.
- 📡 **Real-Time Auction Updates** - Soroban RPC events drive live bid history and top-bid updates.
- 🧾 **Read + Write Contract Calls** - Simulated reads and signed writes with wallet approval.
- 🚨 **Explicit Error Handling** - Wallet Not Found, User Rejected, Insufficient Balance.
- 🔗 **Transaction Proof** - StellarExpert links for submitted transactions.
- 🧠 **Protected Dashboard** - Auto-redirect on connect + persistent session restore.
- 🎨 **Premium UI** - Dark, focused auction UX with smooth motion.

---

## 📸 Screenshots (Submission Order)

| Order | What to Capture | Preview |
| --- | --- | --- |
| 1 | Multi-wallet selector modal (Freighter + Albedo + xBull) | <img src="public/screenshots/Screenshot%202026-03-23%20210943.png" width="360" /> |
| 2 | Contract state live data (Highest Bid) | <img src="public/screenshots/Screenshot%202026-03-23%20204019.png" width="360" /> |
| 3 | Signing popup for place_bid | <img src="public/screenshots/Screenshot%202026-03-23%20203942.png" width="360" /> |
| 4 | Successful bid + event toast | <img src="public/screenshots/Screenshot%202026-03-23%20204005.png" width="360" /> |
| 5 | Error Handling: Wallet Not Found (Freighter install prompt) | <img src="public/screenshots/Screenshot%202026-03-23%20203912.png" width="360" /> |
| 6 | Error Handling: User Rejected | <img src="public/screenshots/Screenshot%202026-03-23%20205457.png" width="360" /> |
| 7 | Error Handling: Insufficient Balance | <img src="public/screenshots/Screenshot%202026-03-23%20205254.png" width="360" /> |
| 8 | Contract deployed (CLI output / explorer confirmation) | <img src="public/screenshots/Screenshot%202026-03-23%20100331.png" width="360" /> |

---

## 🛠️ Technology Stack

### Frontend
- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide React**

### Blockchain
- **Soroban RPC**
- **Stellar SDK**
- **StellarWalletsKit** (Freighter, Albedo, xBull)
- **Stellar Testnet**

---

## 📦 Installation & Setup

### Requirements
- **Node.js** 20.x or higher
- **npm** or **yarn**
- A Stellar wallet extension (Freighter recommended)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vishal-2006/auction-pulse.git
   cd auction-pulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
   NEXT_PUBLIC_AUCTION_CONTRACT_ID=CBJKU6MOUVZDJQ7T3WI4FLWUFFAGEOSUILLPQRGKU3JGSM4OT73BOXE
   NEXT_PUBLIC_ADMIN_ADDRESS=GAIF2YWTN7IDJ3UMETNEN73ARTA34AHB5PNK4ESU2B25DWUH3XPTB3XZ
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

---

## 🔍 Verification Links

- Contract ID: `CBJKU6MOUVZDJQ7T3WI4FLWUFFAGEOSUILLPQRGKU3JGSM4OT73BOXE`
- Transaction Hash: https://stellar.expert/explorer/testnet/tx/29d4f1b396ba112c76dd6d3194bd9b0065783a03078a334978927b117ecfd213

---

## 🧰 Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
