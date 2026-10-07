import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getAuthenticatedUser } from "@/lib/supabase-server";
import { logApiUsage } from "@/lib/api-cost-tracker";

interface ConversationMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface CalendarEventRequest {
  title: string;
  description?: string;
  event_date: string;
  event_type: "reminder" | "milestone" | "event" | "birthday" | "appointment" | "other";
  all_day: boolean;
  event_time?: string;
}

// Define available functions for OpenAI
const tools = [
  {
    type: "function" as const,
    function: {
      name: "save_shopping_list",
      description: "Save or update items in the shopping list. Call this when user mentions items to buy or add to shopping list.",
      parameters: {
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
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_shopping_list",
      description: "Retrieve the current shopping list to see what items are already saved.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "save_inventory_item",
      description: "Save an item to the moving/storage inventory. Use when user mentions organizing items in the loft or moving items.",
      parameters: {
        type: "object",
        properties: {
          item_name: {
            type: "string",
            description: "Name of the item being stored or moved"
          },
          floor: {
            type: "string",
            description: "Floor number where item is located: '5', '6', or 'basement'",
            enum: ["5", "6", "basement"]
          },
          city: {
            type: "string",
            description: "City where the item will be shipped (e.g., 'Boston', 'Chicago', 'Seattle')"
          },
          recipient: {
            type: "string",
            description: "Name of person who should receive this item (e.g., 'Sarah', 'Michael', 'Tom')"
          },
          notes: {
            type: "string",
            description: "Additional notes about the item"
          }
        },
        required: ["item_name", "floor", "city", "recipient"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_inventory",
      description: "Get items from the moving/storage inventory. Can filter by location.",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "Optional filter by location (e.g., 'loft', 'garage')"
          }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "save_email_draft",
      description: "Save or update an email draft when user is composing an email.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "Email recipient name or address"
          },
          subject: {
            type: "string",
            description: "Email subject line"
          },
          body: {
            type: "string",
            description: "Email body content"
          }
        },
        required: ["to", "body"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_email_draft",
      description: "Retrieve the current email draft being worked on.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "web_search",
      description: "Perform a web search to find information on a topic. Use this when user asks for information that is not in their inventory or shopping list.",
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

// Function execution handlers - now receives supabase client with user context
async function executeFunctionCall(
  functionName: string,
  args: any,
  supabase: any,
  userId: string,
  conversationId?: string
): Promise<any> {
  console.log("🟦 FUNCTION_EXEC: Starting", functionName, "for user", userId);
  
  try {
    switch (functionName) {
      case "save_shopping_list": {
        console.log("🟦 FUNCTION_EXEC: save_shopping_list with", args.items?.length || 0, "items");
        const { items } = args;
        
        // Check if shopping list already exists for this conversation
        let existingList;
        if (conversationId) {
          const { data } = await supabase
            .from("saved_items")
            .select("*")
            .eq("type", "shopping")
            .eq("metadata->>conversation_id", conversationId)
            .single();
          existingList = data;
          console.log("🟦 DB_CHECK: Existing shopping list =", existingList ? "found" : "not found");
        }

        if (existingList) {
          // Update existing list by merging items
          const currentItems = existingList.content.items || [];
          const mergedItems = [...currentItems];
          
          // Add new items or update existing ones
          items.forEach((newItem: any) => {
            const existingIndex = mergedItems.findIndex(
              (item: any) => item.name.toLowerCase() === newItem.name.toLowerCase()
            );
            if (existingIndex >= 0) {
              mergedItems[existingIndex] = { ...mergedItems[existingIndex], ...newItem };
            } else {
              mergedItems.push(newItem);
            }
          });

          console.log("🟦 DB_OPERATION: Updating shopping list, merged items =", mergedItems.length);

          const { data, error } = await supabase
            .from("saved_items")
            .update({
              content: { items: mergedItems },
              updated_at: new Date().toISOString()
            })
            .eq("id", existingList.id)
            .select()
            .single();

          if (error) throw error;
          console.log("🟦 FUNCTION_SUCCESS: Shopping list updated");
          return { success: true, itemCount: mergedItems.length, items: mergedItems };
        } else {
          console.log("🟦 DB_OPERATION: Creating new shopping list");
          
          // Create new shopping list
          const { data, error } = await supabase
            .from("saved_items")
            .insert({
              user_id: userId,
              type: "shopping",
              title: "Shopping List",
              content: { items },
              metadata: conversationId ? { conversation_id: conversationId } : null
            })
            .select()
            .single();

          if (error) throw error;
          console.log("🟦 FUNCTION_SUCCESS: New shopping list created");
          return { success: true, itemCount: items.length, items };
        }
      }

      case "get_shopping_list": {
        const { data, error } = await supabase
          .from("saved_items")
          .select("*")
          .eq("type", "shopping")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          return { success: true, items: [], message: "No shopping list found" };
        }

        return { 
          success: true, 
          items: data.content.items || [],
          itemCount: (data.content.items || []).length
        };
      }

      case "save_inventory_item": {
        const { item_name, floor, city, recipient, notes } = args;

        console.log("🟦 FUNCTION_EXEC: save_inventory_item with item =", item_name, "floor =", floor, "city =", city, "recipient =", recipient);

        // Check if inventory exists for this conversation
        let existingInventory;
        if (conversationId) {
          const { data } = await supabase
            .from("saved_items")
            .select("*")
            .eq("type", "moving")
            .eq("metadata->>conversation_id", conversationId)
            .single();
          existingInventory = data;
        }

        const newItem = {
          name: item_name,
          floor,
          city,
          recipient,
          notes: notes || ""
        };

        if (existingInventory) {
          // Check for duplicates
          const currentItems = existingInventory.content.items || [];
          const duplicate = currentItems.find((item: any) => 
            item.name.toLowerCase() === item_name.toLowerCase() &&
            item.floor === floor &&
            item.recipient.toLowerCase() === recipient.toLowerCase()
          );

          if (duplicate) {
            console.log("🟦 FUNCTION_RESULT: Duplicate found, not adding");
            return { 
              success: true, 
              isDuplicate: true, 
              message: `${item_name} on floor ${floor} for ${recipient} is already on your list`,
              itemCount: currentItems.length
            };
          }

          // Update existing inventory
          const updatedItems = [...currentItems, newItem];

          const { data, error } = await supabase
            .from("saved_items")
            .update({
              content: { items: updatedItems },
              updated_at: new Date().toISOString()
            })
            .eq("id", existingInventory.id)
            .select()
            .single();

          if (error) throw error;
          console.log("🟦 FUNCTION_SUCCESS: Inventory updated, total items =", updatedItems.length);
          return { success: true, itemCount: updatedItems.length, addedItem: newItem };
        } else {
          // Create new inventory
          const { data, error } = await supabase
            .from("saved_items")
            .insert({
              user_id: userId,
              type: "moving",
              title: "Loft Inventory",
              content: { items: [newItem] },
              metadata: conversationId ? { conversation_id: conversationId } : null
            })
            .select()
            .single();

          if (error) throw error;
          console.log("🟦 FUNCTION_SUCCESS: New inventory created");
          return { success: true, itemCount: 1, addedItem: newItem };
        }
      }

      case "get_inventory": {
        const { location } = args;

        console.log("🟦 FUNCTION_EXEC: get_inventory with location filter =", location || "none");

        const { data, error } = await supabase
          .from("saved_items")
          .select("*")
          .eq("type", "moving")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          console.log("🟦 FUNCTION_RESULT: No inventory found");
          return { success: true, items: [], message: "No inventory found" };
        }

        let items = data.content.items || [];
        
        // Filter by location (floor, city, or recipient) if specified
        if (location) {
          const searchTerm = location.toLowerCase();
          items = items.filter((item: any) => 
            item.floor?.toLowerCase().includes(searchTerm) ||
            item.city?.toLowerCase().includes(searchTerm) ||
            item.recipient?.toLowerCase().includes(searchTerm)
          );
        }

        console.log("🟦 FUNCTION_RESULT: Found", items.length, "items");
        return { 
          success: true, 
          items,
          itemCount: items.length
        };
      }

      case "save_email_draft": {
        const { to, subject, body } = args;

        // Check if email draft exists for this conversation
        let existingDraft;
        if (conversationId) {
          const { data } = await supabase
            .from("saved_items")
            .select("*")
            .eq("type", "email")
            .eq("metadata->>conversation_id", conversationId)
            .single();
          existingDraft = data;
        }

        const emailContent = { recipient: to, subject, body };

        if (existingDraft) {
          // Update existing draft
          const { data, error } = await supabase
            .from("saved_items")
            .update({
              content: emailContent,
              updated_at: new Date().toISOString()
            })
            .eq("id", existingDraft.id)
            .select()
            .single();

          if (error) throw error;
          return { success: true, action: "updated" };
        } else {
          // Create new draft
          const { data, error } = await supabase
            .from("saved_items")
            .insert({
              user_id: userId,
              type: "email",
              title: `Email to ${to}`,
              content: emailContent,
              metadata: conversationId ? { conversation_id: conversationId } : null
            })
            .select()
            .single();

          if (error) throw error;
          return { success: true, action: "created" };
        }
      }

      case "get_email_draft": {
        const { data, error } = await supabase
          .from("saved_items")
          .select("*")
          .eq("type", "email")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          return { success: true, draft: null, message: "No email draft found" };
        }

        return { 
          success: true, 
          draft: data.content
        };
      }

      case "web_search": {
        const { query } = args;

        console.log("🟦 FUNCTION_EXEC: web_search with query =", query);

        try {
          // Call the actual web-search API endpoint using relative path
          const baseUrl = process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3000';
          
          const searchResponse = await fetch(`${baseUrl}/api/web-search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query, count: 3 }),
          });

          if (!searchResponse.ok) {
            const errorData = await searchResponse.json().catch(() => ({}));
            console.error("🔴 WEB_SEARCH_API_ERROR:", searchResponse.status, errorData);
            throw new Error(`Web search failed: ${searchResponse.status} - ${errorData.error || 'Unknown error'}`);
          }

          const searchData = await searchResponse.json();
          
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

  // Initialize OpenAI client here to pick up environment variables
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log("🟦 OPENAI_INIT: API key prefix =", process.env.OPENAI_API_KEY?.substring(0, 15) || "NOT_SET");

  try {
    // Get authenticated user and Supabase client with user context
    console.log("🟦 AUTH_CHECK: Attempting to get authenticated user");
    console.log("🟦 AUTH_CHECK: Authorization header present =", !!req.headers.authorization);
    
    const { user, supabase } = await getAuthenticatedUser(req);
    const userId = user.id;
    console.log("🟦 AUTH_CHECK: User authenticated, userId =", userId);

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

    // Check if message is calendar-related
    const calendarKeywords = ["remind", "reminder", "schedule", "appointment", "birthday", "milestone", "event", "calendar", "add to calendar"];
    const isCalendarRequest = calendarKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    let calendarEventCreated = false;
    let eventDetails: CalendarEventRequest | null = null;

    if (isCalendarRequest) {
      // Ask AI to extract calendar event details
      try {
        const extractionResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a calendar event extraction assistant. Extract event details from user messages and return ONLY a valid JSON object with these fields:
{
  "isCalendarEvent": true/false,
  "title": "event title",
  "description": "optional description",
  "event_date": "YYYY-MM-DD format",
  "event_type": "reminder|milestone|event|birthday|appointment|other",
  "all_day": true/false,
  "event_time": "HH:MM format if not all_day, otherwise null"
}

Current date: ${new Date().toISOString().split("T")[0]}

If the message is not asking to create/schedule/remind about something, return {"isCalendarEvent": false}. 
If dates are relative (tomorrow, next week, etc.), calculate the actual date.
Return ONLY the JSON object, no explanation.`
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.3
        });

        const extractedData = JSON.parse(extractionResponse.choices[0].message.content || "{}");

        if (extractedData.isCalendarEvent) {
          eventDetails = extractedData;

          // Create the calendar event in Supabase
          const { error: calendarError } = await supabase
            .from("family_events")
            .insert({
              user_id: session.user.id,
              title: eventDetails.title,
              description: eventDetails.description || null,
              event_date: eventDetails.event_date,
              event_type: eventDetails.event_type,
              all_day: eventDetails.all_day,
              event_time: eventDetails.event_time || null
            });

          if (!calendarError) {
            calendarEventCreated = true;
          }
        }
      } catch (e) {
        console.error("Calendar extraction error:", e);
        // Continue with normal chat even if calendar extraction fails
      }
    }

    // Handle resume conversation with context
    if (message === "__RESUME_CONVERSATION__" && incomingConversationId) {
      // Load saved items associated with this conversation
      const { data: savedItems } = await supabase
        .from("saved_items")
        .select("*")
        .eq("metadata->>conversation_id", incomingConversationId)
        .order("updated_at", { ascending: false });

      let contextMessage = "";
      if (savedItems && savedItems.length > 0) {
        const item = savedItems[0];
        if (item.type === "shopping") {
          const itemCount = item.content.items?.length || 0;
          const itemNames = item.content.items?.slice(0, 3).map((i: any) => i.name).join(", ") || "";
          contextMessage = `Welcome back! Your shopping list has ${itemCount} items${itemCount > 0 ? `: ${itemNames}${itemCount > 3 ? "..." : ""}` : ""}. What else would you like to add?`;
        } else if (item.type === "moving") {
          const itemCount = item.content.items?.length || 0;
          contextMessage = `Welcome back! Your inventory has ${itemCount} items tracked. What else would you like to organize?`;
        } else if (item.type === "email") {
          const recipient = item.content.recipient || "recipient";
          contextMessage = `Welcome back! You're working on an email to ${recipient}. Would you like to continue editing?`;
        }
      } else {
        contextMessage = "Welcome back! Let's continue where we left off. What can I help you with?";
      }

      return res.status(200).json({
        response: contextMessage,
        conversationType: savedItems?.[0]?.type || "general",
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
      systemPrompt = `You are a helpful AI assistant for an elderly person named Lois.

CONVERSATION TYPES & WHEN TO USE FUNCTIONS:
1. SHOPPING LISTS - Use save_shopping_list() when user mentions items to buy
2. LOFT/MOVING INVENTORY - Use save_inventory_item() when user mentions organizing items in the loft
   - Extract: item name, floor (5, 6, or basement), city destination, recipient name
   - Example: "lamp on floor 5 going to Sarah in Boston"
3. EMAIL DRAFTS - Use save_email_draft() when user is composing an email
4. GENERAL Q&A - Answer questions conversationally
5. REAL-TIME INFORMATION - Use web_search() for current information

WHEN TO USE WEB SEARCH:
- Weather queries (temperature, forecast, conditions)
- Current news and events
- Sports scores and schedules
- Stock prices and financial data
- Business hours and locations
- Any real-time or current information you don't have
- Facts you're uncertain about
- Recent events after your knowledge cutoff

FUNCTION CALLING RULES:
- Call functions proactively as user mentions items/actions
- Use get_inventory() when user asks "what's on my list", "who is X going to", "show me my items"
- Always confirm what you saved after calling a function
- Be natural - don't announce "I'm calling a function now"
- For weather/news/real-time queries, ALWAYS use web_search() first, then provide the answer

INVENTORY QUERIES:
- "What's on my list?" → Use get_inventory() with no filter
- "Who is the lamp going to?" → Use get_inventory(), then search for lamp in results
- "What do I have for Sarah?" → Use get_inventory(location="Sarah")
- "What's on floor 5?" → Use get_inventory(location="5")

DUPLICATE DETECTION:
- If function returns isDuplicate=true, tell user the item is already listed
- Suggest updating instead of adding duplicate

YOUR ROLE:
- Be warm, patient, and conversational
- Use simple, clear language
- Ask follow-up questions naturally
- Save items as they're mentioned - don't wait to be asked
- When user seems done (says "that's all", "done", "finished"), summarize what was saved

IMPORTANT:
- Proactively save items using functions
- Don't just talk about saving - actually save using functions
- Be concise but friendly
- For real-time information, use web_search() and provide the answer naturally

CONVERSATION CONTEXT:
${conversationMessages.length > 0 ? "Continue this conversation naturally. Review previous messages for context." : "This is the start of a new conversation."}`;
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
    console.log("🟦 OPENAI_REQUEST: Tools enabled =", mode === "conversation");

    // Get AI response with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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

    // Store tool results to avoid re-execution
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

      // Execute each function call ONCE
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
            incomingConversationId
          );

          console.log("🟦 FUNCTION_RESULT:", functionName, "=>", functionResult);

          // Store result for later use
          toolResults.push({
            toolCallId: toolCall.id,
            functionName,
            result: functionResult
          });

          // Add function result to messages for OpenAI
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
        model: "gpt-3.5-turbo",
        messages: functionMessages,
        temperature: 0.7,
        max_tokens: 500,
      });

      aiResponse = finalCompletion.choices[0].message.content || "Done!";
      console.log("🟦 OPENAI_RESPONSE: Final response length =", aiResponse.length);
    }

    // Detect conversation type from messages
    let conversationType: "shopping" | "moving" | "email" | "general" = "general";
    const allContent = conversationMessages.map((m: any) => m.content).join(" ") + " " + message;
    
    if (/\b(shopping|buy|store|groceries|get|purchase)\b/i.test(allContent)) {
      conversationType = "shopping";
    } else if (/\b(move|moving|give away|furniture|packing|organize items|donate|loft|storage)\b/i.test(allContent)) {
      conversationType = "moving";
    } else if (/\b(email|write|send|message to|letter)\b/i.test(allContent)) {
      conversationType = "email";
    }

    console.log("🟦 CONVERSATION: Type detected =", conversationType);

    // Check if user indicates they're done
    const userIsDone = /\b(that'?s all|i'?m done|that'?s everything|finished|that'?s it)\b/i.test(message);

    console.log("🟦 CONVERSATION: User done =", userIsDone);

    // Build updated messages array for database - include tool calls and responses
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

      // Add tool response messages using stored results
      for (const toolResult of toolResults) {
        updatedMessages.push({
          role: "tool",
          content: JSON.stringify(toolResult.result),
          tool_call_id: toolResult.toolCallId,
          timestamp: new Date().toISOString(),
        } as ConversationMessage);
      }

      // Add final assistant response
      updatedMessages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      } as ConversationMessage);
    } else {
      // No tool calls, just add assistant response
      updatedMessages.push({
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      } as ConversationMessage);
    }

    // Generate a title from the first user message if this is a new conversation
    const conversationTitle = conversationMessages.length === 0 
      ? message.slice(0, 50) + (message.length > 50 ? "..." : "")
      : undefined;

    // Save or update conversation in database - NOW USES USER CONTEXT
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

      // Log API usage for this conversation (when conversation is saved/updated)
      console.log("📊 LOGGING API USAGE");
      
      // Log OpenAI usage
      const tokensUsed = completion.usage;
      if (tokensUsed) {
        await logApiUsage({
          userId,
          apiName: "openai",
          endpoint: "/api/smart-conversation",
          model: "gpt-3.5-turbo",
          tokensInput: tokensUsed.prompt_tokens,
          tokensOutput: tokensUsed.completion_tokens,
          tokensTotal: tokensUsed.total_tokens,
          requestData: {
            conversation_id: resultConversationId,
            conversation_type: conversationType,
          },
        });
      }

      // Log web search usage if web_search was called
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

    // Extract latest items for display
    let functionResults = null;
    if (conversationType === "moving" || conversationType === "shopping") {
      try {
        const { data: latestItem } = await supabase
          .from("saved_items")
          .select("*")
          .eq("type", conversationType === "moving" ? "moving" : "shopping")
          .order("updated_at", { ascending: false })
          .limit(1)
          .single();

        if (latestItem && latestItem.content.items) {
          functionResults = { items: latestItem.content.items };
        }
      } catch (e) {
        // No items yet, that's ok
      }
    }

    return res.status(200).json({
      response: aiResponse,
      conversationType,
      userIsDone,
      conversationId: resultConversationId,
      title: conversationTitle,
      messages: updatedMessages,
      functionResults,
    });

  } catch (error: any) {
    console.error("🔴 API_ERROR:", error);
    console.error("🔴 API_ERROR_STACK:", error.stack);
    console.error("🔴 API_ERROR_MESSAGE:", error.message);
    
    if (error.message === "No authorization header" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    return res.status(500).json({
      error: "Failed to process conversation",
      details: error.message,
    });
  }
}