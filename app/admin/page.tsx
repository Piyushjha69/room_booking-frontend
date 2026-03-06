"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { Button } from "@/components/button";
import { apiClient } from "@/lib/api-client";
import { Hotel } from "@/lib/types";

function AdminDashboardContent() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"hotels" | "rooms">("hotels");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [roomData, setRoomData] = useState({
    hotelId: "",
    name: "",
    pricePerNight: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<string>("");

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setHotels(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: hotelName }),
        }
      );

      if (response.ok) {
        setMessage({ type: "success", text: "Hotel created successfully!" });
        setHotelName("");
        setShowHotelForm(false);
        fetchHotels();
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text:
            errorData.message ||
            "Failed to create hotel. Try a different name.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error creating hotel. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            hotelId: roomData.hotelId,
            name: roomData.name,
            pricePerNight: parseFloat(roomData.pricePerNight),
          }),
        }
      );

      if (response.ok) {
        setMessage({ type: "success", text: "Room created successfully!" });
        setRoomData({ hotelId: "", name: "", pricePerNight: "" });
        setShowRoomForm(false);
        fetchHotels();
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.message || "Failed to create room.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error creating room. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels/${hotelId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setMessage({ type: "success", text: "Hotel deleted successfully!" });
        fetchHotels();
      } else {
        setMessage({ type: "error", text: "Failed to delete hotel." });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error deleting hotel. Please try again.",
      });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setMessage({ type: "success", text: "Room deleted successfully!" });
        fetchHotels();
      } else {
        setMessage({ type: "error", text: "Failed to delete room." });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error deleting room. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
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
        {message && (
          <div
            className={`mb-4 p-4 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="tabs mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("hotels")}
            className={`px-6 py-3 font-medium ${
              activeTab === "hotels"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Hotels
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`px-6 py-3 font-medium ${
              activeTab === "rooms"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Rooms
          </button>
        </div>

        {activeTab === "hotels" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Hotels</h2>
              <Button
                onClick={() => setShowHotelForm(!showHotelForm)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {showHotelForm ? "Cancel" : "Add Hotel"}
              </Button>
            </div>

            {showHotelForm && (
              <form
                onSubmit={handleCreateHotel}
                className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter hotel name"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  isLoading={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Hotel
                </Button>
              </form>
            )}

            <div className="space-y-4">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {hotel.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {hotel.rooms.length} rooms
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleDeleteHotel(hotel.id)}
                      className="px-3 py-1 text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rooms" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Rooms</h2>
              <Button
                onClick={() => setShowRoomForm(!showRoomForm)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {showRoomForm ? "Cancel" : "Add Room"}
              </Button>
            </div>

            {showRoomForm && (
              <form
                onSubmit={handleCreateRoom}
                className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hotel
                    </label>
                    <select
                      value={roomData.hotelId}
                      onChange={(e) =>
                        setRoomData({ ...roomData, hotelId: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a hotel</option>
                      {hotels.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={roomData.name}
                      onChange={(e) =>
                        setRoomData({ ...roomData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Room 101"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Night ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={roomData.pricePerNight}
                    onChange={(e) =>
                      setRoomData({
                        ...roomData,
                        pricePerNight: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  isLoading={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Room
                </Button>
              </form>
            )}

            <div className="space-y-4">
              {hotels.map((hotel) =>
                hotel.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {room.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {hotel.name} • ${room.pricePerNight}/night
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="px-3 py-1 text-sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/hotels");
  }, [router]);

  return null;
}
