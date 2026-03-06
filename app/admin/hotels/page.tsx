"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Hotel, Room } from "@/lib/types";

function HotelManagementContent() {
  const router = useRouter();
  const { logout } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);

  const [hotelForm, setHotelForm] = useState({
    name: "",
    rooms: [{ name: "", pricePerNight: "" }],
  });

  const [roomForm, setRoomForm] = useState({
    name: "",
    pricePerNight: "",
  });

  useEffect(() => {
    fetchHotels();
  }, []);

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
      setMessage({
        type: "error",
        text: "Failed to load hotels. Please try again.",
      });
    }
  };

  const handleAddRoomField = () => {
    setHotelForm({
      ...hotelForm,
      rooms: [...hotelForm.rooms, { name: "", pricePerNight: "" }],
    });
  };

  const handleRemoveRoomField = (index: number) => {
    setHotelForm({
      ...hotelForm,
      rooms: hotelForm.rooms.filter((_, i) => i !== index),
    });
  };

  const handleRoomFieldChange = (
    index: number,
    field: "name" | "pricePerNight",
    value: string
  ) => {
    const updatedRooms = [...hotelForm.rooms];
    updatedRooms[index] = {
      ...updatedRooms[index],
      [field]: value,
    };
    setHotelForm({ ...hotelForm, rooms: updatedRooms });
  };

  const validateHotelForm = (): boolean => {
    if (!hotelForm.name.trim()) {
      setMessage({
        type: "error",
        text: "Hotel name is required.",
      });
      return false;
    }

    for (const room of hotelForm.rooms) {
      if (!room.name.trim()) {
        setMessage({
          type: "error",
          text: "All room names are required.",
        });
        return false;
      }
      if (!room.pricePerNight || parseFloat(room.pricePerNight) <= 0) {
        setMessage({
          type: "error",
          text: "All room prices must be greater than 0.",
        });
        return false;
      }
    }

    const roomNames = hotelForm.rooms.map((r) => r.name.toLowerCase());
    const uniqueNames = new Set(roomNames);
    if (roomNames.length !== uniqueNames.size) {
      setMessage({
        type: "error",
        text: "Duplicate room names are not allowed.",
      });
      return false;
    }

    return true;
  };

  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateHotelForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      const payload = {
        name: hotelForm.name,
        rooms: hotelForm.rooms.map((room) => ({
          name: room.name,
          pricePerNight: parseFloat(room.pricePerNight),
        })),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Hotel and rooms created successfully!",
        });
        setHotelForm({ name: "", rooms: [{ name: "", pricePerNight: "" }] });
        setShowCreateForm(false);
        fetchHotels();
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.message || "Failed to create hotel.",
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

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!roomForm.name.trim()) {
      setMessage({ type: "error", text: "Room name is required." });
      return;
    }

    if (!roomForm.pricePerNight || parseFloat(roomForm.pricePerNight) <= 0) {
      setMessage({ type: "error", text: "Room price must be greater than 0." });
      return;
    }

    if (!selectedHotel) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/hotels/${selectedHotel.id}/rooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: roomForm.name,
            pricePerNight: parseFloat(roomForm.pricePerNight),
          }),
        }
      );

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Room added successfully!",
        });
        setRoomForm({ name: "", pricePerNight: "" });
        setShowRoomForm(false);
        if (selectedHotel) {
          const hotelResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/hotels/${selectedHotel.id}`
          );
          if (hotelResponse.ok) {
            const data = await hotelResponse.json();
            setSelectedHotel(data.data);
            const updatedHotels = hotels.map((h) =>
              h.id === selectedHotel.id ? data.data : h
            );
            setHotels(updatedHotels);
          }
        }
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.message || "Failed to add room.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error adding room. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    setLoading(true);
    setMessage(null);

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
        setMessage({
          type: "success",
          text: "Room deleted successfully!",
        });
        fetchHotels();
        if (selectedHotel) {
          setSelectedHotel({
            ...selectedHotel,
            rooms: selectedHotel.rooms.filter((r) => r.id !== roomId),
          });
        }
      } else {
        setMessage({
          type: "error",
          text: "Failed to delete room.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error deleting room. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!confirm("Are you sure you want to delete this hotel and all its rooms?"))
      return;

    setLoading(true);
    setMessage(null);

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
        setMessage({
          type: "success",
          text: "Hotel deleted successfully!",
        });
        setSelectedHotel(null);
        fetchHotels();
      } else {
        setMessage({
          type: "error",
          text: "Failed to delete hotel.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error deleting hotel. Please try again.",
      });
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Hotel Management
          </h1>
          <Button onClick={handleLogout} variant="secondary">
            Logout
          </Button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-6">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={loading}
          >
            {showCreateForm ? "Cancel" : "Create New Hotel"}
          </Button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Create Hotel with Rooms
            </h2>
            <form onSubmit={handleCreateHotel} className="space-y-6">
              <Input
                label="Hotel Name"
                type="text"
                placeholder="Enter hotel name"
                value={hotelForm.name}
                onChange={(e) =>
                  setHotelForm({ ...hotelForm, name: e.target.value })
                }
              />

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Rooms
                </h3>
                <div className="space-y-4">
                  {hotelForm.rooms.map((room, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg"
                    >
                      <Input
                        label={`Room ${index + 1} Name`}
                        type="text"
                        placeholder="e.g., Deluxe"
                        value={room.name}
                        onChange={(e) =>
                          handleRoomFieldChange(index, "name", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        label="Price Per Night"
                        type="number"
                        placeholder="0.00"
                        value={room.pricePerNight}
                        onChange={(e) =>
                          handleRoomFieldChange(
                            index,
                            "pricePerNight",
                            e.target.value
                          )
                        }
                        className="flex-1"
                      />
                      {hotelForm.rooms.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => handleRemoveRoomField(index)}
                          variant="secondary"
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={handleAddRoomField}
                  variant="secondary"
                  className="mt-4"
                  disabled={loading}
                >
                  Add Room
                </Button>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Hotel"}
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    setHotelForm({
                      name: "",
                      rooms: [{ name: "", pricePerNight: "" }],
                    })
                  }
                  variant="secondary"
                  disabled={loading}
                >
                  Reset
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Hotels</h2>
            {hotels.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hotels found. Create one to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      selectedHotel?.id === hotel.id
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-white border border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => setSelectedHotel(hotel)}
                  >
                    <div className="font-semibold text-gray-900">
                      {hotel.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {hotel.rooms.length} room{hotel.rooms.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedHotel && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedHotel.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedHotel.rooms.length} room
                      {selectedHotel.rooms.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteHotel(selectedHotel.id)}
                    variant="secondary"
                    disabled={loading}
                  >
                    Delete Hotel
                  </Button>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Rooms
                    </h3>
                    <Button
                      onClick={() => setShowRoomForm(!showRoomForm)}
                      disabled={loading}
                    >
                      {showRoomForm ? "Cancel" : "Add Room"}
                    </Button>
                  </div>

                  {showRoomForm && (
                    <form
                      onSubmit={handleAddRoom}
                      className="mb-6 bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="space-y-4">
                        <Input
                          label="Room Name"
                          type="text"
                          placeholder="e.g., Suite"
                          value={roomForm.name}
                          onChange={(e) =>
                            setRoomForm({
                              ...roomForm,
                              name: e.target.value,
                            })
                          }
                        />
                        <Input
                          label="Price Per Night"
                          type="number"
                          placeholder="0.00"
                          value={roomForm.pricePerNight}
                          onChange={(e) =>
                            setRoomForm({
                              ...roomForm,
                              pricePerNight: e.target.value,
                            })
                          }
                        />
                        <Button type="submit" disabled={loading}>
                          {loading ? "Adding..." : "Add Room"}
                        </Button>
                      </div>
                    </form>
                  )}

                  {selectedHotel.rooms.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No rooms added yet. Add one using the button above.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedHotel.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">
                              {room.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ${room.pricePerNight}/night
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDeleteRoom(room.id)}
                            variant="secondary"
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminHotelsPage() {
  return (
    <ProtectedAdminRoute>
      <HotelManagementContent />
    </ProtectedAdminRoute>
  );
}
