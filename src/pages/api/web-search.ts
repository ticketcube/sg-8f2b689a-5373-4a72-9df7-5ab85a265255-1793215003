import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/lib/supabase-server";
import { performWebSearch } from "@/lib/web-search";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user } = await getAuthenticatedUser(req);
    const userId = user.id;

    // Check user role
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (!userProfile || (userProfile.role !== "aiassist" && userProfile.role !== "admin")) {
      return res.status(403).json({ 
        error: "Access denied - web search requires 'aiassist' role" 
      });
    }

    const { query, count = 3 } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }

    // Use shared search function
    const searchResult = await performWebSearch(query, userId, count);

    return res.status(200).json(searchResult);

  } catch (error: any) {
    console.error("🔴 WEB_SEARCH_ENDPOINT_ERROR:", error);
    return res.status(500).json({
      error: "Web search failed",
      details: error.message,
    });
  }
}