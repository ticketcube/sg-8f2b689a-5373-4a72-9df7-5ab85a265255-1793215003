import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthenticatedUser } from "@/lib/supabase-server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { user, supabase } = await getAuthenticatedUser(req);
    const userId = user.id;

    switch (req.method) {
      case "GET": {
        // Get all conversations for the authenticated user
        const { data: conversations, error } = await supabase
          .from("conversations")
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) throw error;

        return res.status(200).json({ conversations: conversations || [] });
      }

      case "POST": {
        // Create a new conversation
        const { title, messages, type, status } = req.body;

        const { data: newConversation, error } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            title: title || "New Conversation",
            messages: messages || [],
            type: type || "general",
            status: status || "active",
          })
          .select()
          .single();

        if (error) throw error;

        return res.status(201).json({ conversation: newConversation });
      }

      case "PUT": {
        // Update an existing conversation
        const { id, title, messages, status } = req.body;

        if (!id) {
          return res.status(400).json({ error: "Conversation ID is required" });
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (messages !== undefined) updateData.messages = messages;
        if (status !== undefined) updateData.status = status;
        updateData.updated_at = new Date().toISOString();

        const { data: updatedConversation, error } = await supabase
          .from("conversations")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        return res.status(200).json({ conversation: updatedConversation });
      }

      case "DELETE": {
        // Delete a conversation
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "Conversation ID is required" });
        }

        const { error } = await supabase
          .from("conversations")
          .delete()
          .eq("id", id);

        if (error) throw error;

        return res.status(200).json({ message: "Conversation deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("API Error:", error);
    
    if (error.message === "No authorization header" || error.message === "Invalid or expired token") {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
}