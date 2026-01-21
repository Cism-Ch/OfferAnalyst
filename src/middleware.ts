import { NextRequest, NextResponse } from "next/server";

// Helper to get session cookie directly since import might be unstable
function getSessionCookie(request: NextRequest) {
  return (
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value
  );
}

/**
 * Next.js Middleware.
 *
 * Enforces authentication on private routes (/saved, /history, /projects).
 * Allows public access to search, dashboard, and public research.
 */
export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Protected routes
  const protectedPaths = ["/saved", "/history", "/projects"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect to home if logged in and trying to access login page
  if (request.nextUrl.pathname === "/auth/login" && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
