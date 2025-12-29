import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, conversationMessages = [], mode = "conversation", conversationId } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
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
      // Regular conversation mode
      systemPrompt = `You are a helpful AI assistant for an elderly person named Lois.

CONVERSATION TYPES:
1. SHOPPING LISTS - Help organize items to buy
2. MOVING LISTS - Help organize items for moving/giving away  
3. EMAIL DRAFTS - Help write emails
4. GENERAL Q&A - Answer questions simply and clearly

YOUR ROLE:
- Be warm, patient, and conversational
- Use simple, clear language
- Ask follow-up questions naturally
- Keep track of the conversation context
- When user seems done (says "that's all", "done", "finished"), acknowledge you have everything

IMPORTANT:
- Do NOT save anything yourself
- Do NOT mention saving unless the user asks
- Just help gather information conversationally
- Be concise but friendly

CONVERSATION CONTEXT:
${conversationMessages.length > 0 ? "Continue this conversation naturally. Review previous messages for context." : "This is the start of a new conversation."}`;
    }

    // Build messages array
    const messages: ConversationMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...conversationMessages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: mode === "title_edit" ? 0.3 : 0.7,
      max_tokens: mode === "title_edit" ? 100 : 500,
    });

    const aiResponse = completion.choices[0].message.content || "I didn't understand that. Could you try again?";

    // Detect conversation type from messages
    let conversationType: "shopping" | "moving" | "email" | "general" = "general";
    const allContent = conversationMessages.map((m: any) => m.content).join(" ") + " " + message;
    
    if (/\b(shopping|buy|store|groceries|get|purchase)\b/i.test(allContent)) {
      conversationType = "shopping";
    } else if (/\b(move|moving|give away|furniture|packing|organize items|donate)\b/i.test(allContent)) {
      conversationType = "moving";
    } else if (/\b(email|write|send|message to|letter)\b/i.test(allContent)) {
      conversationType = "email";
    }

    // Check if user indicates they're done
    const userIsDone = /\b(that'?s all|i'?m done|that'?s everything|finished|that'?s it)\b/i.test(message);

    // Build updated messages array for database
    const updatedMessages = [
      ...conversationMessages,
      {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      },
      {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      },
    ];

    // Generate a title from the first user message if this is a new conversation
    const title = conversationMessages.length === 0 
      ? message.slice(0, 50) + (message.length > 50 ? "..." : "")
      : undefined;

    // Save or update conversation in database
    try {
      if (conversationId) {
        // Update existing conversation
        const { error } = await supabase
          .from("conversations")
          .update({
            messages: updatedMessages,
            updated_at: new Date().toISOString(),
          })
          .eq("id", conversationId);

        if (error) {
          console.error("Error updating conversation:", error);
        }
      } else {
        // Create new conversation
        const { data, error } = await supabase
          .from("conversations")
          .insert({
            title: title || "New Conversation",
            messages: updatedMessages,
            type: conversationType,
            status: "active",
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating conversation:", error);
        } else {
          // Return the new conversation ID so frontend can track it
          return res.status(200).json({
            response: aiResponse,
            conversationType,
            userIsDone,
            conversationId: data.id,
          });
        }
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Continue even if database save fails
    }

    return res.status(200).json({
      response: aiResponse,
      conversationType,
      userIsDone,
      conversationId,
    });

  } catch (error: any) {
    console.error("Smart conversation error:", error);
    return res.status(500).json({
      error: "Failed to process conversation",
      details: error.message,
    });
  }
}