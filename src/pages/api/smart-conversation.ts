import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface SavedItem {
  type: "shopping" | "moving" | "email";
  title: string;
  content: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build conversation context
    const messages: ConversationMessage[] = [
      {
        role: "system",
        content: `You are a helpful AI assistant for an elderly person. You help with:

1. SHOPPING LISTS - When user wants to make a shopping list
2. MOVING LISTS - When user wants to organize items for moving/giving away
3. EMAIL DRAFTS - When user wants to write an email
4. GENERAL Q&A - Answer any other questions simply and clearly

RULES:
- Be warm, patient, and conversational
- Use simple language
- For lists/emails, gather information conversationally over multiple turns
- When user seems done or says "that's all", ask if they want to save it
- Keep track of what you're building as you go
- For Q&A, just answer directly and be done

INTENT DETECTION:
- Shopping: "make shopping list", "need to buy", "going to store", "groceries"
- Moving: "organize for move", "give away", "furniture", "packing", "items to"
- Email: "write email", "send email", "email to", "message"
- Q&A: Everything else

CURRENT CONVERSATION STATE:
${conversationHistory.length > 0 ? "You are in an ongoing conversation. Continue naturally." : "This is a new conversation. Detect intent and respond accordingly."}`,
      },
      ...conversationHistory,
      {
        role: "user",
        content: message,
      },
    ];

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message.content || "I didn't understand that. Could you try again?";

    // Detect if user wants to save
    const wantsToSave = /\b(save|done|finish|that'?s all|i'?m done)\b/i.test(message);
    
    // Detect conversation type from history and current message
    let conversationType: "shopping" | "moving" | "email" | "qa" = "qa";
    const fullConversation = conversationHistory.map((m: any) => m.content).join(" ") + " " + message;
    
    if (/\b(shopping|buy|store|groceries|get)\b/i.test(fullConversation)) {
      conversationType = "shopping";
    } else if (/\b(move|moving|give away|furniture|packing|organize items)\b/i.test(fullConversation)) {
      conversationType = "moving";
    } else if (/\b(email|write|send|message to)\b/i.test(fullConversation)) {
      conversationType = "email";
    }

    let savedItemId = null;

    // If user wants to save and it's a list/email conversation
    if (wantsToSave && conversationType !== "qa") {
      const savedItem = await saveConversation(conversationType, conversationHistory, message, aiResponse);
      if (savedItem) {
        savedItemId = savedItem.id;
      }
    }

    return res.status(200).json({
      response: aiResponse,
      conversationType,
      shouldSave: wantsToSave && conversationType !== "qa",
      savedItemId,
    });

  } catch (error: any) {
    console.error("Smart conversation error:", error);
    return res.status(500).json({
      error: "Failed to process conversation",
      details: error.message,
    });
  }
}

async function saveConversation(
  type: "shopping" | "moving" | "email",
  history: ConversationMessage[],
  userMessage: string,
  aiResponse: string
): Promise<{ id: string } | null> {
  try {
    // Extract content from conversation
    const allMessages = [...history, { role: "user", content: userMessage }, { role: "assistant", content: aiResponse }];
    const userMessages = allMessages.filter(m => m.role === "user").map(m => m.content);
    const fullText = userMessages.join("\n");

    let content: any = {};
    let title = "";

    if (type === "shopping") {
      // Parse shopping items
      const items = extractShoppingItems(fullText);
      content = { items };
      title = `Shopping List - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    } else if (type === "moving") {
      // Parse moving items
      const items = extractMovingItems(fullText);
      content = { items };
      title = `Moving List - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    } else if (type === "email") {
      // Parse email draft
      const emailData = extractEmailDraft(fullText, aiResponse);
      content = emailData;
      title = `Email to ${emailData.recipient || "Unknown"} - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("saved_items")
      .insert({
        type,
        title,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving to Supabase:", error);
      return null;
    }

    return { id: data.id };
  } catch (error) {
    console.error("Error in saveConversation:", error);
    return null;
  }
}

function extractShoppingItems(text: string): Array<{ name: string; timing?: string }> {
  const items: Array<{ name: string; timing?: string }> = [];
  const lines = text.split(/[,\n]/).map(l => l.trim()).filter(l => l);
  
  for (const line of lines) {
    // Skip common conversation words
    if (/^(i need|i want|can you|please|could you|make|create|list)/i.test(line)) {
      continue;
    }
    
    // Extract item and timing
    const timingMatch = line.match(/\b(tomorrow|today|next week|this week)\b/i);
    const timing = timingMatch ? timingMatch[0].toLowerCase() : undefined;
    
    // Clean up the item name
    const name = line
      .replace(/\b(tomorrow|today|next week|this week)\b/gi, "")
      .replace(/\b(to buy|to get|need|want)\b/gi, "")
      .trim();
    
    if (name && name.length > 2) {
      items.push({ name, timing });
    }
  }
  
  return items;
}

function extractMovingItems(text: string): Array<{ item: string; recipient?: string; storage?: string; notes?: string }> {
  const items: Array<{ item: string; recipient?: string; storage?: string; notes?: string }> = [];
  
  // Simple extraction - can be enhanced later
  const lines = text.split(/[,\n]/).map(l => l.trim()).filter(l => l);
  
  for (const line of lines) {
    if (/^(i have|i want to|can you|please)/i.test(line)) {
      continue;
    }
    
    const recipientMatch = line.match(/\b(to|for|give to)\s+([A-Z][a-z]+)\b/);
    const recipient = recipientMatch ? recipientMatch[2] : undefined;
    
    const storageMatch = line.match(/\b(storage|garage|attic|basement)\b/i);
    const storage = storageMatch ? storageMatch[0] : undefined;
    
    const item = line
      .replace(/\b(to|for|give to)\s+[A-Z][a-z]+\b/g, "")
      .replace(/\b(storage|garage|attic|basement)\b/gi, "")
      .trim();
    
    if (item && item.length > 2) {
      items.push({ item, recipient, storage });
    }
  }
  
  return items;
}

function extractEmailDraft(userText: string, aiResponse: string): any {
  // Try to extract email from AI response first (it usually formats it nicely)
  const subjectMatch = aiResponse.match(/subject:\s*(.+)/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : "No subject";
  
  // Extract recipient from user text
  const recipientMatch = userText.match(/\b(to|email)\s+([A-Z][a-z]+)\b/);
  const recipient = recipientMatch ? recipientMatch[2] : "Unknown";
  
  // The body is usually the main part of the AI response
  const body = aiResponse
    .replace(/subject:\s*.+/i, "")
    .replace(/here'?s.+email.+:/i, "")
    .replace(/i'?ve drafted.+:/i, "")
    .trim();
  
  return {
    recipient,
    subject,
    body,
  };
}