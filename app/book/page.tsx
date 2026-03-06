"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
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
}

function BookingFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const roomId = searchParams.get("roomId");

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!roomId) {
      setError("Room ID is required");
      return;
    }

    const fetchRoom = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getRoomById(roomId);
        setRoom(data);
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || "Failed to fetch room";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.startDate || !formData.endDate) {
      setError("Please select both check-in and check-out dates");
      return false;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      setError("Check-out date must be after check-in date");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      setError("Check-in date must be in the future");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !roomId) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Convert dates to ISO strings
      const startDateTime = new Date(formData.startDate).toISOString();
      const endDateTime = new Date(formData.endDate).toISOString();

      await apiClient.createBooking({
        roomId,
        startDate: startDateTime,
        endDate: endDateTime,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/my-bookings");
      }, 2000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create booking";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading room details...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Book Your Stay
            </h1>
            <p className="text-gray-600">
              Complete the form below to secure your reservation
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              Booking created successfully! Redirecting to your bookings...
            </div>
          )}

          {!room && !error && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600">Unable to load room details</p>
            </div>
          )}

          {room && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Room Info */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">{room.name}</h2>
                <p className="text-lg opacity-90">{room.hotel.name}</p>
              </div>

              {/* Booking Form */}
              <div className="p-8">
                <form onSubmit={handleSubmit}>
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Booking Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-in Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-out Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {formData.startDate && formData.endDate && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                          Number of nights
                        </p>
                        <p className="text-2xl font-bold text-blue-600 mb-4">
                          {Math.ceil(
                            (new Date(formData.endDate).getTime() -
                              new Date(formData.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          nights
                        </p>
                        <div className="border-t border-blue-200 pt-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-700">Price per night</span>
                            <span className="font-semibold">
                              ${typeof room.pricePerNight === 'string'
                                ? parseFloat(room.pricePerNight).toFixed(2)
                                : room.pricePerNight.toFixed(2)
                              }
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-blue-600">
                            <span>Total Price</span>
                            <span>
                              ${(
                                (typeof room.pricePerNight === 'string'
                                  ? parseFloat(room.pricePerNight)
                                  : room.pricePerNight) *
                                Math.ceil(
                                  (new Date(formData.endDate).getTime() -
                                    new Date(formData.startDate).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? "Creating booking..." : "Confirm Booking"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      }
    >
      <BookingFormContent />
    </Suspense>
  );
}
