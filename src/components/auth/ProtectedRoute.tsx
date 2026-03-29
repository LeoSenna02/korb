"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Where to redirect if not authenticated.
   * Defaults to /login.
   */
  redirectTo?: string;
}

/**
 * Guard component that:
 * - Shows a loading spinner while hydrating from LocalStorage
 * - Redirects to /login if not authenticated
 * - Renders children once authenticated
 */
export function ProtectedRoute({
  children,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, isHydrated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated && !isLoading) {
      router.replace(redirectTo);
    }
  }, [isHydrated, isAuthenticated, isLoading, redirectTo, router]);

  // Loading / hydrating state
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-surface-container border-t-primary rounded-full animate-spin" />
          <span className="font-data text-[11px] text-text-disabled tracking-wider">
            Carregando...
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated — don't render, redirect will happen in effect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-surface-container border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
