/**
 * Better-Auth Client
 * 
 * Client-side authentication functions using Better-Auth.
 * This provides React hooks and functions for authentication.
 */

"use client";

import { createAuthClient } from "better-auth/react";

// Create the auth client with base URL
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Export convenience functions and hooks
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;

// Export the full client for advanced usage
export default authClient;
