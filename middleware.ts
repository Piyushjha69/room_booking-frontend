import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  const authRoutes = ["/login", "/signup"];
  const protectedRoutes = ["/dashboard"];

  if (authRoutes.includes(pathname) && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/dashboard/:path*"],
};
