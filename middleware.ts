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
  "/history",
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
    // Check for Better-Auth session cookie (both standard and HTTPS __Secure- prefixed tokens)
    // Validate non-empty string value to prevent empty cookie bypass and prioritize valid secure cookie
    const standardCookie = request.cookies.get("offeranalyst.session_token");
    const secureCookie = request.cookies.get("__Secure-offeranalyst.session_token");
    const sessionToken = 
      (standardCookie?.value && standardCookie.value.trim().length > 0 ? standardCookie.value : null) ||
      (secureCookie?.value && secureCookie.value.trim().length > 0 ? secureCookie.value : null);

    if (!sessionToken) {
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
