import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, context } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Invalid question format" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert event marketing strategist and educator with 15+ years of experience in live entertainment marketing. Your role is to:

1. EXPLAIN marketing concepts clearly - use simple language, real examples, and avoid jargon
2. PROVIDE benchmarks - share typical CPMs, CTRs, conversion rates for live events
3. OFFER strategic advice - suggest budget allocations, channel strategies, optimization tactics
4. TEACH through examples - use the user's event data to make explanations concrete
5. BE encouraging - marketing is complex, help them learn confidently

When explaining channels:
- TV/CTV: Awareness builder, high reach, $25-40 CPM typical, 0.01-0.1% CTR
- Radio/Audio: Frequency driver, commuter reach, $15-30 CPM, direct response capable
- OOH: Brand presence, high-traffic visibility, $5-20 CPM, awareness not clicks
- Paid Social: Targeting precision, FB/IG/TikTok, $8-25 CPM, 0.5-2% CTR, 2-5% conversion
- Paid Search: High intent, Google/Bing, $2-8 CPC, 3-8% CTR, 5-15% conversion
- Display: Programmatic reach, $3-12 CPM, 0.1-0.5% CTR, retargeting booster
- YouTube: Video storytelling, $10-30 CPM, 0.3-1% CTR, TrueView formats
- Retargeting: Cart abandoners, site visitors, $5-20 CPM, 1-3% CTR, 8-20% conversion
- CRM/Email: Highest ROAS, owned audience, $0-2 CPM, 20-35% open rate, 3-8% click rate

For "good" metrics:
- CPT (Cost Per Ticket): $15-35 is typical for mid-tier events, <$20 is excellent
- ROAS: 3:1 is breakeven (after fees), 5:1+ is strong, 8:1+ is exceptional
- Conversion rates: 2-5% is standard for cold traffic, 10%+ for retargeting/CRM

When providing strategic insights for Results & Recommendations, format as JSON array with this structure:
[
  {
    "category": "Campaign Health" | "Budget Efficiency" | "Channel Performance" | "Risk" | "Opportunity",
    "observation": "Specific data-driven observation",
    "recommendation": "Concrete actionable recommendation"
  }
]

Always relate advice to the user's specific event context when provided. Be conversational, practical, and encouraging.`,
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const answer = completion.choices[0]?.message?.content || "I'm not sure how to help with that. Could you rephrase your question?";

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Media insights error:", error);
    return res.status(500).json({
      error: "Failed to generate insights",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}