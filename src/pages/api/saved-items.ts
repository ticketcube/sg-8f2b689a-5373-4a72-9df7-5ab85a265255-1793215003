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
        // Get all saved items for the authenticated user
        const { type } = req.query;

        let query = supabase
          .from("saved_items")
          .select("*")
          .order("updated_at", { ascending: false });

        if (type && typeof type === "string") {
          query = query.eq("type", type);
        }

        const { data: items, error } = await query;

        if (error) throw error;

        return res.status(200).json({ items: items || [] });
      }

      case "POST": {
        // Create a new saved item
        const { type, title, content, metadata } = req.body;

        if (!type || !content) {
          return res.status(400).json({ error: "Type and content are required" });
        }

        const { data: newItem, error } = await supabase
          .from("saved_items")
          .insert({
            user_id: userId,
            type,
            title: title || `New ${type}`,
            content,
            metadata: metadata || null,
          })
          .select()
          .single();

        if (error) throw error;

        return res.status(201).json({ item: newItem });
      }

      case "PUT": {
        // Update an existing saved item
        const { id, title, content, metadata } = req.body;

        if (!id) {
          return res.status(400).json({ error: "Item ID is required" });
        }

        const updateData: any = { updated_at: new Date().toISOString() };
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (metadata !== undefined) updateData.metadata = metadata;

        const { data: updatedItem, error } = await supabase
          .from("saved_items")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        return res.status(200).json({ item: updatedItem });
      }

      case "DELETE": {
        // Delete a saved item
        const { id } = req.query;

        if (!id || typeof id !== "string") {
          return res.status(400).json({ error: "Item ID is required" });
        }

        const { error } = await supabase
          .from("saved_items")
          .delete()
          .eq("id", id);

        if (error) throw error;

        return res.status(200).json({ message: "Item deleted successfully" });
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