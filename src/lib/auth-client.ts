/**
 * Auth Client Stubs
 * 
 * Placeholder implementations for authentication functions.
 * Will be replaced with actual Better-Auth implementation once MongoDB is configured.
 */

export const signIn = {
  email: async (data: { email: string; password: string; callbackURL?: string }) => {
    console.log("Sign in with email:", data.email);
    // TODO: Implement with Better-Auth
    throw new Error("Authentication not yet configured. Please set up MongoDB first.");
  },
  social: async (data: { provider: string; callbackURL?: string }) => {
    console.log("Sign in with provider:", data.provider);
    // TODO: Implement with Better-Auth
    throw new Error("Authentication not yet configured. Please set up MongoDB first.");
  },
};

export const signUp = {
  email: async (data: {
    email: string;
    password: string;
    name: string;
    callbackURL?: string;
  }) => {
    console.log("Sign up with email:", data.email);
    // TODO: Implement with Better-Auth
    throw new Error("Authentication not yet configured. Please set up MongoDB first.");
  },
};

export const signOut = async () => {
  console.log("Sign out");
  // TODO: Implement with Better-Auth
};

export const useSession = () => {
  // TODO: Implement with Better-Auth
  return {
    data: null,
    status: "unauthenticated",
  };
};
