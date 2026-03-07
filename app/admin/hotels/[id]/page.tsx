"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { Button } from "@/components/button";
import { DataTable } from "@/components/data-table";
import { Modal } from "@/components/modal";
import { showToast } from "@/lib/toast";
import Link from "next/link";

interface Room {
  id: string;
  name: string;
  pricePerNight: number | string;
}

interface Hotel {
  id: string;
  name: string;
  rooms: Room[];
}

function AdminHotelDetailContent() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string;
  
  const { user, logout } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomData, setRoomData] = useState({ name: "", pricePerNight: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchHotel = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHotel(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch hotel:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) {
      fetchHotel();
    }
  }, [hotelId]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hotelId,
          name: roomData.name,
          pricePerNight: parseFloat(roomData.pricePerNight),
        }),
      });

      if (response.ok) {
        showToast.success("Room created successfully!");
        setRoomData({ name: "", pricePerNight: "" });
        setShowRoomForm(false);
        fetchHotel();
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || "Failed to create room");
      }
    } catch (error) {
      showToast.error("Error creating room");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        showToast.success("Room deleted successfully!");
        fetchHotel();
      } else {
        showToast.error("Failed to delete room");
      }
    } catch (error) {
      showToast.error("Error deleting room");
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
    { key: "name", label: "Room Name" },
    {
      key: "pricePerNight",
      label: "Price Per Night",
      render: (value: number | string) => `$${typeof value === 'string' ? parseFloat(value).toFixed(2) : value.toFixed(2)}`,
    },
  ];

  const actions = (row: Room) => (
    <Button variant="secondary" onClick={() => handleDeleteRoom(row.id)} className="px-3 py-1 text-sm text-red-600">
      Delete
    </Button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <ProtectedAdminRoute>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Hotel not found</p>
        </div>
      </ProtectedAdminRoute>
    );
  }

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
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
            <Link href="/admin/hotels" className="text-blue-600 hover:text-blue-800">← Back to Hotels</Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Rooms</h2>
              <Button onClick={() => setShowRoomForm(true)}>Add Room</Button>
            </div>

            <Modal
              isOpen={showRoomForm}
              onClose={() => setShowRoomForm(false)}
              title="Add Room"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setShowRoomForm(false)}>Cancel</Button>
                  <Button onClick={handleCreateRoom} isLoading={submitting}>Create</Button>
                </>
              }
            >
              <form onSubmit={handleCreateRoom}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
                  <input
                    type="text"
                    value={roomData.name}
                    onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Deluxe Room"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Night ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={roomData.pricePerNight}
                    onChange={(e) => setRoomData({ ...roomData, pricePerNight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </form>
            </Modal>

            <DataTable 
              columns={columns} 
              data={hotel.rooms || []} 
              actions={actions} 
              emptyMessage="No rooms in this hotel" 
            />
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}

export default function AdminHotelDetailPage() {
  return <AdminHotelDetailContent />;
}
