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