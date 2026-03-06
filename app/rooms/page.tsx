"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/button";

interface Room {
  id: string;
  name: string;
  pricePerNight: string | number;
  hotel: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filtering, setFiltering] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAllRooms();
      setRooms(data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to fetch rooms";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByAvailability = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    try {
      setFiltering(true);
      setError(null);
      const data = await apiClient.getAvailableRooms(startDate, endDate);
      setRooms(data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to filter rooms";
      setError(errorMsg);
    } finally {
      setFiltering(false);
    }
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchRooms();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Available Rooms
            </h1>
            <p className="text-gray-600">
              Find and book the perfect room for your stay
            </p>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleFilterByAvailability}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    type="submit"
                    disabled={filtering}
                    className="flex-1"
                  >
                    {filtering ? "Filtering..." : "Search"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleReset}
                    variant="secondary"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          {/* Rooms Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">No rooms available</p>
              <Button onClick={handleReset} variant="secondary">
                View all rooms
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-40 flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="text-lg font-semibold">{room.name}</p>
                      <p className="text-sm opacity-90">
                        {room.hotel.name}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Price per night</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ${typeof room.pricePerNight === 'string' 
                          ? parseFloat(room.pricePerNight).toFixed(2)
                          : room.pricePerNight.toFixed(2)
                        }
                      </p>
                    </div>
                    <Link href={`/book?roomId=${room.id}`}>
                      <Button className="w-full">Book Now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
