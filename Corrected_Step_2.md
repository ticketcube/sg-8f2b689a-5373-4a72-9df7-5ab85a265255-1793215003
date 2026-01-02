# CORRECTED: Step 2 Implementation for FanDragon OAuth

**IMPORTANT**: This is the correct implementation for using FanDragon as an OAuth SERVER (identity provider).

The previous guide incorrectly used `signInWithOAuth` which is for Supabase as a CLIENT. This guide uses manual OAuth 2.1 flow.

---

## 🚀 CORRECTED SOFTGEN PROMPT

Copy-paste this into your app (TicketCube, AI List Assistant, or third-party):

```
Implement "Sign in with FanDragon" using OAuth 2.1 Authorization Code Flow with manual implementation.

## Requirements

1. Add a "Sign in with FanDragon" button to the login page
2. Manually construct OAuth authorization URL and redirect user
3. Handle OAuth callback and exchange authorization code for tokens
4. Fetch user info and create local session
5. Store session securely in httpOnly cookies

## OAuth Configuration

- **Authorization Endpoint**: `https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/authorize`
- **Token Endpoint**: `https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/token`
- **UserInfo Endpoint**: `https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/userinfo`
- **Client ID**: `[YOUR_CLIENT_ID_HERE]` (Replace with actual client_id)
- **Redirect URI**: `${window.location.origin}/auth/callback`
- **Scopes**: `openid email profile`

## Implementation Steps

### 1. Create FanDragon Auth Service

Create `src/services/fandragonAuthService.ts`:

```typescript
import { v4 as uuidv4 } from "uuid";

const FANDRAGON_CONFIG = {
  authorizationEndpoint: "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/authorize",
  tokenEndpoint: "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/token",
  userinfoEndpoint: "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/userinfo",
  clientId: "[YOUR_CLIENT_ID_HERE]", // Replace with your actual client_id
  redirectUri: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
  scopes: ["openid", "email", "profile"],
};

export const fandragonAuthService = {
  /**
   * Initiate OAuth flow - Call when user clicks "Sign in with FanDragon"
   */
  initiateLogin: () => {
    // Generate state for CSRF protection
    const state = uuidv4();
    sessionStorage.setItem("oauth_state", state);

    // Generate code_verifier for PKCE
    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem("code_verifier", codeVerifier);

    // Generate code_challenge
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Construct authorization URL
    const params = new URLSearchParams({
      client_id: FANDRAGON_CONFIG.clientId,
      redirect_uri: FANDRAGON_CONFIG.redirectUri,
      response_type: "code",
      scope: FANDRAGON_CONFIG.scopes.join(" "),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    // Redirect to FanDragon authorization
    window.location.href = `${FANDRAGON_CONFIG.authorizationEndpoint}?${params}`;
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

    const tokens = await response.json();
    return tokens;
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
   * Sign out
   */
  signOut: async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/";
  },
};

// PKCE helper functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

function generateCodeChallenge(verifier: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = crypto.subtle.digest("SHA-256", data);
  return hash.then((buffer) => base64URLEncode(new Uint8Array(buffer)));
}

function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
```

### 2. Create Server-Side Token Exchange API Route

Create `src/pages/api/auth/fandragon/token.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, code_verifier } = req.body;

  if (!code || !code_verifier) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(
      "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${req.headers.origin}/auth/callback`,
          client_id: "[YOUR_CLIENT_ID_HERE]", // Replace with actual client_id
          code_verifier,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error("Token exchange error:", error);
      return res.status(tokenResponse.status).json(error);
    }

    const tokens = await tokenResponse.json();

    // Fetch user info
    const userResponse = await fetch(
      "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    if (!userResponse.ok) {
      const error = await userResponse.json();
      console.error("UserInfo fetch error:", error);
      return res.status(userResponse.status).json(error);
    }

    const userInfo = await userResponse.json();

    // Set httpOnly cookie for security
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("fandragon_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokens.expires_in || 3600,
        path: "/",
      })
    );

    return res.status(200).json({ tokens, user: userInfo });
  } catch (error) {
    console.error("Token exchange error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

### 3. Create User Info API Route

Create `src/pages/api/auth/fandragon/user.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.fandragon_token;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Fetch user info from FanDragon
    const userResponse = await fetch(
      "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!userResponse.ok) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await userResponse.json();
    return res.status(200).json(user);
  } catch (error) {
    console.error("User fetch error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

### 4. Create Sign Out API Route

Create `src/pages/api/auth/signout.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Clear auth cookie
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("fandragon_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })
  );

  return res.status(200).json({ success: true });
}
```

### 5. Create Login Button Component

Create `src/components/FanDragonLoginButton.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import { fandragonAuthService } from "@/services/fandragonAuthService";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function FanDragonLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    fandragonAuthService.initiateLogin();
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={loading}
      className="w-full"
      variant="default"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting to FanDragon...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
          Sign in with FanDragon
        </>
      )}
    </Button>
  );
}
```

### 6. Create OAuth Callback Page

Create `src/pages/auth/callback.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fandragonAuthService } from "@/services/fandragonAuthService";
import { Loader2 } from "lucide-react";

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const { code, state, error: oauthError } = router.query;

      if (oauthError) {
        setError(oauthError as string);
        setTimeout(() => router.push("/auth/login"), 3000);
        return;
      }

      if (!code || !state || typeof code !== "string" || typeof state !== "string") {
        return;
      }

      try {
        await fandragonAuthService.handleCallback(code, state);
        router.push("/dashboard");
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Authentication Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
```

### 7. Add to Login Page

Update your login page:

```tsx
import { FanDragonLoginButton } from "@/components/FanDragonLoginButton";

export default function LoginPage() {
  return (
    <div className="container max-w-md mx-auto py-20">
      <h1 className="text-3xl font-bold mb-8 text-center">Sign In</h1>

      <div className="space-y-4">
        <FanDragonLoginButton />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Other login methods */}
      </div>
    </div>
  );
}
```

### 8. Install Dependencies

```bash
npm install uuid cookie
npm install --save-dev @types/uuid @types/cookie
```

## Important Notes

1. **Replace `[YOUR_CLIENT_ID_HERE]`** with your actual client_id in:
   - `fandragonAuthService.ts`
   - `src/pages/api/auth/fandragon/token.ts`

2. **PKCE (Proof Key for Code Exchange)** is included for security

3. **Tokens stored in httpOnly cookies** for security (not localStorage)

4. **State parameter** prevents CSRF attacks

## Testing Checklist

- [ ] "Sign in with FanDragon" button works
- [ ] Redirects to FanDragon consent screen
- [ ] User can approve/deny consent
- [ ] Callback receives authorization code
- [ ] Token exchange succeeds
- [ ] User info is fetched
- [ ] Session cookie is set
- [ ] Dashboard loads with user data
- [ ] Sign out clears session

Use existing shadcn/ui components for styling.
```

---

## 🔧 What Was Wrong Before

**Previous (WRONG) approach:**
```typescript
// ❌ This doesn't work - Supabase doesn't support custom OAuth providers
await supabaseClient.auth.signInWithOAuth({
  provider: "oauth", // This provider doesn't exist!
  options: { ... }
});
```

**Correct approach:**
```typescript
// ✅ Manual OAuth 2.1 flow
const authUrl = `${authorizationEndpoint}?${params}`;
window.location.href = authUrl; // Redirect to FanDragon
```

---

## 📧 What to Send Third-Party Developers

Send them this corrected guide with their credentials:

```
Client ID: [their_client_id]
Authorization Endpoint: https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/authorize
Token Endpoint: https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/token
UserInfo Endpoint: https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/oauth/userinfo
Scopes: openid, email, profile
```

---

## ✅ Summary

The key difference:
- **Before**: Tried to use Supabase's `signInWithOAuth` (for signing into Google/GitHub)
- **Now**: Manual OAuth 2.1 flow (for using FanDragon as identity provider)

This is the standard OAuth implementation that works with ANY OAuth server.