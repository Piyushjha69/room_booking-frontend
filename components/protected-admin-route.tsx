"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useRef } from "react";
import { apiClient } from "@/lib/api-client";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const router = useRouter();
  const { isLoading } = useAuth();
  const initialized = useRef(false);

  // Check localStorage directly to avoid race condition
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const user = apiClient.getUser();
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Double-check localStorage after loading
  const user = apiClient.getUser();
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
