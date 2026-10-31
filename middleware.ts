/**
 * Next.js Middleware for Route Protection & Cookie Navigation
 * 
 * - Handles authentication for protected routes (Better-Auth)
 * - Manages 'offeranalyst_app_mode' cookie ('app' vs 'vitrine')
 * - Ensures returning users or page refreshes (F5) never bounce back to the marketing vitrine
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/landing",
  "/search-context",
  "/data-source",
  "/analysis",
  "/history",
  "/auth/login",
  "/auth/signup",
  "/auth/reset",
  "/auth/verify",
  "/help",
  "/changelog",
  "/share",
  "/cookies",
  "/privacy",
  "/terms",
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

// App workflow routes where active app mode cookie should be set
const appWorkflowRoutes = [
  "/search-context",
  "/data-source",
  "/analysis",
  "/history",
  "/saved",
  "/projects",
  "/compare",
  "/dashboard",
];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Allow all API routes to pass through (handled by API route handlers themselves)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Handle explicit mode override via query parameter on root
  if (pathname === "/") {
    const viewQuery = searchParams.get("view");
    if (viewQuery === "vitrine" || viewQuery === "app") {
      const response = NextResponse.next();
      response.cookies.set("offeranalyst_app_mode", viewQuery, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }
  }

  // Auto-set app mode cookie if user enters any app workflow route
  const isWorkflowRoute = appWorkflowRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const currentAppMode = request.cookies.get("offeranalyst_app_mode")?.value;

  // Allow public routes with exact match for "/" and prefix match for other routes
  const isPublicRoute = publicRoutes.some(route => 
    route === "/" ? pathname === "/" : (pathname === route || pathname.startsWith(route + "/"))
  );

  if (isPublicRoute) {
    if (isWorkflowRoute && currentAppMode !== "app") {
      const response = NextResponse.next();
      response.cookies.set("offeranalyst_app_mode", "app", {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }
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

    if (isWorkflowRoute && currentAppMode !== "app") {
      const response = NextResponse.next();
      response.cookies.set("offeranalyst_app_mode", "app", {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return response;
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
