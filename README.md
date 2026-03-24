# 🚀 Stellar Pulse - Blockchain-Based Dashboard Platform

[![Stellar](https://img.shields.io/badge/Stellar-Blockchain-blue?style=for-the-badge)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.0.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 📝 About the Project

Stellar Pulse is a high-performance, decentralized dashboard built on the Stellar blockchain. It provides real-time insights, multi-recipient payment capabilities, and a seamless wallet integration experience. Unlike traditional financial dashboards, all transaction data is pulled directly from the blockchain via Horizon, ensuring complete transparency and low-latency interaction.

![Dashboard Preview](public/screenshots/Screenshot%202026-03-21%20224012.png)

---

## ✨ Key Features

-   🔐 **Secure Wallet Connection** - Integrated with Freighter for secure transaction signing.
-   📊 **Interactive Balance Display** - Real-time XLM tracking with local fiat conversion (.12/XLM mock).
-   ⚡ **Bulk Send (Multi-Payment)** - Build a single transaction with multiple operations for efficiency.
-   📉 **Market Insights** - 7-day XLM sparkline charts and 24h price trend analysis.
-   📡 **Network Pulse** - Real-time Horizon status monitoring and fee estimation (100 stroops base).
-   💸 **Auto-Faucet Integration** - One-click testnet funding for unactivated accounts.
-   📜 **Activity Feed** - Color-coded transaction history with direct links to [Stellar.Expert](https://stellar.expert).
-   🎨 **Midnight Tech Design** - Dark-mode optimized glassmorphism UI using Tailwind v4 & Framer Motion.

---

## 📸 Screenshots

### Dashboard Overview
![Main Dashboard](public/screenshots/Screenshot%202026-03-21%20224023.png)

### Wallet & Assets
<div align="center">
  <img src="public/screenshots/Screenshot%202026-03-21%20224105.png" width="45%" />
  <img src="public/screenshots/Screenshot%202026-03-21%20224206.png" width="45%" />
</div>

### Bulk Send Flow
![Bulk Send Input](public/screenshots/Screenshot%202026-03-21%20224413.png)
![Transaction Processing](public/screenshots/Screenshot%202026-03-21%20224427.png)

### Mobile & Dark Mode
<div align="center">
  <img src="public/screenshots/Screenshot%202026-03-21%20224436.png" width="30%" />
  <img src="public/screenshots/Screenshot%202026-03-21%20224444.png" width="30%" />
  <img src="public/screenshots/Screenshot%202026-03-21%20224457.png" width="30%" />
</div>

---

## 🎯 Bonus Features List

| #  | Feature                  | Status | 
| :- | :----------------------- | :----- | 
| 1  | 🌑 Dark Mode (Always On) | ✅      | 
| 2  | 📋 Copy Address          | ✅      |       
| 3  | 🏗️ Bulk Send Builder     | ✅      |   
| 4  | 📈 Asset Sparkline       | ✅      |   
| 5  | 🔄 Real-time Refresh     | ✅      |      
| 6  | 🔗 Explorer Integration  | ✅      | 
| 7  | ✨ Staggered Animations   | ✅      |     
| 8  | 📱 Mobile Responsive     | ✅      |      
| 9  | 🚰 Auto-Faucet Button   | ✅      |     
| 10 | 📡 Network Health Monitor| ✅      |



---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15+** (App Router)
- **TypeScript** (Type Safety)
- **Tailwind CSS v4** (Modern Styling)
- **Framer Motion** (Smooth Animations)
- **Lucide React** (Vector Icons)

### Blockchain
- **Stellar SDK v14.6.1** - Horizon connection & transaction building.
- **Freighter API v6.0.1** - Browser wallet integration.
- **Horizon Testnet** - Backend blockchain service.

---

## 📦 Installation & Setup

### Requirements
- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Freighter Wallet Extension** (Chrome/Firefox)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vishal-2006/stellar-tracker.git
   cd stellar-pulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment (Optional)**
   Create a `.env.local` if you need custom Horizon nodes, otherwise, it defaults to the Testnet.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

---

## 🏗️ Project Architecture

### Bento Grid Dashboard Layout
- **Top Left**: BalanceCard (Balance + Faucet)
- **Top Center**: AssetCard (Price Chart + History)
- **Top Right**: ActionCard (Network Status + Fees)
- **Bottom Left**: BulkSend (Multi-Recipient payment builder)
- **Bottom Right**: ActivityFeed (Transaction history list)

### Core Logic
Located in `src/lib/stellar.ts`, the core logic handles:
- Horizon Server initialization (`new Horizon.Server()`)
- Account hydration & balance fetching
- Multi-operation transaction building
- Freighter signing flow

---
