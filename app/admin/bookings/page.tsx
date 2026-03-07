"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { showToast } from "@/lib/toast";

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  bookingStatus: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  room: {
    id: string;
    name: string;
    pricePerNight: number | string;
    hotel: {
      id: string;
      name: string;
    };
  };
}

function AdminBookingsContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data?.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast.success("Booking canceled successfully!");
        fetchBookings();
      } else {
        const data = await response.json();
        showToast.error(data.message || "Failed to cancel booking");
      }
    } catch (error) {
      showToast.error("Error canceling booking");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const columns = [
    {
      key: "user",
      label: "User",
      render: (value: any) => `${value?.name || value?.email}`,
    },
    {
      key: "room",
      label: "Room",
      render: (value: any) => `${value?.hotel?.name} - ${value?.name}`,
    },
    {
      key: "startDate",
      label: "Check-in",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "endDate",
      label: "Check-out",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "bookingStatus",
      label: "Status",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "PENDING" ? "bg-yellow-100 text-yellow-800" :
          value === "BOOKED" ? "bg-blue-100 text-blue-800" :
          value === "CANCELED" ? "bg-red-100 text-red-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {value}
        </span>
      ),
    },
  ];

  const actions = (row: Booking) => (
    <div className="flex justify-end gap-2">
      {row.bookingStatus !== "CANCELED" && (
        <Button 
          variant="secondary" 
          onClick={() => handleCancelBooking(row.id)} 
          className="px-3 py-1 text-sm text-red-600"
        >
          Cancel
        </Button>
      )}
    </div>
  );

  const filteredBookings = filterStatus === "all" 
    ? bookings 
    : bookings.filter(b => b.bookingStatus === filterStatus.toUpperCase());

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-4">{user?.name || user?.email}</span>
                <Button variant="secondary" onClick={handleLogout} className="w-auto px-4">Logout</Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">← Back to Dashboard</Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="booked">Booked</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            <DataTable 
              columns={columns} 
              data={filteredBookings} 
              actions={actions} 
              emptyMessage="No bookings found" 
            />
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}

export default function AdminBookingsPage() {
  return <AdminBookingsContent />;
}
