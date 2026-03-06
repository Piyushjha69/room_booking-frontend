import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Note: Middleware runs on server, can't access localStorage
  // Token validation happens on client via AuthContext and ProtectedRoute
  // This middleware just allows requests to pass through
  // Client-side auth checking in ProtectedRoute component handles redirects
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/dashboard/:path*", "/admin/:path*", "/rooms/:path*", "/book/:path*", "/my-bookings/:path*"],
};
