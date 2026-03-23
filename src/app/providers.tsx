"use client";

import { AuctionProvider } from "@/app/hooks/useAuction";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <AuctionProvider>{children}</AuctionProvider>;
}
