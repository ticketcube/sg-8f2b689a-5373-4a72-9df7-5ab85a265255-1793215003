import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest } from "next";

/**
 * Creates an authenticated Supabase client using the user's token from the request
 * This ensures RLS policies work correctly and users can only access their own data
 */
export function getAuthenticatedSupabaseClient(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No authorization header");
  }

  const token = authHeader.split(" ")[1];

  // Create client with user's token - this makes auth.uid() work in RLS policies
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  return { supabase, token };
}

/**
 * Verifies the user's token and returns the authenticated user
 */
export async function getAuthenticatedUser(req: NextApiRequest) {
  const { supabase, token } = getAuthenticatedSupabaseClient(req);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error("Invalid or expired token");
  }
  
  return { user, supabase };
}