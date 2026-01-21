/**
 * Better-Auth API Route Handler
 * 
 * This route handles all authentication endpoints:
 * - POST /api/auth/sign-in
 * - POST /api/auth/sign-up
 * - POST /api/auth/sign-out
 * - GET  /api/auth/session
 * - GET  /api/auth/callback/google
 * - GET  /api/auth/callback/github
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
