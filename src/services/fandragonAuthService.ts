import { createClient } from "@supabase/supabase-js";

// FanDragon's Supabase instance (shared identity provider)
const fandragonAuth = createClient(
  "https://agyoehyzvergiiwdbzmz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneW9laHl6dmVyZ2lpd2Riem16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzEzNjYsImV4cCI6MjA3NDkwNzM2Nn0.GWK4LrmIlU1VG1bVwL1yMaaXHIQzPPKdxuA-KT_oZ0Y"
);

const CLIENT_ID = "782f7b71-412a-475a-8ab4-602b5ec9af7c"; // Replace with your actual client_id

export interface FanDragonUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  profile?: {
    userid: string;
    username?: string;
    displayname?: string;
    avatarurl?: string;
    role?: string;
  };
}

export const fandragonAuthService = {
  /**
   * Initiate OAuth flow with FanDragon
   */
  initiateLogin: async () => {
    const { error } = await fandragonAuth.auth.signInWithOAuth({
      provider: "oauth" as any,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "openid email profile",
        queryParams: {
          client_id: CLIENT_ID,
        },
      },
    });

    if (error) {
      console.error("OAuth initiation error:", error);
      throw error;
    }
  },

  /**
   * Handle OAuth callback
   */
  handleCallback: async () => {
    const { data: { session }, error } = await fandragonAuth.auth.getSession();

    if (error || !session) {
      throw new Error("Failed to get session");
    }

    // Store session in your app
    sessionStorage.setItem("fandragon_session", JSON.stringify(session));

    return session;
  },

  /**
   * Get current user from FanDragon
   */
  getCurrentUser: async (): Promise<FanDragonUser | null> => {
    const { data: { user }, error } = await fandragonAuth.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Fetch full profile from shared database
    const { data: profile } = await fandragonAuth
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return {
      ...user,
      profile: profile || undefined,
    } as FanDragonUser;
  },

  /**
   * Sign out
   */
  signOut: async () => {
    await fandragonAuth.auth.signOut();
    sessionStorage.clear();
    window.location.href = "/";
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const session = sessionStorage.getItem("fandragon_session");
    return !!session;
  },

  /**
   * Get stored session
   */
  getSession: () => {
    const sessionStr = sessionStorage.getItem("fandragon_session");
    if (!sessionStr) return null;
    
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  },
};