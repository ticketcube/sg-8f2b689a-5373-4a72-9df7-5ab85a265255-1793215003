import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Get Supabase token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const token = authHeader.split(" ")[1];

  // Verify token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    console.log("🧪 TEST: Starting database save test...");
    console.log("🧪 TEST: User ID:", user.id);

    // Test 1: Simple insert with authenticated user
    const testConversation = {
      user_id: user.id,
      title: "Test from API - " + new Date().toISOString(),
      messages: [
        {
          role: "user",
          content: "Test message from API endpoint",
          timestamp: new Date().toISOString(),
        },
        {
          role: "assistant",
          content: "Test response from API endpoint",
          timestamp: new Date().toISOString(),
        },
      ],
      type: "general",
      status: "active",
    };

    console.log("🧪 TEST: Attempting to insert:", testConversation);

    const { data, error } = await supabase
      .from("conversations")
      .insert(testConversation)
      .select()
      .single();

    if (error) {
      console.error("🧪 TEST: Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Database insert failed",
        details: error,
      });
    }

    console.log("🧪 TEST: Successfully inserted! ID:", data.id);

    return res.status(200).json({
      success: true,
      message: "Test conversation saved successfully!",
      conversationId: data.id,
      data,
    });
  } catch (error: any) {
    console.error("🧪 TEST: Unexpected error:", error);
    return res.status(500).json({
      success: false,
      error: "Test failed",
      details: error.message,
    });
  }
}