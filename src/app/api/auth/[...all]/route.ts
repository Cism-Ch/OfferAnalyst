import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * catch-all route handler for Better-Auth.
 */
export const { GET, POST } = toNextJsHandler(auth);
