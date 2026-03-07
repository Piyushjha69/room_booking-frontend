"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/button";

interface RoomTypeGroup {
  type: string;
  count: number;
  pricePerNight: number;
}

interface Hotel {
  id: string;
  name: string;
  roomTypes: RoomTypeGroup[];
  totalRooms: number;
  minPrice: number;
  maxPrice: number;
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
  const router = useRouter();
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
            <div>
              <h1 className="text-5xl font-bold text-slate-900 mb-3 tracking-tight">
                Browse Hotels
              </h1>
              <p className="text-lg text-slate-600">
                Select a hotel to view available rooms and book your stay
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")} className="group">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 transition-transform group-hover:-translate-x-1">
                <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
              </svg>
              Back
            </Button>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-slate-100">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search hotels by name..."
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Hotels Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-600">Loading hotels...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-300 mb-4">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
              </svg>
              <p className="text-lg text-slate-600 mb-6">No hotels available</p>
              <Button onClick={fetchHotels} variant="secondary">
                Refresh
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getPaginatedHotels().map((hotel) => (
                  <Link href={`/room-details?hotelId=${hotel.id}`} key={hotel.id}>
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full border border-slate-100 group">
                      <div className={`bg-gradient-to-r ${getGradientForHotel(hotel.id)} h-40 flex items-center justify-center relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black opacity-5"></div>
                        <div className="text-white text-center z-10 px-6 transform group-hover:scale-105 transition-transform duration-300">
                          <p className="text-2xl font-bold tracking-tight">{hotel.name}</p>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-3 text-center border border-blue-100">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
                              </svg>
                            </div>
                            <p className="text-xs font-semibold text-blue-700">Total Rooms</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{hotel.totalRooms || 0}</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center border border-green-100">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                              </svg>
                            </div>
                            <p className="text-xs font-semibold text-green-700">Price Range</p>
                            <p className="text-lg font-bold text-green-900 mt-1">
                              ${hotel.minPrice} - ${hotel.maxPrice}
                            </p>
                          </div>
                        </div>
                        
                        {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                          <div className="mb-5">
                            <div className="flex text-xs font-bold text-slate-500 uppercase tracking-wide border-b-2 border-slate-100 pb-2 mb-3">
                              <span className="flex-1">Room Type</span>
                              <span className="w-16 text-center">Rooms</span>
                              <span className="w-24 text-right">Price</span>
                            </div>
                            <div className="space-y-2.5">
                              {hotel.roomTypes.slice(0, 3).map((roomType, idx) => (
                                <div key={idx} className="flex items-center text-sm hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors">
                                  <span className="flex-1 text-slate-700 font-medium">{roomType.type}</span>
                                  <span className="w-16 text-center text-slate-600 font-semibold">{roomType.count}</span>
                                  <span className="w-24 text-right font-bold text-blue-600">
                                    ${roomType.pricePerNight.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {hotel.roomTypes.length > 3 && (
                              <p className="text-xs text-slate-500 text-center mt-3 pt-3 border-t border-slate-100">
                                +{hotel.roomTypes.length - 3} more room types
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-500 text-sm mb-5 bg-slate-50 rounded-xl">
                            No rooms available
                          </div>
                        )}
                        
                        <Button className="w-full py-3 text-base font-semibold group-hover:from-blue-600 group-hover:to-sky-600">
                          View Rooms
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-12">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-6"
                  >
                    Previous
                  </Button>
                  <span className="text-slate-600 font-medium px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-6"
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
