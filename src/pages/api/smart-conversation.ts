import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getAuthenticatedUser } from "@/lib/supabase-server";
import { logApiUsage } from "@/lib/api-cost-tracker";
import { performWebSearch } from "@/lib/web-search";

interface ConversationMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

interface CalendarEventRequest {
  title: string;
  description?: string;
  event_date: string;
  event_type: "reminder" | "milestone" | "event" | "birthday" | "appointment" | "task" | "shopping" | "other";
  all_day: boolean;
  event_time?: string;
}

// Define available functions for OpenAI
const tools = [
  {
    type: "function" as const,
    function: {
      name: "create_calendar_event",
      description: "Create a calendar event for reminders, appointments, tasks, shopping items, or any scheduled activity.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Title of the event or item"
          },
          description: {
            type: "string",
            description: "Optional detailed description"
          },
          event_date: {
            type: "string",
            description: "Date in YYYY-MM-DD format"
          },
          event_type: {
            type: "string",
            enum: ["reminder", "milestone", "event", "birthday", "appointment", "task", "shopping", "other"],
            description: "Type of event - use 'shopping' for shopping items, 'task' for to-dos"
          },
          all_day: {
            type: "boolean",
            description: "Whether this is an all-day event"
          },
          event_time: {
            type: "string",
            description: "Time in HH:MM format if not all_day"
          }
        },
        required: ["title", "event_date", "event_type"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_calendar_events",
      description: "Retrieve calendar events. Can filter by type (e.g., 'shopping' for shopping list items).",
      parameters: {
        type: "object",
        properties: {
          event_type: {
            type: "string",
            description: "Optional filter by event type (shopping, task, appointment, etc.)"
          },
          upcoming_only: {
            type: "boolean",
            description: "If true, only return future events"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "web_search",
      description: "Perform a web search to find real-time information on any topic.",
      parameters: {
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
  }
];

// Function execution handlers
async function executeFunctionCall(
  functionName: string,
  args: any,
  supabase: any,
  userId: string,
  req: NextApiRequest
): Promise<any> {
  console.log("🟦 FUNCTION_EXEC: Starting", functionName, "for user", userId);
  
  try {
    switch (functionName) {
      case "create_calendar_event": {
        const { title, description, event_date, event_type, all_day, event_time } = args;
        
        console.log("🟦 FUNCTION_EXEC: create_calendar_event", { title, event_date, event_type });

        const { data, error } = await supabase
          .from("family_events")
          .insert({
            user_id: userId,
            title,
            description: description || null,
            event_date,
            event_type,
            all_day: all_day !== false,
            event_time: all_day === false && event_time ? event_time : null
          })
          .select()
          .single();

        if (error) throw error;
        
        console.log("🟦 FUNCTION_SUCCESS: Event created");
        return { success: true, event: data };
      }

      case "get_calendar_events": {
        const { event_type, upcoming_only } = args;
        
        console.log("🟦 FUNCTION_EXEC: get_calendar_events", { event_type, upcoming_only });

        let query = supabase
          .from("family_events")
          .select("*")
          .eq("user_id", userId)
          .order("event_date", { ascending: true });

        if (event_type) {
          query = query.eq("event_type", event_type);
        }

        if (upcoming_only) {
          const today = new Date().toISOString().split("T")[0];
          query = query.gte("event_date", today);
        }

        const { data, error } = await query;

        if (error) throw error;

        console.log("🟦 FUNCTION_RESULT: Found", data?.length || 0, "events");
        return { success: true, events: data || [] };
      }

      case "web_search": {
        const { query } = args;

        console.log("🟦 FUNCTION_EXEC: web_search with query =", query);

        try {
          const searchData = await performWebSearch(query, userId, 3);
          
          console.log("🟦 FUNCTION_RESULT: Found", searchData.results?.length || 0, "results", searchData.cached ? "(cached)" : "(live)");
          
          return {
            success: true,
            query,
            results: searchData.results || [],
            cached: searchData.cached || false,
          };
        } catch (error: any) {
          console.error("🔴 WEB_SEARCH_ERROR:", error);
          return {
            success: false,
            error: error.message,
            query,
          };
        }
      }

      default:
        console.log("🔴 FUNCTION_ERROR: Unknown function", functionName);
        return { success: false, error: "Unknown function" };
    }
  } catch (error: any) {
    console.error("🔴 FUNCTION_ERROR:", functionName, error);
    return { success: false, error: error.message };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("🟦 API_RECEIVED: New request to smart-conversation endpoint");
  
  if (req.method !== "POST") {
    console.log("🔴 API_ERROR: Invalid method =", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log("🟦 OPENAI_INIT: API key prefix =", process.env.OPENAI_API_KEY?.substring(0, 15) || "NOT_SET");

  try {
    console.log("🟦 AUTH_CHECK: Attempting to get authenticated user");
    
    const { user, supabase } = await getAuthenticatedUser(req);
    const userId = user.id;
    console.log("🟦 AUTH_CHECK: User authenticated, userId =", userId);

    // Check if user has 'aiassist' role
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (profileError || !userProfile) {
      console.log("🔴 ROLE_CHECK: Failed to fetch user profile");
      return res.status(403).json({ 
        error: "Access denied - unable to verify user role" 
      });
    }

    if (userProfile.role !== "aiassist" && userProfile.role !== "admin") {
      console.log("🔴 ROLE_CHECK: User role =", userProfile.role, "- access denied");
      return res.status(403).json({ 
        error: "Access denied - AI assistant requires 'aiassist' role",
        currentRole: userProfile.role
      });
    }

    console.log("🟦 ROLE_CHECK: Access granted, user role =", userProfile.role);

    const { message, conversationMessages = [], mode = "conversation", conversationId: incomingConversationId } = req.body;

    console.log("🟦 MESSAGE_RECEIVED:", {
      messageLength: message?.length || 0,
      messagePreview: message?.substring(0, 50) || "none",
      conversationMessagesCount: conversationMessages.length,
      mode,
      conversationId: incomingConversationId || "new"
    });

    if (!message || typeof message !== "string") {
      console.log("🔴 VALIDATION_ERROR: Message is required or invalid type");
      return res.status(400).json({ error: "Message is required" });
    }

    // Handle resume conversation
    if (message === "__RESUME_CONVERSATION__" && incomingConversationId) {
      return res.status(200).json({
        response: "Welcome back! How can I help you today?",
        conversationType: "general",
        conversationId: incomingConversationId,
        messages: conversationMessages
      });
    }

    // Different system prompts based on mode
    let systemPrompt = "";

    if (mode === "title_edit") {
      systemPrompt = `You are helping rename a conversation. The user will speak a new title. 
Extract just the title they want, nothing else. Keep it under 50 characters.
If they say something like "change it to shopping list" or "call it email to sarah", 
extract just "Shopping List" or "Email to Sarah".`;
    } else if (mode === "save_prompt") {
      systemPrompt = `You are confirming if the user wants to save this conversation.
Ask them clearly: "Should I save this conversation as [current title]?" 
If they want a different title, ask them to speak the new title.
Keep your response brief and friendly.`;
    } else {
      // Regular conversation mode with function calling
      systemPrompt = `You are a helpful, intelligent AI assistant similar to ChatGPT or Claude.

CURRENT DATE: ${new Date().toISOString().split('T')[0]} (YYYY-MM-DD format)
Use this date to calculate relative dates like "tomorrow", "next week", etc.

CORE CAPABILITIES:

1. REAL-TIME WEB SEARCH:
   - You have access to live web search via Brave Search API
   - USE IT PROACTIVELY for: current events, weather, news, facts, recipes, business info, sports scores, stock prices, or ANY information that could be time-sensitive
   - When user asks about real-time information, search FIRST, then provide a natural answer
   - Don't guess or rely on training data for questions with time-sensitive answers

2. CALENDAR & TASK MANAGEMENT:
   You can create and retrieve calendar events for:
   - Shopping lists (event_type="shopping")
   - Tasks and to-dos (event_type="task")  
   - Appointments (event_type="appointment")
   - Reminders (event_type="reminder")
   - Birthdays, milestones, general events

3. PROACTIVE ASSISTANCE:
   - When user mentions something to buy/do/remember, CREATE the event immediately
   - Don't just acknowledge - take action using the functions
   - Confirm what you've saved naturally: "Got it, I've added [item] to your [list/calendar]"

FUNCTION USAGE GUIDELINES:

CREATE EVENTS when user mentions:
- "I need to buy milk" → create_calendar_event(type="shopping", title="Milk")
- "Remind me to call mom" → create_calendar_event(type="reminder", title="Call mom")
- "Doctor appointment Tuesday 3pm" → create_calendar_event(type="appointment")
- "I should finish the report" → create_calendar_event(type="task", title="Finish report")

RETRIEVE EVENTS when asked:
- "What's on my shopping list?" → get_calendar_events(event_type="shopping")
- "What do I need to do today?" → get_calendar_events(event_type="task", upcoming_only=true)
- "What's coming up?" → get_calendar_events(upcoming_only=true)

WEB SEARCH when asked about:
- Current events, news, weather
- Facts, definitions, how-to guides
- Business hours, contact info, addresses
- Real-time data (stocks, sports, crypto)
- Medical/health information (always search, never guess)
- Recipes, product info, reviews
- ANY factual question where freshness matters

PERSONALITY & STYLE:
- Be conversational, helpful, and intelligent
- Give direct answers without unnecessary preamble
- Be concise but thorough
- Ask clarifying questions when needed
- Use natural language (don't announce "I'm calling a function")
- Synthesize web search results into clear, natural answers

CONTEXT AWARENESS:
${conversationMessages.length > 0 ? "Continue this conversation naturally. Previous context is provided in the message history." : "This is a fresh conversation - introduce yourself helpfully."}

Remember: You're a capable AI assistant with real-time information access and task management powers. Use them to be genuinely helpful.`;
    }

    // Build messages array
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...conversationMessages.map((m: any): ChatCompletionMessageParam => {
        if (m.role === "tool") {
          return {
            role: "tool",
            content: m.content,
            tool_call_id: m.tool_call_id
          };
        }
        if (m.role === "assistant" && m.tool_calls) {
          return {
            role: "assistant",
            content: m.content || null,
            tool_calls: m.tool_calls
          };
        }
        return {
          role: m.role,
          content: m.content
        };
      }),
      {
        role: "user",
        content: message,
      },
    ];

    console.log("🟦 OPENAI_REQUEST: Preparing to call OpenAI");
    console.log("🟦 OPENAI_REQUEST: Message count =", messages.length);
    console.log("🟦 OPENAI_REQUEST: Mode =", mode);

    // Get AI response with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: mode === "conversation" ? tools : undefined,
      tool_choice: mode === "conversation" ? "auto" : undefined,
      temperature: mode === "title_edit" ? 0.3 : 0.7,
      max_tokens: mode === "title_edit" ? 100 : 500,
    });

    console.log("🟦 OPENAI_RESPONSE: Received response");

    let aiResponse = completion.choices[0].message.content || "";
    const toolCalls = completion.choices[0].message.tool_calls;

    console.log("🟦 OPENAI_RESPONSE: Tool calls =", toolCalls?.length || 0);

    const toolResults: Array<{ toolCallId: string; functionName: string; result: any }> = [];

    // Handle function calls
    if (toolCalls && toolCalls.length > 0) {
      console.log("🟦 FUNCTION_EXECUTION: Processing", toolCalls.length, "function calls");
      
      const functionMessages: ChatCompletionMessageParam[] = [
        ...messages, 
        {
          role: "assistant",
          content: completion.choices[0].message.content,
          tool_calls: completion.choices[0].message.tool_calls
        }
      ];

      for (const toolCall of toolCalls) {
        if (toolCall.type === "function") {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          console.log("🟦 FUNCTION_CALL: Executing", functionName, "with args:", functionArgs);

          const functionResult = await executeFunctionCall(
            functionName,
            functionArgs,
            supabase,
            userId,
            req
          );

          console.log("🟦 FUNCTION_RESULT:", functionName, "=>", functionResult);

          toolResults.push({
            toolCallId: toolCall.id,
            functionName,
            result: functionResult
          });

          functionMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(functionResult),
          });
        }
      }

      console.log("🟦 OPENAI_REQUEST: Getting final response with function results");

      // Get final response from AI with function results
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: functionMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      aiResponse = finalCompletion.choices[0].message.content || "Done!";
      console.log("🟦 OPENAI_RESPONSE: Final response length =", aiResponse.length);
    }

    // Detect conversation type from messages
    let conversationType: "shopping" | "task" | "appointment" | "general" = "general";
    const allContent = conversationMessages.map((m: any) => m.content).join(" ") + " " + message;
    
    if (/\b(shopping|buy|store|groceries|get|purchase)\b/i.test(allContent)) {
      conversationType = "shopping";
    } else if (/\b(task|todo|do|finish|complete)\b/i.test(allContent)) {
      conversationType = "task";
    } else if (/\b(appointment|doctor|meeting|schedule)\b/i.test(allContent)) {
      conversationType = "appointment";
    }

    console.log("🟦 CONVERSATION: Type detected =", conversationType);

    const userIsDone = /\b(that'?s all|i'?m done|that'?s everything|finished|that'?s it)\b/i.test(message);

    console.log("🟦 CONVERSATION: User done =", userIsDone);

    // Build updated messages array for database
    const updatedMessages: ConversationMessage[] = [
      ...conversationMessages,
      {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      } as ConversationMessage,
    ];

    // Add assistant message with tool calls if present
    if (toolCalls && toolCalls.length > 0) {
      updatedMessages.push({
        role: "assistant",
        content: completion.choices[0].message.content || null,
        timestamp: new Date().toISOString(),
        tool_calls: toolCalls,
      } as ConversationMessage);

      for (const toolResult of toolResults) {
        updatedMessages.push({
          role: "tool",
          content: JSON.stringify(toolResult.result),
          tool_call_id: toolResult.toolCallId,
          timestamp: new Date().toISOString(),
        } as ConversationMessage);
      }

      updatedMessages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      } as ConversationMessage);
    } else {
      updatedMessages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      } as ConversationMessage);
    }

    const conversationTitle = conversationMessages.length === 0 
      ? message.slice(0, 50) + (message.length > 50 ? "..." : "")
      : undefined;

    let resultConversationId = incomingConversationId;
    
    try {
      if (incomingConversationId) {
        console.log("🟦 DB_OPERATION: Updating existing conversation", incomingConversationId);
        
        const { error: updateError } = await supabase
          .from("conversations")
          .update({
            messages: updatedMessages,
            type: conversationType,
            updated_at: new Date().toISOString(),
          })
          .eq("id", incomingConversationId);

        if (updateError) throw updateError;
        console.log("🟦 DB_OPERATION: Conversation updated successfully");
      } else {
        console.log("🟦 DB_OPERATION: Creating new conversation");
        
        const { data: newConv, error: insertError } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            title: conversationTitle || "New Conversation",
            messages: updatedMessages,
            type: conversationType,
            status: "active",
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        if (newConv) {
          resultConversationId = newConv.id;
          console.log("🟦 DB_OPERATION: New conversation created, id =", resultConversationId);
        }
      }

      // Log API usage
      console.log("📊 LOGGING API USAGE");
      
      const tokensUsed = completion.usage;
      if (tokensUsed) {
        await logApiUsage({
          userId,
          apiName: "openai",
          endpoint: "/api/smart-conversation",
          model: "gpt-4o",
          tokensInput: tokensUsed.prompt_tokens,
          tokensOutput: tokensUsed.completion_tokens,
          tokensTotal: tokensUsed.total_tokens,
          requestData: {
            conversation_id: resultConversationId,
            conversation_type: conversationType,
          },
        });
      }

      const webSearchCalls = toolCalls?.filter((tc: any) => tc.function?.name === "web_search").length || 0;
      if (webSearchCalls > 0) {
        await logApiUsage({
          userId,
          apiName: "brave_search",
          endpoint: "/api/web-search",
          apiCalls: webSearchCalls,
          requestData: {
            conversation_id: resultConversationId,
          },
        });
      }

    } catch (dbError) {
      console.error("🔴 DB_ERROR: Failed to save conversation", dbError);
      return res.status(500).json({
        error: "Failed to save conversation to database",
        details: dbError instanceof Error ? dbError.message : "Unknown error",
      });
    }

    console.log("🟦 API_SUCCESS: Sending response to client");

    return res.status(200).json({
      response: aiResponse,
      conversationType,
      userIsDone,
      conversationId: resultConversationId,
      title: conversationTitle,
      messages: updatedMessages,
    });

  } catch (error: any) {
    console.error("🔴 API_ERROR:", error);
    console.error("🔴 API_ERROR_STACK:", error.stack);
    
    if (error.message === "No authorization header" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    return res.status(500).json({
      error: "Failed to process conversation",
      details: error.message,
    });
  }
}