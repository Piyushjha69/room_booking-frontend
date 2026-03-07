"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/button";
import Link from "next/link";

interface RoomType {
  roomType: string;
  pricePerNight: number;
  availableRooms: number;
  hotelId: string;
  hotelName: string;
}

const getGradientForRoomType = (roomType: string) => {
  const gradients = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-red-500 to-red-600',
  ];
  
  const index = roomType.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
};

function RoomDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hotelId = searchParams.get("hotelId");

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [today] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const fetchRoomTypes = async (start?: string, end?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAvailableRoomTypes(start, end, hotelId || undefined);
      setRoomTypes(data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to fetch room types";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hotelId) {
      setError("Hotel ID is required");
      setLoading(false);
      return;
    }
    fetchRoomTypes();
  }, [hotelId]);

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      setError("Please select both check-in and check-out dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < new Date(today)) {
      setError("Check-in date must be in the future");
      return;
    }

    if (end <= start) {
      setError("Check-out date must be after check-in date");
      return;
    }

    try {
      setCheckingAvailability(true);
      setError(null);
      await fetchRoomTypes(start.toISOString(), end.toISOString());
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to check availability";
      setError(errorMsg);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBook = async (roomType: RoomType) => {
    if (!startDate || !endDate) {
      setError("Please select check-in and check-out dates first");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < new Date(today)) {
      setError("Check-in date must be in the future");
      return;
    }

    if (end <= start) {
      setError("Check-out date must be after check-in date");
      return;
    }

    try {
      setBookingLoading(roomType.roomType);
      setError(null);
      
      await apiClient.createBooking({
        roomType: roomType.roomType,
        hotelId: roomType.hotelId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      
      router.push("/my-bookings");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to create booking";
      setError(errorMsg);
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading room types...</p>
      </div>
    );
  }

  if (error && !roomTypes.length) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/rooms">
            <Button>Back to Hotels</Button>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/rooms" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Hotels
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Room Types
            </h1>
            <p className="text-gray-600">
              Select a room type to book your stay
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Check Availability</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
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
                  min={startDate || today}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={checkAvailability}
                  disabled={checkingAvailability}
                  className="flex-1"
                >
                  {checkingAvailability ? "Checking..." : "Check Availability"}
                </Button>
                {(startDate || endDate) && (
                  <Button
                    onClick={() => fetchRoomTypes()}
                    variant="secondary"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          {roomTypes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">No rooms available for selected dates</p>
              <Link href="/rooms">
                <Button>Browse Other Hotels</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomTypes.map((roomType) => (
                <div
                  key={roomType.roomType}
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
                >
                  <div className={`bg-gradient-to-r ${getGradientForRoomType(roomType.roomType)} h-32 flex items-center justify-center`}>
                    <div className="text-white text-center p-4">
                      <p className="font-bold text-2xl">{roomType.roomType}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-3xl font-bold text-green-600">
                          ${roomType.pricePerNight.toFixed(2)}
                          <span className="text-sm font-normal text-gray-600">/night</span>
                        </p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          roomType.availableRooms > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {roomType.availableRooms} available
                        </span>
                      </div>

                      {startDate && endDate && roomType.availableRooms === 0 && (
                        <p className="text-sm text-red-600 mb-4">
                          No rooms available for selected dates
                        </p>
                      )}
                      {startDate && endDate && roomType.availableRooms > 0 && (
                        <p className="text-sm text-green-600 mb-4">
                          {roomType.availableRooms} room(s) available for your dates
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleBook(roomType)}
                      disabled={bookingLoading === roomType.roomType || (!startDate || !endDate)}
                      className="w-full"
                    >
                      {bookingLoading === roomType.roomType 
                        ? "Booking..." 
                        : startDate && endDate 
                          ? "Book Now" 
                          : "Select Dates First"}
                    </Button>
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

export default function RoomDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <RoomDetailsContent />
    </Suspense>
  );
}
