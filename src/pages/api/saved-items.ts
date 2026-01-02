import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

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
        .from("saved_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({ items: data || [] });
    } catch (error: any) {
      console.error("Error fetching saved items:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { type, title, content } = req.body;

      const { data, error } = await supabase
        .from("saved_items")
        .insert({
          user_id: userId,
          type,
          title,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ item: data });
    } catch (error: any) {
      console.error("Error creating saved item:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("id", id)
        .eq("user_id", userId); // Ensure user owns this item

      if (error) throw error;

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error deleting saved item:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}