"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import Link from "next/link";

interface Hotel {
  id: string;
  name: string;
  rooms: any[];
}

function AdminHotelsContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHotels(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: hotelName }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Hotel created successfully!" });
        setHotelName("");
        setShowForm(false);
        fetchHotels();
      } else {
        const errorData = await response.json();
        setMessage({ type: "error", text: errorData.message || "Failed to create hotel" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error creating hotel" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!confirm("Are you sure? This will delete all associated rooms.")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/${hotelId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Hotel deleted successfully!" });
        fetchHotels();
      } else {
        setMessage({ type: "error", text: "Failed to delete hotel" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error deleting hotel" });
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
    { key: "name", label: "Hotel Name" },
    {
      key: "rooms",
      label: "Total Rooms",
      render: (value: any[]) => `${value?.length || 0} rooms`,
    },
  ];

  const actions = (row: Hotel) => (
    <div className="flex justify-end gap-2">
      <Link href={`/admin/hotels/${row.id}`}>
        <Button variant="secondary" className="px-3 py-1 text-sm">Manage</Button>
      </Link>
      <Button variant="secondary" onClick={() => handleDeleteHotel(row.id)} className="px-3 py-1 text-sm text-red-600">Delete</Button>
    </div>
  );

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Hotels</h1>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-4">{user?.name || user?.email}</span>
                <Button variant="secondary" onClick={handleLogout} className="w-auto px-4">Logout</Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {message && (
            <div className={`mb-4 p-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Hotels</h2>
              <Button onClick={() => setShowForm(true)}>Add Hotel</Button>
            </div>

            <Modal
              isOpen={showForm}
              onClose={() => setShowForm(false)}
              title="Create Hotel"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button onClick={handleCreateHotel} isLoading={submitting}>Create</Button>
                </>
              }
            >
              <form onSubmit={handleCreateHotel}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter hotel name"
                    required
                  />
                </div>
              </form>
            </Modal>

            <DataTable columns={columns} data={hotels} actions={actions} emptyMessage="No hotels found" />
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}

export default function AdminHotelsPage() {
  return <AdminHotelsContent />;
}
