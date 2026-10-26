/**
 * Next.js Middleware for Route Protection
 * 
 * This middleware protects authenticated routes and handles redirects.
 * Public routes: /, /auth/*, /api/auth/*
 * Protected routes: /saved, /history, /projects, /compare, /onboarding
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/reset",
  "/auth/verify",
  "/help",
  "/changelog",
];

// Routes that require authentication
const protectedRoutes = [
  "/onboarding",
  "/saved",
  "/history",
  "/projects",
  "/compare",
  "/settings",
  "/profile",
  "/dashboard",
  "/admin",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes to pass through (handled by API route handlers themselves)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public routes with exact match for "/" and prefix match for other routes
  const isPublicRoute = publicRoutes.some(route => 
    route === "/" ? pathname === "/" : (pathname === route || pathname.startsWith(route + "/"))
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtectedRoute) {
    // Check for Better-Auth session cookie
    const sessionCookie = request.cookies.get("offeranalyst.session_token");
    
    if (!sessionCookie) {
      // Redirect to login with return URL
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
