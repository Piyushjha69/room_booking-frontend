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



  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">
                {user?.name || user?.email}
              </span>
              <Button
                variant="secondary"
                onClick={handleLogout}
                isLoading={isLoading}
                className="w-auto px-4"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.name}!
          </h2>
          <p className="text-gray-600 mb-6">
            Manage your room bookings from your personal dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/rooms">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Browse Rooms
              </Button>
            </Link>
            <Link href="/my-bookings">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                My Bookings
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Account Information
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Name:</strong> {user?.name}
              </p>
              <p>
                <strong>Member Since:</strong>{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Actions
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get started with your booking experience
            </p>
            <div className="space-y-2">
              <Link href="/rooms">
                <p className="text-sm text-blue-600 hover:text-blue-700">
                  → Find and book rooms
                </p>
              </Link>
              <Link href="/my-bookings">
                <p className="text-sm text-blue-600 hover:text-blue-700">
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
