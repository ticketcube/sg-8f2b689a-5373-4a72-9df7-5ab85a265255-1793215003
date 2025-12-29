import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        success: false,
        error: "OPENAI_API_KEY not found in environment variables",
        hint: "Add OPENAI_API_KEY=sk-... to your .env.local file"
      });
    }

    if (!apiKey.startsWith("sk-")) {
      return res.status(500).json({ 
        success: false,
        error: "Invalid OPENAI_API_KEY format",
        hint: "API key should start with 'sk-'"
      });
    }

    // Test the API with a simple request
    const openai = new OpenAI({ apiKey });
    
    const startTime = Date.now();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'OpenAI API is working!' in exactly 5 words."
        }
      ],
      max_tokens: 20
    });
    const endTime = Date.now();

    return res.status(200).json({
      success: true,
      message: "OpenAI API is working correctly!",
      response: response.choices[0].message.content,
      responseTime: `${endTime - startTime}ms`,
      model: response.model,
      apiKeyPrefix: `${apiKey.substring(0, 10)}...`
    });

  } catch (error: unknown) {
    console.error("OpenAI API Test Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return res.status(500).json({
      success: false,
      error: "Failed to connect to OpenAI API",
      details: errorMessage,
      hint: "Check if your API key is valid and has credits available"
    });
  }
}