"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/button";

interface Hotel {
  id: string;
  name: string;
  rooms: Array<{
    id: string;
    name: string;
    pricePerNight: string | number;
  }>;
}

// Generate consistent gradient colors based on hotel ID
const getGradientForHotel = (id: string) => {
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
  
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
};

const ITEMS_PER_PAGE = 6;

export default function RoomsPage() {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAllHotels();
      setHotels(data);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to fetch hotels";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredHotels = () => {
    if (!searchTerm) return hotels;
    return hotels.filter(hotel => 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getPaginatedHotels = () => {
    const filtered = getFilteredHotels();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getFilteredHotels().length / ITEMS_PER_PAGE);

  const getMinPrice = (hotel: Hotel) => {
    if (!hotel.rooms || hotel.rooms.length === 0) return 0;
    const prices = hotel.rooms.map(r => 
      typeof r.pricePerNight === 'string' ? parseFloat(r.pricePerNight) : r.pricePerNight
    );
    return Math.min(...prices);
  };

  const getMaxPrice = (hotel: Hotel) => {
    if (!hotel.rooms || hotel.rooms.length === 0) return 0;
    const prices = hotel.rooms.map(r => 
      typeof r.pricePerNight === 'string' ? parseFloat(r.pricePerNight) : r.pricePerNight
    );
    return Math.max(...prices);
  };

  const getRoomCount = (hotel: Hotel) => {
    return hotel.rooms?.length || 0;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Browse Hotels
            </h1>
            <p className="text-gray-600">
              Select a hotel to view available rooms and book your stay
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search hotels by name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {searchTerm && (
                <Button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  variant="secondary"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
          )}

          {/* Hotels Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading hotels...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">No hotels available</p>
              <Button onClick={fetchHotels} variant="secondary">
                Refresh
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getPaginatedHotels().map((hotel) => (
                  <Link href={`/room-details?hotelId=${hotel.id}`} key={hotel.id}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className={`bg-gradient-to-r ${getGradientForHotel(hotel.id)} h-32 flex items-center justify-center relative`}>
                        <div className="absolute inset-0 bg-black opacity-10"></div>
                        <div className="text-white text-center z-10 px-4">
                          <p className="text-xl font-bold">{hotel.name}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-500">Rooms</p>
                            <p className="text-lg font-bold text-gray-900">{getRoomCount(hotel)}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-500">Price Range</p>
                            <p className="text-lg font-bold text-green-600">
                              ${getMinPrice(hotel)} - ${getMaxPrice(hotel)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Room Types Preview */}
                        <div className="space-y-1 mb-4">
                          {hotel.rooms.slice(0, 3).map((room, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">{room.name}</span>
                              <span className="font-semibold text-blue-600">
                                ${typeof room.pricePerNight === 'string' 
                                  ? parseFloat(room.pricePerNight).toFixed(2)
                                  : room.pricePerNight.toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {hotel.rooms.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{hotel.rooms.length - 3} more rooms
                            </p>
                          )}
                        </div>
                        
                        <Button className="w-full">
                          View Rooms
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
