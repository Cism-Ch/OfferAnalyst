/**
 * Better-Auth Client
 * 
 * This file provides client-side authentication utilities using Better-Auth.
 * Use these functions in client components to sign in, sign up, sign out, etc.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  useActiveOrganization,
} = authClient;
