/**
 * Better-Auth API Route Handler
 * 
 * This catch-all route handles all authentication requests:
 * - POST /api/auth/signin
 * - POST /api/auth/signup
 * - POST /api/auth/signout
 * - GET /api/auth/session
 * - GET /api/auth/callback/google
 * - GET /api/auth/callback/github
 * 
 * NOTE: Temporarily disabled until MongoDB is configured (Phase 02 backend integration pending)
 */

// Temporary stub handlers until MongoDB is configured
export async function GET() {
  return new Response(
    JSON.stringify({ error: "Authentication backend not yet configured. MongoDB setup required." }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}

export async function POST() {
  return new Response(
    JSON.stringify({ error: "Authentication backend not yet configured. MongoDB setup required." }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}

// When MongoDB is configured, replace above with:
// import { auth } from "@/lib/auth";
// import { toNextJsHandler } from "better-auth/next-js";
// export const { GET, POST } = toNextJsHandler(auth);

// Configure runtime for API route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
