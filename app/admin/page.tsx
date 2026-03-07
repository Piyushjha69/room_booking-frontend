"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { Button } from "@/components/button";
import { StatCard } from "@/components/stat-card";

function AdminDashboardContent() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [stats, setStats] = useState({
    hotels: 0,
    rooms: 0,
    bookings: 0,
    activeBookings: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        const [hotelsRes, bookingsRes, usersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, { headers }),
        ]);

        const hotelsData = await hotelsRes.json();
        const bookingsData = await bookingsRes.json();
        const statsData = await usersRes.json().catch(() => ({ data: {} }));

        const hotels = hotelsData.data || [];
        const bookings = bookingsData.data?.bookings || [];
        const usersCount = statsData.data?.users || 0;

        const now = new Date();
        const activeBookings = bookings.filter((b: any) => {
          const endDate = new Date(b.endDate);
          return b.bookingStatus !== "CANCELED" && endDate >= now;
        }).length;

        setStats({
          hotels: hotels.length,
          rooms: hotels.reduce((sum: number, h: any) => sum + (h.rooms?.length || 0), 0),
          bookings: bookings.length,
          activeBookings,
          users: usersCount,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Hotels"
              value={stats.hotels}
              color="red"
            />
            <StatCard
              title="Total Rooms"
              value={stats.rooms}
              color="red"
            />
            <StatCard
              title="Total Bookings"
              value={stats.bookings}
              color="red"
            />
            <StatCard
              title="Active Bookings"
              value={stats.activeBookings}
              color="red"
            />
            <StatCard
              title="Total Users"
              value={stats.users}
              color="red"
            />
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/admin/hotels")}
                className="glass-card p-4 hover:bg-white/5 transition-colors"
              >
                <h3 className="font-semibold text-white">Manage Hotels</h3>
                <p className="text-sm text-gray-400 mt-1">Add, edit, or delete hotels</p>
              </button>
              <button
                onClick={() => router.push("/admin/bookings")}
                className="glass-card p-4 hover:bg-white/5 transition-colors"
              >
                <h3 className="font-semibold text-white">Manage Bookings</h3>
                <p className="text-sm text-gray-400 mt-1">View and manage all bookings</p>
              </button>
              <button
                onClick={() => router.push("/admin/users")}
                className="glass-card p-4 hover:bg-white/5 transition-colors"
              >
                <h3 className="font-semibold text-white">Manage Users</h3>
                <p className="text-sm text-gray-400 mt-1">View and manage user accounts</p>
              </button>
            </div>
          </div>
        </main>
      </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedAdminRoute>
      <AdminDashboardContent />
    </ProtectedAdminRoute>
  );
}
