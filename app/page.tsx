'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface Room {
  id: string;
  name: string;
  pricePerNight: number | string;
}

interface Hotel {
  id: string;
  name: string;
  rooms?: Room[];
}

export default function Home() {
  const pathname = usePathname();
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getAllHotels();
        setFeaturedHotels(data.slice(0, 6));
      } catch (err: any) {
        console.error('Failed to fetch hotels:', err);
        setError(err?.message || 'Failed to load hotels');
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, [pathname]);

  const getHotelStats = (hotel: Hotel) => {
    const rooms = hotel.rooms || [];
    const prices = rooms.map(r => Number(r.pricePerNight));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const roomTypes = [...new Set(rooms.map(r => r.name.replace(/\s+\d+$/, '').trim()))];
    return {
      roomCount: rooms.length,
      minPrice,
      maxPrice,
      roomTypes: roomTypes.slice(0, 3),
      moreTypes: roomTypes.length > 3 ? roomTypes.length - 3 : 0
    };
  };

  return (
    <div className="gradient-hero min-h-screen">
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-secondary/30 to-background-primary" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Find and Book the Perfect Stay
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Browse hotels, check real-time availability, and book rooms instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/rooms" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Browse Hotels</span>
            </Link>
            <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
              Learn More
            </a>
          </div>
        </div>

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </section>

      <section id="how-it-works" className="py-24 px-4 bg-background-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">How It Works</h2>
            <p className="text-xl text-gray-400">Book your perfect stay in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Step 1</h3>
              <h4 className="text-xl font-semibold text-red-400">Browse Hotels</h4>
              <p className="text-gray-400">Explore our curated selection of premium hotels</p>
            </div>

            <div className="glass-card p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Step 2</h3>
              <h4 className="text-xl font-semibold text-red-400">Choose Room Type</h4>
              <p className="text-gray-400">Select from various room types and check availability</p>
            </div>

            <div className="glass-card p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">Step 3</h3>
              <h4 className="text-xl font-semibold text-red-400">Book Instantly</h4>
              <p className="text-gray-400">Complete your booking with instant confirmation</p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-hotels" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Featured Hotels</h2>
            <p className="text-xl text-gray-400">Discover our top-rated properties</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card h-80 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="glass-card p-12 text-center">
              <p className="text-gray-400 mb-4">{error}</p>
              <Link href="/rooms" className="btn-secondary">
                Browse All Hotels
              </Link>
            </div>
          ) : featuredHotels.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-gray-400 mb-4">No hotels available yet</p>
              <Link href="/rooms" className="btn-secondary">
                Browse All Hotels
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredHotels.map((hotel) => {
                const stats = getHotelStats(hotel);
                return (
                  <Link key={hotel.id} href={`/rooms?hotelId=${hotel.id}`} className="group h-full">
                    <div className="glass-card p-6 h-full flex flex-col">
                      <div className="bg-gradient-to-br from-red-500/20 to-red-700/20 rounded-xl p-4 mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors">{hotel.name}</h3>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-background-tertiary rounded-lg p-3">
                          <p className="text-xs text-gray-400">Rooms</p>
                          <p className="text-xl font-bold text-white">{stats.roomCount}</p>
                        </div>
                        <div className="bg-background-tertiary rounded-lg p-3">
                          <p className="text-xs text-gray-400">Price Range</p>
                          <p className="text-lg font-bold text-red-400">
                            {stats.minPrice === stats.maxPrice 
                              ? `$${stats.minPrice}` 
                              : `$${stats.minPrice} – $${stats.maxPrice}`}
                          </p>
                        </div>
                      </div>

                      {stats.roomTypes.length > 0 ? (
                        <div className="flex-1 flex flex-col">
                          <p className="text-xs text-gray-500 uppercase mb-2">Room Types</p>
                          <div className="space-y-1">
                            {stats.roomTypes.map((type, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-300">{type}</span>
                                <span className="text-red-400 font-medium">
                                  ${hotel.rooms?.find(r => r.name.includes(type))?.pricePerNight}
                                </span>
                              </div>
                            ))}
                            {stats.moreTypes > 0 && (
                              <p className="text-xs text-gray-500 mt-2">+{stats.moreTypes} more room types</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1" />
                      )}

                      <button className="btn-primary w-full mt-4">
                        View Rooms
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/rooms" className="btn-primary text-lg px-8 py-4">
              View All Hotels
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-background-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Why Choose Us</h2>
            <p className="text-xl text-gray-400">Experience the difference in hotel booking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Real-time Availability</h3>
              <p className="text-gray-400">Always see up-to-date room availability and pricing</p>
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Secure Booking</h3>
              <p className="text-gray-400">Your reservations are protected and guaranteed</p>
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Instant Confirmation</h3>
              <p className="text-gray-400">Book instantly with immediate booking confirmation</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Book Your Stay?</h2>
          <p className="text-xl text-gray-400">Browse our collection of premium hotels and book with confidence</p>
          <Link href="/rooms" className="btn-primary text-lg px-12 py-5 inline-flex items-center space-x-2">
            <span>Browse All Hotels</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
