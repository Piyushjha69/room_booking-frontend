"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/button";
import { showToast } from "@/lib/toast";
import { Modal } from "@/components/modal";

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
  const [filter, setFilter] = useState<'all' | 'active' | 'canceled'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

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
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch bookings";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setBookingToCancel(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      setCanceling(bookingToCancel);
      setError(null);
      await apiClient.cancelBooking(bookingToCancel);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToCancel ? { ...b, bookingStatus: "CANCELED" } : b
        )
      );
      showToast.success('Booking canceled successfully');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to cancel booking";
      setError(errorMsg);
      showToast.error(errorMsg);
    } finally {
      setCanceling(null);
      setBookingToCancel(null);
    }
  };

  const getFilteredAndSortedBookings = () => {
    let filtered = [...bookings];

    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(b => b.bookingStatus !== 'CANCELED');
    } else if (filter === 'canceled') {
      filtered = filtered.filter(b => b.bookingStatus === 'CANCELED');
    }

    // Apply sorting
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => {
        const priceA = (typeof a.room.pricePerNight === 'string' ? parseFloat(a.room.pricePerNight) : a.room.pricePerNight) * 
                       getNightsCount(a.startDate, a.endDate);
        const priceB = (typeof b.room.pricePerNight === 'string' ? parseFloat(b.room.pricePerNight) : b.room.pricePerNight) * 
                       getNightsCount(b.startDate, b.endDate);
        return priceB - priceA;
      });
    }

    return filtered;
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
      [key: string]: { bg: string; text: string; border?: string; label?: string };
    } = {
      PENDING: { bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-500/30" },
      BOOKED: { bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30", label: "Confirmed" },
      CANCELED: { bg: "bg-gray-700", text: "text-gray-400", border: "border-gray-600" },
      AVAILABLE: { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30" },
    };

    const style = statusStyles[status] || statusStyles["AVAILABLE"];
    const displayLabel = style.label || status;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text} ${style.border || ''} border`}>
        {displayLabel}
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
      <div className="min-h-screen gradient-hero py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard" className="text-red-400 hover:text-red-300 font-medium">
              &larr; Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                My Bookings
              </h1>
              <p className="text-gray-400">
                Manage and view all your reservations
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/rooms">
                <Button>Book New Room</Button>
              </Link>
              
              {/* Filter Dropdown */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="px-4 py-2 input-base bg-background-tertiary cursor-pointer"
              >
                <option value="all">All Bookings</option>
                <option value="active">Active</option>
                <option value="canceled">Canceled</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 input-base bg-background-tertiary cursor-pointer"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-12 glass-card">
              <p className="text-gray-400">Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-gray-400 mb-4">No bookings yet</p>
              <Link href="/rooms">
                <Button variant="secondary" className="border-gray-600 text-gray-300 hover:bg-gray-800">Browse Rooms</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const displayBookings = getFilteredAndSortedBookings();
                if (displayBookings.length === 0) {
                  return (
                    <div key="empty" className="glass-card p-12 text-center">
                      <p className="text-gray-400 mb-4">
                        {filter === 'all' 
                          ? 'No bookings yet' 
                          : `No ${filter} bookings found`}
                      </p>
                      <Link href="/rooms">
                        <Button variant="secondary" className="border-gray-600 text-gray-300 hover:bg-gray-800">Browse Rooms</Button>
                      </Link>
                    </div>
                  );
                }
                return displayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="glass-card overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center mb-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Room</p>
                          <p className="font-semibold text-white">
                            {booking.room.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            {booking.room.hotel.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Dates</p>
                          <p className="font-semibold text-white">
                            {formatDate(booking.startDate)} -{" "}
                            {formatDate(booking.endDate)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {getNightsCount(booking.startDate, booking.endDate)} nights
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Price</p>
                          <p className="font-semibold text-red-400">
                            ${(
                              (typeof booking.room.pricePerNight === 'string'
                                ? parseFloat(booking.room.pricePerNight)
                                : booking.room.pricePerNight) *
                              getNightsCount(booking.startDate, booking.endDate)
                            ).toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-400 mb-1">Status</p>
                          {getStatusBadge(booking.bookingStatus)}
                        </div>
                      </div>

                      {/* Actions */}
                      {booking.bookingStatus !== "CANCELED" && (
                        <div className="flex gap-2 pt-4 border-t border-gray-700">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={canceling === booking.id}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            {canceling === booking.id ? "Canceling..." : "Cancel Booking"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setBookingToCancel(null);
        }}
        onConfirm={confirmCancelBooking}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        isDestructive
      />
    </ProtectedRoute>
  );
}
