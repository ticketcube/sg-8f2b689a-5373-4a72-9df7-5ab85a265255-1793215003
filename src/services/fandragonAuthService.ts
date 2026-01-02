import { v4 as uuidv4 } from "uuid";

export interface FanDragonUser {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  [key: string]: any;
}

const FANDRAGON_CONFIG = {
  authorizationEndpoint: "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/authorize",
  tokenEndpoint: "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/token",
  userinfoEndpoint: "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/userinfo",
  clientId: "782f7b71-412a-475a-8ab4-602b5ec9af7c",
  redirectUri: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
  scopes: ["openid", "email", "profile"],
};

// PKCE helper functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export const fandragonAuthService = {
  /**
   * Initiate OAuth flow - Call when user clicks "Sign in with FanDragon"
   */
  initiateLogin: async () => {
    // Generate state for CSRF protection
    const state = uuidv4();
    sessionStorage.setItem("oauth_state", state);

    // Generate code_verifier for PKCE
    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem("code_verifier", codeVerifier);

    // Generate code_challenge
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Construct authorization URL with correct OAuth 2.1 parameters
    const params = new URLSearchParams({
      client_id: FANDRAGON_CONFIG.clientId,
      redirect_uri: FANDRAGON_CONFIG.redirectUri,
      response_type: "code",
      scope: FANDRAGON_CONFIG.scopes.join(" "),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    // Redirect to FanDragon authorization endpoint
    const authUrl = `${FANDRAGON_CONFIG.authorizationEndpoint}?${params.toString()}`;
    console.log("Redirecting to:", authUrl);
    window.location.href = authUrl;
  },

  /**
   * Handle OAuth callback - Call in /auth/callback page
   */
  handleCallback: async (code: string, state: string) => {
    // Verify state (CSRF protection)
    const savedState = sessionStorage.getItem("oauth_state");
    if (state !== savedState) {
      throw new Error("Invalid state - possible CSRF attack");
    }

    // Get code_verifier for PKCE
    const codeVerifier = sessionStorage.getItem("code_verifier");
    if (!codeVerifier) {
      throw new Error("Code verifier not found");
    }

    // Clear stored values
    sessionStorage.removeItem("oauth_state");
    sessionStorage.removeItem("code_verifier");

    // Exchange code for tokens via API route
    const response = await fetch("/api/auth/fandragon/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        code, 
        code_verifier: codeVerifier 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Token exchange failed");
    }

    const data = await response.json();
    
    // Store session data
    sessionStorage.setItem("fandragon_session", JSON.stringify({
      access_token: data.tokens.access_token,
      refresh_token: data.tokens.refresh_token,
      expires_at: Date.now() + (data.tokens.expires_in * 1000),
      user: data.user,
    }));

    return data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async () => {
    const response = await fetch("/api/auth/fandragon/user");
    if (!response.ok) return null;
    return response.json();
  },

  /**
   * Get current session
   */
  getSession: () => {
    const sessionStr = sessionStorage.getItem("fandragon_session");
    if (!sessionStr) return null;
    
    try {
      const session = JSON.parse(sessionStr);
      
      // Check if token is expired
      if (session.expires_at && Date.now() > session.expires_at) {
        sessionStorage.removeItem("fandragon_session");
        return null;
      }
      
      return session;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const session = fandragonAuthService.getSession();
    return !!session;
  },

  /**
   * Sign out
   */
  signOut: async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    sessionStorage.removeItem("fandragon_session");
    window.location.href = "/login";
  },
};