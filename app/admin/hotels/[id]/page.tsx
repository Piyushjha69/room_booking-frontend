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

interface GroupedRoom {
  roomType: string;
  totalRooms: number;
  pricePerNight: number;
  roomIds: string[];
}

interface Hotel {
  id: string;
  name: string;
}

function AdminHotelDetailContent() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string;
  
  const { user, logout } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [groupedRooms, setGroupedRooms] = useState<GroupedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomData, setRoomData] = useState({ name: "", count: "", pricePerNight: "" });
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomTypeToDelete, setRoomTypeToDelete] = useState<string | null>(null);

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
    }
  };

  const fetchGroupedRooms = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/${hotelId}/grouped-rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGroupedRooms(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch grouped rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) {
      fetchHotel();
      fetchGroupedRooms();
    }
  }, [hotelId]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const count = parseInt(roomData.count) || 1;

      for (let i = 1; i <= count; i++) {
        const roomName = `${roomData.name} ${i}`;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            hotelId,
            name: roomName,
            pricePerNight: parseFloat(roomData.pricePerNight),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          showToast.error(errorData.message || "Failed to create room");
          setSubmitting(false);
          return;
        }
      }

      showToast.success("Rooms created successfully!");
      setRoomData({ name: "", count: "", pricePerNight: "" });
      setShowRoomForm(false);
      fetchGroupedRooms();
    } catch (error) {
      showToast.error("Error creating rooms");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoomType = async (roomType: string) => {
    setRoomTypeToDelete(roomType);
    setShowDeleteModal(true);
  };

  const confirmDeleteRoomType = async () => {
    if (!roomTypeToDelete) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/${hotelId}/rooms-by-type`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomType: roomTypeToDelete }),
      });

      if (response.ok) {
        showToast.success("Room type deleted successfully!");
        fetchGroupedRooms();
      } else {
        showToast.error("Failed to delete room type");
      }
    } catch (error) {
      showToast.error("Error deleting room type");
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
    { key: "roomType", label: "Room Type" },
    { key: "totalRooms", label: "Total Rooms" },
    {
      key: "pricePerNight",
      label: "Price Per Night",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  const actions = (row: GroupedRoom) => (
    <Button variant="secondary" onClick={() => handleDeleteRoomType(row.roomType)} className="px-3 py-1 text-sm text-red-600">
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
              title="Add Room Type"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setShowRoomForm(false)}>Cancel</Button>
                  <Button onClick={handleCreateRoom} isLoading={submitting}>Create</Button>
                </>
              }
            >
              <form onSubmit={handleCreateRoom}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Room Type</label>
                  <input
                    type="text"
                    value={roomData.name}
                    onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., Deluxe NON-AC"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Rooms</label>
                  <input
                    type="number"
                    min="1"
                    value={roomData.count}
                    onChange={(e) => setRoomData({ ...roomData, count: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="1"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price Per Night ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={roomData.pricePerNight}
                    onChange={(e) => setRoomData({ ...roomData, pricePerNight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </form>
            </Modal>

            <DataTable 
              columns={columns} 
              data={groupedRooms} 
              actions={actions} 
              emptyMessage="No rooms in this hotel" 
            />
          </div>
        </main>
      </div>

      {/* Delete Room Type Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRoomTypeToDelete(null);
        }}
        onConfirm={confirmDeleteRoomType}
        title="Delete Room Type"
        description="Are you sure you want to delete all rooms of this type? This action cannot be undone."
        confirmText="Delete Room Type"
        cancelText="Cancel"
        isDestructive
      />
    </ProtectedAdminRoute>
  );
}

export default function AdminHotelDetailPage() {
  return <AdminHotelDetailContent />;
}
