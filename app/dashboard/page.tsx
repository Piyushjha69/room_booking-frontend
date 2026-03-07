"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/button";
import { useEffect } from "react";

function DashboardContent() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }



  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Welcome, {user?.name || user?.email}!
          </h2>
          <p className="text-gray-400 mb-6">
            Manage your room bookings from your personal dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/rooms">
              <Button className="w-full">
                Browse Rooms
              </Button>
            </Link>
            <Link href="/my-bookings">
              <Button variant="secondary" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                My Bookings
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Account Information
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <strong className="text-gray-300">Email:</strong> {user?.email}
              </p>
              <p>
                <strong className="text-gray-300">Name:</strong> {user?.name}
              </p>
              <p>
                <strong className="text-gray-300">Member Since:</strong>{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Quick Actions
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Get started with your booking experience
            </p>
            <div className="space-y-2">
              <Link href="/rooms">
                <p className="text-sm text-red-400 hover:text-red-300 transition-colors">
                  → Find and book rooms
                </p>
              </Link>
              <Link href="/my-bookings">
                <p className="text-sm text-red-400 hover:text-red-300 transition-colors">
                  → Manage your reservations
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
