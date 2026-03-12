"use client";

import { useEffect, useState, useCallback, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/button";
import { showToast } from "@/lib/toast";
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
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [today] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const fetchRoomTypes = useCallback(async (start?: string, end?: string) => {
    try {
      setError(null);
      const data = await apiClient.getAvailableRoomTypes(start, end, hotelId || undefined);
      setRoomTypes(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch room types";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  const debouncedFetchAvailability = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (start?: string, end?: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchRoomTypes(start, end);
      }, 300);
    };
  }, [fetchRoomTypes]);

  useEffect(() => {
    if (!hotelId) {
      setError("Hotel ID is required");
      setLoading(false);
      return;
    }
    fetchRoomTypes();
  }, [hotelId, fetchRoomTypes]);

  useEffect(() => {
    if (!startDate || !endDate) {
      return;
    }

    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T00:00:00.000Z");

    if (start < new Date(today + "T00:00:00.000Z")) {
      return;
    }

    if (end <= start) {
      return;
    }

    debouncedFetchAvailability(start.toISOString(), end.toISOString());
  }, [startDate, endDate, today, debouncedFetchAvailability]);

  const handleBook = async (roomType: RoomType) => {
    if (!startDate || !endDate) {
      showToast.error("Please select check-in and check-out dates first");
      return;
    }

    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T00:00:00.000Z");

    if (start < new Date(today + "T00:00:00.000Z")) {
      showToast.error("Check-in date must be in the future");
      return;
    }

    if (end <= start) {
      showToast.error("Check-out date must be after check-in date");
      return;
    }

    try {
      setBookingLoading(roomType.roomType);
      
      await apiClient.createBooking({
        roomType: roomType.roomType,
        hotelId: roomType.hotelId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      
      showToast.success("Booking confirmed successfully! Redirecting to your bookings...");
      
      setTimeout(() => {
        router.push("/my-bookings");
      }, 1000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to create booking. Please try again.";
      showToast.error(errorMsg);
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <p className="text-gray-400">Loading room types...</p>
      </div>
    );
  }

  if (error && !roomTypes.length) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col items-center justify-center gradient-hero">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/rooms">
            <Button variant="secondary" className="border-gray-600 text-gray-300 hover:bg-gray-800">Back to Hotels</Button>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen gradient-hero py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <Link href="/rooms" className="inline-flex items-center text-red-400 hover:text-red-300 font-medium group transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 group-hover:-translate-x-1 transition-transform">
                <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
              </svg>
              Back to Hotels
            </Link>
          </div>
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Room Types</h1>
            <p className="text-lg text-gray-400">Select a room type to book your stay</p>
          </div>

          <div className="glass-card rounded-2xl p-8 mb-10">
            <h3 className="text-xl font-bold text-white mb-6">Select Your Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                  className="w-full input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  className="w-full input-base"
                />
              </div>
              <div className="flex items-end">
                {(startDate || endDate) && (
                  <Button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      fetchRoomTypes();
                    }}
                    variant="secondary"
                    className="w-full px-6 py-3 border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          {roomTypes.length === 0 ? (
            <div className="glass-card rounded-lg p-12 text-center">
              <p className="text-gray-400 mb-4">No rooms available for selected dates</p>
              <Link href="/rooms">
                <Button variant="secondary" className="border-gray-600 text-gray-300 hover:bg-gray-800">Browse Other Hotels</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomTypes.map((roomType) => {
                const isSoldOut = roomType.availableRooms === 0 && Boolean(startDate) && Boolean(endDate);
                return (
                <div
                  key={roomType.roomType}
                  className={`glass-card overflow-hidden flex flex-col ${isSoldOut ? 'opacity-60' : ''}`}
                >
                  <div className={`bg-gradient-to-r ${getGradientForRoomType(roomType.roomType)} h-32 flex items-center justify-center`}>
                    <div className="text-white text-center p-4">
                      <p className="font-bold text-2xl">{roomType.roomType}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <p className={`text-3xl font-bold ${isSoldOut ? 'text-gray-500' : 'text-red-400'}`}>
                          ${roomType.pricePerNight.toFixed(2)}
                          <span className="text-sm font-normal text-gray-400">/night</span>
                        </p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          roomType.availableRooms > 0 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : 'bg-gray-700 text-gray-400 border border-gray-600'
                        }`}>
                          {roomType.availableRooms > 0 ? `${roomType.availableRooms} available` : 'Sold Out'}
                        </span>
                      </div>

                      {isSoldOut && (
                        <p className="text-sm text-red-400 mb-4">
                          No rooms available for selected dates
                        </p>
                      )}
                      {!isSoldOut && startDate && endDate && roomType.availableRooms > 0 && (
                        <p className="text-sm text-green-400 mb-4">
                          {roomType.availableRooms} room(s) available for your dates
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleBook(roomType)}
                      disabled={bookingLoading === roomType.roomType || (!startDate || !endDate) || isSoldOut}
                      className="w-full"
                    >
                      {bookingLoading === roomType.roomType 
                        ? "Booking..." 
                        : isSoldOut 
                          ? "Sold Out"
                          : startDate && endDate 
                            ? "Book Now" 
                            : "Select Dates First"}
                    </Button>
                  </div>
                </div>
              )})}
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
