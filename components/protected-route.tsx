"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const initialized = useRef(false);

  // Check localStorage directly to avoid race condition
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedUser = apiClient.getUser();
    if (!storedUser) {
      router.replace("/login");
    }
  }, [router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, check localStorage
  if (!isAuthenticated) {
    const storedUser = apiClient.getUser();
    if (!storedUser) {
      return null;
    }
  }

  return <>{children}</>;
}
