"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { Button } from "@/components/button";
import { showToast } from "@/lib/toast";
import Link from "next/link";

interface RoomInput {
  type: string;
  pricePerNight: string;
  count: string;
}

interface ValidationError {
  field: string;
  message: string;
}

function CreateHotelContent() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const [hotelName, setHotelName] = useState("");
  const [rooms, setRooms] = useState<RoomInput[]>(
    [{ type: "", pricePerNight: "", count: "1" }]
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const addRoom = () => {
    setRooms([...rooms, { type: "", pricePerNight: "", count: "1" }]);
  };

  const removeRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index));
    }
  };

  const updateRoom = (index: number, field: keyof RoomInput, value: string) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    if (!hotelName.trim()) {
      newErrors.push({ field: "hotelName", message: "Hotel name is required" });
    }

    const roomTypes = new Set<string>();
    rooms.forEach((room, index) => {
      if (!room.type.trim()) {
        newErrors.push({
          field: `room_${index}_type`,
          message: `Room ${index + 1} type is required`
        });
      } else {
        const lowerType = room.type.toLowerCase().trim();
        if (roomTypes.has(lowerType)) {
          newErrors.push({
            field: `room_${index}_type`,
            message: `Room type "${room.type}" is duplicated`
          });
        }
        roomTypes.add(lowerType);
      }

      const price = parseFloat(room.pricePerNight);
      if (!room.pricePerNight || isNaN(price) || price <= 0) {
        newErrors.push({
          field: `room_${index}_price`,
          message: `Room ${index + 1} price must be a positive number`
        });
      }

      const numRooms = parseInt(room.count);
      if (!room.count || isNaN(numRooms) || numRooms < 1) {
        newErrors.push({
          field: `room_${index}_count`,
          message: `Room ${index + 1} count must be at least 1`
        });
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");

      const hotelRooms = rooms.map((room) => ({
        type: room.type.trim(),
        pricePerNight: parseFloat(room.pricePerNight),
        count: parseInt(room.count)
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: hotelName.trim(),
            roomGroups: hotelRooms,
          }),
        }
      );

      if (response.ok) {
        showToast.success("Hotel created successfully!");
        setTimeout(() => {
          router.push("/admin/hotels");
        }, 500);
      } else {
        const errorData = await response.json();
        showToast.error(errorData.message || "Failed to create hotel");
      }
    } catch (error) {
      showToast.error("Error creating hotel. Please try again.");
    } finally {
      setSubmitting(false);
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

  const getErrorForField = (field: string): string | undefined => {
    return errors.find((e) => e.field === field)?.message;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Hotel
              </h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">
                {user?.name || user?.email}
              </span>
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="w-auto px-4"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/admin/hotels" className="text-blue-600 hover:text-blue-800">← Back to Hotels</Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Hotel Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotel Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    getErrorForField("hotelName")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter hotel name"
                />
                {getErrorForField("hotelName") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getErrorForField("hotelName")}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Room Types
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addRoom}
                  className="text-sm"
                >
                  + Add Room Type
                </Button>
              </div>

              <div className="space-y-4">
                {rooms.map((room, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-medium text-gray-700">
                        Room Type {index + 1}
                      </h3>
                      {rooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoom(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room Type
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={room.type}
                          onChange={(e) =>
                            updateRoom(index, "type", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            getErrorForField(`room_${index}_type`)
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="e.g., Deluxe, Suite"
                        />
                        {getErrorForField(`room_${index}_type`) && (
                          <p className="mt-1 text-xs text-red-600">
                            {getErrorForField(`room_${index}_type`)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price Per Night ($){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={room.pricePerNight}
                          onChange={(e) =>
                            updateRoom(index, "pricePerNight", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            getErrorForField(`room_${index}_price`)
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="0.00"
                        />
                        {getErrorForField(`room_${index}_price`) && (
                          <p className="mt-1 text-xs text-red-600">
                            {getErrorForField(`room_${index}_price`)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Rooms{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={room.count}
                          onChange={(e) =>
                            updateRoom(index, "count", e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            getErrorForField(`room_${index}_count`)
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="1"
                        />
                        {getErrorForField(`room_${index}_count`) && (
                          <p className="mt-1 text-xs text-red-600">
                            {getErrorForField(`room_${index}_count`)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Link href="/admin/hotels">
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={submitting}>
                Create Hotel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function CreateHotelPage() {
  return (
    <ProtectedAdminRoute>
      <CreateHotelContent />
    </ProtectedAdminRoute>
  );
}
