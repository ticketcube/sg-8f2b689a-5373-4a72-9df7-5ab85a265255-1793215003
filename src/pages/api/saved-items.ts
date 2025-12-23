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
    // Get all saved items
    try {
      const { data, error } = await supabase
        .from("saved_items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      return res.status(200).json({ items: data || [] });
    } catch (error: any) {
      console.error("Error fetching saved items:", error);
      return res.status(500).json({ error: "Failed to fetch saved items" });
    }
  } else if (req.method === "DELETE") {
    // Delete a saved item
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Item ID is required" });
    }

    try {
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Error deleting saved item:", error);
      return res.status(500).json({ error: "Failed to delete item" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}