"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuction } from "@/app/hooks/useAuction";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { state, disconnect } = useAuction();

  return (
    <div className="flex min-h-screen bg-slate-950 bg-[radial-gradient(1200px_circle_at_0%_0%,rgba(16,185,129,0.08),transparent_40%),radial-gradient(900px_circle_at_100%_0%,rgba(56,189,248,0.06),transparent_45%)]">
      {/* Sidebar */}
      <Sidebar
        userAddress={state.userAddress}
        walletProvider={state.walletProvider}
        onDisconnect={disconnect}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:pl-72">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
