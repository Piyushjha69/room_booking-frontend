"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import { showToast } from "@/lib/toast";
import Link from "next/link";

interface Hotel {
  id: string;
  name: string;
  totalRooms: number;
}

function AdminHotelsContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState<string | null>(null);

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
        showToast.success("Hotel created successfully!");
        setHotelName("");
        setShowForm(false);
        fetchHotels();
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || "Failed to create hotel");
      }
    } catch (error) {
      showToast.error("Error creating hotel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    setHotelToDelete(hotelId);
    setShowDeleteModal(true);
  };

  const confirmDeleteHotel = async () => {
    if (!hotelToDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/${hotelToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast.success("Hotel deleted successfully!");
        fetchHotels();
      } else {
        showToast.error("Failed to delete hotel");
      }
    } catch (error) {
      showToast.error("Error deleting hotel");
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
      key: "totalRooms",
      label: "Total Rooms",
      render: (value: number) => `${value || 0} rooms`,
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
      <div className="min-h-screen gradient-hero">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/admin" className="text-red-400 hover:text-red-300 font-medium">← Back to Dashboard</Link>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Hotels</h2>
              <Button onClick={() => router.push("/admin/hotels/create")}>Add Hotel</Button>
            </div>

            <Modal
              isOpen={showForm}
              onClose={() => setShowForm(false)}
              title="Create Hotel"
              description="Enter the name of the new hotel"
            >
              <form onSubmit={handleCreateHotel}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hotel Name</label>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full input-base"
                    placeholder="Enter hotel name"
                    required
                  />
                </div>
              </form>
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleCreateHotel} isLoading={submitting} className="flex-1">Create</Button>
              </div>
            </Modal>

            <DataTable columns={columns} data={hotels} actions={actions} emptyMessage="No hotels found" />
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setHotelToDelete(null);
        }}
        onConfirm={confirmDeleteHotel}
        title="Delete Hotel"
        description="Are you sure you want to delete this hotel? This action cannot be undone and will delete all associated rooms."
        confirmText="Delete Hotel"
        cancelText="Cancel"
        isDestructive
      />
    </ProtectedAdminRoute>
  );
}

export default function AdminHotelsPage() {
  return <AdminHotelsContent />;
}
