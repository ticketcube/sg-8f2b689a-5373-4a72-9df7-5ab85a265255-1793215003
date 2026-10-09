import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { getAuthenticatedUser } from "@/lib/supabase-server";
import { logApiUsage } from "@/lib/api-cost-tracker";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// Define available tools for Claude (similar structure to OpenAI but Anthropic format)
const tools = [
  {
    name: "save_shopping_list",
    description: "Save or update items in the shopping list. Call this when user mentions items to buy or add to shopping list.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          description: "Array of shopping items",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Name of the item to buy"
              },
              quantity: {
                type: "string",
                description: "Optional quantity or timing (e.g., '2', 'weekly', 'when on sale')"
              },
              notes: {
                type: "string",
                description: "Optional notes about the item"
              }
            },
            required: ["name"]
          }
        }
      },
      required: ["items"]
    }
  },
  {
    name: "get_shopping_list",
    description: "Retrieve the current shopping list to see what items are already saved.",
    input_schema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "web_search",
    description: "Perform a web search to find current information on a topic. Use this when user asks for real-time information.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query or topic to search for"
        }
      },
      required: ["query"]
    }
  }
];

// Import the same function execution handler from smart-conversation
// You would need to extract this to a shared utility file
async function executeFunctionCall(
  functionName: string,
  args: any,
  supabase: any,
  userId: string,
  conversationId?: string
): Promise<any> {
  // Same implementation as in smart-conversation.ts
  // For brevity, not duplicating here - extract to shared utility
  console.log("Executing function:", functionName);
  return { success: true, message: "Function executed" };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("🟪 CLAUDE_API: New request received");
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if Anthropic API key is configured
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    return res.status(500).json({ 
      error: "Claude API not configured. Please add ANTHROPIC_API_KEY to environment variables." 
    });
  }

  // Initialize Anthropic client
  const anthropic = new Anthropic({
    apiKey: anthropicApiKey,
  });

  try {
    // Get authenticated user
    const { user, supabase } = await getAuthenticatedUser(req);
    const userId = user.id;
    console.log("🟪 CLAUDE_AUTH: User authenticated:", userId);

    const { message, conversationMessages = [], conversationId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build messages array for Claude (Anthropic format)
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...conversationMessages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content
      })),
      {
        role: "user" as const,
        content: message,
      },
    ];

    console.log("🟪 CLAUDE_REQUEST: Calling Claude API with", messages.length, "messages");

    // Call Claude with tool use
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Latest Claude model
      max_tokens: 1024,
      system: `You are a helpful AI assistant for an elderly person named Lois.

CRITICAL: You have access to real-time web search. USE IT for any information you're uncertain about.

CONVERSATION TYPES:
1. SHOPPING LISTS - Use save_shopping_list() when user mentions items to buy
2. WEB SEARCH - Use web_search() for current information, recipes, weather, news, facts
3. GENERAL Q&A - Answer questions conversationally

USE WEB_SEARCH FOR:
- Weather, news, recipes, facts, medical info, business hours
- Any real-time or time-sensitive information
- Questions about current events or recent information

Be warm, patient, and conversational. Use simple, clear language.`,
      messages,
      tools,
    });

    console.log("🟪 CLAUDE_RESPONSE: Received response");

    let aiResponse = "";
    const toolCalls: Array<any> = [];

    // Process Claude's response
    for (const block of response.content) {
      if (block.type === "text") {
        aiResponse += block.text;
      } else if (block.type === "tool_use") {
        toolCalls.push(block);
      }
    }

    // Handle tool calls if present
    if (toolCalls.length > 0) {
      console.log("🟪 CLAUDE_TOOLS: Processing", toolCalls.length, "tool calls");
      
      const toolResults: Array<any> = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.name;
        const functionArgs = toolCall.input;

        console.log("🟪 CLAUDE_TOOL_EXEC:", functionName);

        const functionResult = await executeFunctionCall(
          functionName,
          functionArgs,
          supabase,
          userId,
          conversationId
        );

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolCall.id,
          content: JSON.stringify(functionResult),
        });
      }

      // If tools were used, get final response from Claude
      const finalResponse = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: `You are a helpful AI assistant. Synthesize the tool results into a natural response.`,
        messages: [
          ...messages,
          {
            role: "assistant",
            content: response.content,
          },
          {
            role: "user",
            content: toolResults,
          },
        ],
      });

      // Extract final text response
      aiResponse = "";
      for (const block of finalResponse.content) {
        if (block.type === "text") {
          aiResponse += block.text;
        }
      }
    }

    console.log("🟪 CLAUDE_SUCCESS: Generated response");

    // Log API usage
    await logApiUsage({
      userId,
      apiName: "anthropic",
      endpoint: "/api/claude-conversation",
      model: "claude-3-5-sonnet-20241022",
      tokensInput: response.usage.input_tokens,
      tokensOutput: response.usage.output_tokens,
      tokensTotal: response.usage.input_tokens + response.usage.output_tokens,
      requestData: {
        conversation_id: conversationId,
      },
    });

    return res.status(200).json({
      response: aiResponse,
      conversationId,
    });

  } catch (error: any) {
    console.error("🔴 CLAUDE_ERROR:", error);
    
    if (error.message === "No authorization header" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    return res.status(500).json({
      error: "Failed to process conversation with Claude",
      details: error.message,
    });
  }
}