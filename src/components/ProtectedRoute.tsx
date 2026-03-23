"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuction } from "@/app/hooks/useAuction";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { state } = useAuction();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if wallet is not connected (and not loading)
    if (!state.isConnected && !state.isLoading) {
      router.push("/");
    }
  }, [state.isConnected, state.isLoading, router]);

  // Show loading state while checking wallet connection
  if (!state.isConnected && state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not connected, don't render children (redirect will happen)
  if (!state.isConnected) {
    return null;
  }

  return <>{children}</>;
}
