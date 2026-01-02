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
      "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/token?grant_type=authorization_code",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          redirect_uri: `${req.headers.origin}/auth/callback`,
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
      "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/userinfo",
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