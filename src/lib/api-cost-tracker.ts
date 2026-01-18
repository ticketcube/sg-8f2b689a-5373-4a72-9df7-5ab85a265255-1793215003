import { createClient } from "@supabase/supabase-js";

// OpenAI Pricing (as of 2024)
const OPENAI_PRICING = {
  "gpt-3.5-turbo": {
    input: 0.50 / 1_000_000,  // $0.50 per 1M tokens
    output: 1.50 / 1_000_000, // $1.50 per 1M tokens
  },
  "gpt-4": {
    input: 30.00 / 1_000_000,
    output: 60.00 / 1_000_000,
  },
  "tts-1": {
    perChar: 15.00 / 1_000_000, // $15 per 1M characters
  },
};

// Brave Search Pricing
const BRAVE_SEARCH_PRICING = {
  free_tier_limit: 2000, // 2,000 queries/month free
  cost_per_query: 5.00 / 1000, // $5 per 1,000 queries after free tier
};

interface LogApiUsageParams {
  userId: string;
  apiName: "openai" | "brave_search" | "tts" | "supabase";
  endpoint?: string;
  model?: string;
  tokensInput?: number;
  tokensOutput?: number;
  tokensTotal?: number;
  apiCalls?: number;
  requestData?: any;
}

export async function logApiUsage(params: LogApiUsageParams) {
  const {
    userId,
    apiName,
    endpoint,
    model,
    tokensInput = 0,
    tokensOutput = 0,
    tokensTotal = 0,
    apiCalls = 1,
    requestData,
  } = params;

  // Calculate cost based on API
  let cost = 0;

  if (apiName === "openai" && model) {
    const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING];
    if (pricing && "input" in pricing) {
      cost = (tokensInput * pricing.input) + (tokensOutput * pricing.output);
    } else if (pricing && "perChar" in pricing) {
      // TTS pricing (per character)
      const charCount = requestData?.text?.length || 0;
      cost = charCount * pricing.perChar;
    }
  } else if (apiName === "brave_search") {
    // Brave Search is free for first 2000 queries
    // For now, we'll mark it as $0 but track the call
    cost = 0;
  } else if (apiName === "tts") {
    // TTS is currently free in your setup
    cost = 0;
  } else if (apiName === "supabase") {
    // Supabase is free tier for now
    cost = 0;
  }

  try {
    // Use service role to insert logs (bypasses RLS)
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

    const { error } = await supabaseAdmin.from("api_usage_logs").insert({
      user_id: userId,
      api_name: apiName,
      endpoint,
      model,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      tokens_total: tokensTotal,
      api_calls: apiCalls,
      cost,
      request_data: requestData || null,
    });

    if (error) {
      console.error("❌ Failed to log API usage:", error);
    } else {
      console.log(`✅ Logged ${apiName} usage: $${cost.toFixed(6)} (${apiCalls} calls)`);
    }
  } catch (error) {
    console.error("❌ Error logging API usage:", error);
  }
}

export function calculateOpenAICost(model: string, tokensInput: number, tokensOutput: number): number {
  const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING];
  if (!pricing || !("input" in pricing)) return 0;
  
  return (tokensInput * pricing.input) + (tokensOutput * pricing.output);
}