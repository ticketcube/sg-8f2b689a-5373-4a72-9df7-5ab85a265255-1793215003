import type { NextApiRequest, NextApiResponse } from "next";

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
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query, count = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

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

    const response: BraveSearchResponse = {
      query,
      results,
      total_results: results.length,
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