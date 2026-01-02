import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import cookie from "cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify FanDragon authentication
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.fandragon_token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Verify token with FanDragon and get user info
  let userId: string;
  try {
    const userResponse = await fetch(
      "https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!userResponse.ok) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await userResponse.json();
    userId = user.sub;
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }

  if (req.method === "GET") {
    try {
      const { conversation_id } = req.query;

      if (!conversation_id || typeof conversation_id !== "string") {
        return res.status(400).json({ error: "Conversation ID is required" });
      }

      const { data, error } = await supabase
        .from("saved_items")
        .select("*")
        .eq("conversation_id", conversation_id)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { conversation_id, item_text, item_type } = req.body;

      const { data, error } = await supabase
        .from("saved_items")
        .insert({
          conversation_id,
          item_text,
          item_type,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { id } = req.body;

      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}