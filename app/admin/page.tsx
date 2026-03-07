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
        const usersData = await usersRes.json().catch(() => ({ data: [] }));

        const hotels = hotelsData.data || [];
        const bookings = bookingsData.data?.bookings || [];
        const users = usersData.data || [];

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
          users: users.length,
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
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Hotels"
              value={stats.hotels}
              color="blue"
            />
            <StatCard
              title="Total Rooms"
              value={stats.rooms}
              color="green"
            />
            <StatCard
              title="Total Bookings"
              value={stats.bookings}
              color="purple"
            />
            <StatCard
              title="Active Bookings"
              value={stats.activeBookings}
              color="orange"
            />
            <StatCard
              title="Total Users"
              value={stats.users}
              color="blue"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push("/admin/hotels")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">Manage Hotels</h3>
                <p className="text-sm text-gray-600 mt-1">Add, edit, or delete hotels</p>
              </button>
              <button
                onClick={() => router.push("/admin/bookings")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">Manage Bookings</h3>
                <p className="text-sm text-gray-600 mt-1">View and manage all bookings</p>
              </button>
              <button
                onClick={() => router.push("/admin/users")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600 mt-1">View and manage user accounts</p>
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}

export default function AdminPage() {
  return <AdminDashboardContent />;
}
