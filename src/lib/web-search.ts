import { createClient } from "@supabase/supabase-js";

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

/**
 * Perform web search using Brave Search API
 * This function is shared between API endpoints to avoid internal HTTP calls
 */
export async function performWebSearch(
  query: string,
  userId: string,
  count: number = 3
): Promise<BraveSearchResponse> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  
  if (!apiKey) {
    throw new Error("Web search is not configured (missing API key)");
  }

  // Initialize Supabase admin client for cache operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check cache first
  const { data: cachedResult } = await supabase
    .from("web_search_cache")
    .select("*")
    .eq("query", query.toLowerCase())
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (cachedResult) {
    console.log("🟢 WEB_SEARCH: Cache hit for query:", query);
    return {
      query,
      results: cachedResult.results,
      total_results: cachedResult.results.length,
      cached: true,
    };
  }

  console.log("🟡 WEB_SEARCH: Cache miss, performing live search for:", query);

  // Perform live search
  const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`;
  
  const response = await fetch(searchUrl, {
    headers: {
      "Accept": "application/json",
      "X-Subscription-Token": apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("🔴 BRAVE_API_ERROR:", response.status, errorText);
    throw new Error(`Brave Search API error: ${response.status}`);
  }

  const data = await response.json();
  const results: BraveSearchResult[] = (data.web?.results || []).slice(0, count).map((r: any) => ({
    title: r.title,
    url: r.url,
    description: r.description,
    age: r.age,
  }));

  // Cache the results
  await supabase.from("web_search_cache").insert({
    query: query.toLowerCase(),
    results,
    user_id: userId,
  });

  console.log("🟢 WEB_SEARCH: Live search completed, found", results.length, "results");

  return {
    query,
    results,
    total_results: results.length,
    cached: false,
  };
}