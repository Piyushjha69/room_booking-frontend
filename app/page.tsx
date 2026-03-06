import Link from "next/link";
import { Button } from "@/components/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Room Booking</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link href="/signup" className="w-32">
                <Button variant="primary" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Room Booking System
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            A modern, secure, and easy-to-use room booking platform with authentication
            and real-time availability management.
          </p>

          <div className="flex gap-4 justify-center mb-12">
            <Link href="/login">
              <Button
                variant="primary"
                className="w-auto px-8 bg-white text-blue-600 hover:bg-blue-50"
              >
                Get Started
              </Button>
            </Link>
            <Button variant="secondary" className="w-auto px-8">
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600">
                Enterprise-grade security with JWT authentication and token refresh.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast</h3>
              <p className="text-gray-600">
                Built with Next.js for optimal performance and user experience.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reliable</h3>
              <p className="text-gray-600">
                Production-ready with proper error handling and token management.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
