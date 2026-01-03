import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { text, voice = "nova", speed = 1.0 } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    // Validate voice option
    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    if (!validVoices.includes(voice)) {
      return res.status(400).json({ error: "Invalid voice option" });
    }

    // Validate speed
    if (speed < 0.25 || speed > 4.0) {
      return res.status(400).json({ error: "Speed must be between 0.25 and 4.0" });
    }

    // Call OpenAI TTS API
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
        speed: speed,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI TTS Error:", errorData);
      return res.status(response.status).json({ 
        error: "Failed to generate speech",
        details: errorData 
      });
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();

    // Optional: Track usage for future billing
    try {
      await supabaseAdmin.from("tts_usage_logs").insert({
        user_id: user.id,
        characters: text.length,
        voice: voice,
        cost: (text.length / 1000) * 0.015, // $0.015 per 1K chars
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error("Failed to log TTS usage:", logError);
    }

    // Return audio as response
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.byteLength.toString());
    res.send(Buffer.from(audioBuffer));

  } catch (error: any) {
    console.error("TTS API Error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
}