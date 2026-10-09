import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { getAuthenticatedUser } from "@/lib/supabase-server";

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

interface BraveSearchResponse {
  query: string;
  results: BraveSearchResult[];
  total_results: number;
  cached?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Authenticate user - web search should only be available to authenticated users
    let userId: string | undefined;
    try {
      const { user } = await getAuthenticatedUser(req);
      userId = user.id;
      console.log("🔐 WEB_SEARCH_AUTH: User authenticated:", userId);
    } catch (authError) {
      // Allow internal API calls (from smart-conversation.ts) without auth
      // These will come from the same server, not from external clients
      const isInternalCall = req.headers['x-internal-call'] === 'true';
      if (!isInternalCall) {
        console.log("❌ WEB_SEARCH_AUTH: Authentication failed");
        return res.status(401).json({ error: "Authentication required" });
      }
      console.log("🔓 WEB_SEARCH_AUTH: Internal API call, bypassing auth");
    }

    const { query, count = 3 } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Initialize Supabase admin client for cache access
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check cache first
    console.log("🔍 CACHE_CHECK: Looking for cached results for:", query);
    const { data: cachedResult, error: cacheError } = await supabaseAdmin
      .from("search_cache")
      .select("*")
      .eq("query", query.toLowerCase().trim())
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cachedResult && !cacheError) {
      console.log("✅ CACHE_HIT: Returning cached results");
      
      // Increment hit count
      await supabaseAdmin
        .from("search_cache")
        .update({ hit_count: cachedResult.hit_count + 1 })
        .eq("id", cachedResult.id);

      const results = cachedResult.results as BraveSearchResult[];
      
      return res.status(200).json({
        query,
        results: results.slice(0, count),
        total_results: results.length,
        cached: true,
      });
    }

    console.log("❌ CACHE_MISS: Calling Brave Search API");

    const apiKey = process.env.BRAVE_SEARCH_API_KEY;

    if (!apiKey || apiKey === "your_brave_api_key_here") {
      console.error("Brave Search API key not configured");
      return res.status(500).json({ 
        error: "Web search is not configured. Please add BRAVE_SEARCH_API_KEY to environment variables." 
      });
    }

    console.log("🔍 BRAVE_SEARCH: Searching for:", query);

    // Call Brave Search API
    const braveResponse = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
      {
        headers: {
          "Accept": "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": apiKey,
        },
      }
    );

    if (!braveResponse.ok) {
      const errorText = await braveResponse.text();
      console.error("🔴 BRAVE_SEARCH_ERROR:", braveResponse.status, errorText);
      throw new Error(`Brave Search API error: ${braveResponse.status}`);
    }

    const data = await braveResponse.json();
    console.log("🟢 BRAVE_SEARCH_SUCCESS: Found", data.web?.results?.length || 0, "results");

    // Extract and format results
    const results: BraveSearchResult[] = (data.web?.results || []).map((result: any) => ({
      title: result.title,
      url: result.url,
      description: result.description,
      age: result.age,
    }));

    // Cache the results for 7 days
    console.log("💾 CACHE_SAVE: Storing results in cache");
    await supabaseAdmin.from("search_cache").insert({
      query: query.toLowerCase().trim(),
      results,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    const response: BraveSearchResponse = {
      query,
      results,
      total_results: results.length,
      cached: false,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error("🔴 WEB_SEARCH_ERROR:", error);
    return res.status(500).json({
      error: "Failed to perform web search",
      details: error.message,
    });
  }
}