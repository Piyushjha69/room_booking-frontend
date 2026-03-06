"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/button";

interface Booking {
  id: string;
  roomId: string;
  startDate: string;
  endDate: string;
  bookingStatus: string;
  createdAt: string;
  room: {
    id: string;
    name: string;
    pricePerNight: string | number;
    hotel: {
      id: string;
      name: string;
    };
  };
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getUserBookings();
      setBookings(data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to fetch bookings";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCanceling(bookingId);
      setError(null);
      await apiClient.cancelBooking(bookingId);
      // Remove the canceled booking from the list
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, bookingStatus: "CANCELED" } : b
        )
      );
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to cancel booking";
      setError(errorMsg);
    } finally {
      setCanceling(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: {
      [key: string]: { bg: string; text: string };
    } = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
      BOOKED: { bg: "bg-green-100", text: "text-green-800" },
      CANCELED: { bg: "bg-red-100", text: "text-red-800" },
      AVAILABLE: { bg: "bg-blue-100", text: "text-blue-800" },
    };

    const style = statusStyles[status] || statusStyles["AVAILABLE"];

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
        {status}
      </span>
    );
  };

  const getNightsCount = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Bookings
              </h1>
              <p className="text-gray-600">
                Manage and view all your reservations
              </p>
            </div>
            <Link href="/rooms">
              <Button>Book New Room</Button>
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <Link href="/rooms">
                <Button>Browse Rooms</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Room</p>
                        <p className="font-semibold text-gray-900">
                          {booking.room.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.room.hotel.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Dates</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(booking.startDate)} -{" "}
                          {formatDate(booking.endDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getNightsCount(booking.startDate, booking.endDate)} nights
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Price</p>
                        <p className="font-semibold text-gray-900">
                          ${(
                            (typeof booking.room.pricePerNight === 'string'
                              ? parseFloat(booking.room.pricePerNight)
                              : booking.room.pricePerNight) *
                            getNightsCount(booking.startDate, booking.endDate)
                          ).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        {getStatusBadge(booking.bookingStatus)}
                      </div>
                    </div>

                    {/* Actions */}
                    {booking.bookingStatus !== "CANCELED" && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={canceling === booking.id}
                        >
                          {canceling === booking.id ? "Canceling..." : "Cancel Booking"}
                        </Button>
                      </div>
                    )}
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
