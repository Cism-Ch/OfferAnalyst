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
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

// Configure runtime for API route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
