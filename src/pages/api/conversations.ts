import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import type { Conversation } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user session from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized - No session token" });
  }

  const token = authHeader.replace("Bearer ", "");
  
  // Verify the session token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: "Unauthorized - Invalid session" });
  }

  const userId = user.id;

  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const conversations = (data || []).map((conv: any) => ({
        ...conv,
        messages: Array.isArray(conv.messages) ? conv.messages : [],
      }));

      return res.status(200).json({ conversations });
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { title, messages, type, status } = req.body;

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          title,
          messages,
          type,
          status: status || "active",
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ conversation: data });
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const { id, title, messages, status } = req.body;

      const { data, error } = await supabase
        .from("conversations")
        .update({
          title,
          messages,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId) // Ensure user owns this conversation
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ conversation: data });
    } catch (error: any) {
      console.error("Error updating conversation:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id)
        .eq("user_id", userId); // Ensure user owns this conversation

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}