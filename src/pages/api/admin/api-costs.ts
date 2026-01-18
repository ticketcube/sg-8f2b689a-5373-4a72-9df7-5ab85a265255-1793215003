import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Use admin client to read all usage logs
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

    // Get all API usage logs
    const { data: logs, error } = await supabaseAdmin
      .from("api_usage_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching API costs:", error);
      throw error;
    }

    // Calculate totals
    const totalCost = logs?.reduce((sum, log) => sum + parseFloat(log.cost || 0), 0) || 0;
    const totalCalls = logs?.reduce((sum, log) => sum + (log.api_calls || 1), 0) || 0;

    // Group by API
    const byApi: { [key: string]: any } = {};
    
    logs?.forEach((log) => {
      const apiName = log.api_name;
      if (!byApi[apiName]) {
        byApi[apiName] = {
          api_name: apiName,
          total_calls: 0,
          total_cost: 0,
          total_tokens: 0,
          last_used: log.created_at,
        };
      }

      byApi[apiName].total_calls += log.api_calls || 1;
      byApi[apiName].total_cost += parseFloat(log.cost || 0);
      byApi[apiName].total_tokens += log.tokens_total || 0;
      
      // Update last_used if this log is more recent
      if (new Date(log.created_at) > new Date(byApi[apiName].last_used)) {
        byApi[apiName].last_used = log.created_at;
      }
    });

    const byApiArray = Object.values(byApi).sort((a: any, b: any) => b.total_cost - a.total_cost);

    return res.status(200).json({
      total_cost: totalCost,
      total_calls: totalCalls,
      by_api: byApiArray,
      last_updated: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("API Costs Error:", error);
    return res.status(500).json({
      error: "Failed to fetch API costs",
      details: error.message,
    });
  }
}