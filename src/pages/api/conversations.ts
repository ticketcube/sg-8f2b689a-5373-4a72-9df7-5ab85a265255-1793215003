import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return res.status(200).json({ conversations: data || [] });
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
          title,
          messages,
          type: type || "general",
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

      const updates: any = { updated_at: new Date().toISOString() };
      if (title !== undefined) updates.title = title;
      if (messages !== undefined) updates.messages = messages;
      if (status !== undefined) updates.status = status;

      const { data, error } = await supabase
        .from("conversations")
        .update(updates)
        .eq("id", id)
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
        .eq("id", id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}