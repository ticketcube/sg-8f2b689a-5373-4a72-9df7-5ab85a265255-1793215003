import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, isUserAdmin } from '@/lib/supabase-admin';
import { createClient } from '@supabase/supabase-js';

// Create a regular auth client for password sign-in
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { action, email, password } = req.body;

    if (action === 'login') {
      try {
        // Step 1: Authenticate with regular client (anon key supports password auth)
        const { data, error } = await supabaseAuth.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Step 2: Check if user is admin using service role client
        const isAdmin = await isUserAdmin(data.user.id);
        
        if (!isAdmin) {
          // Sign out the session since they're not admin
          await supabaseAuth.auth.signOut();
          return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        // Step 3: Return session for admin user
        return res.status(200).json({
          user: data.user,
          session: data.session,
        });
      } catch (error: any) {
        return res.status(401).json({ error: error.message });
      }
    }

    if (action === 'logout') {
      try {
        await supabaseAuth.auth.signOut();
        return res.status(200).json({ success: true });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }

    if (action === 'check') {
      try {
        const { data: { session } } = await supabaseAuth.auth.getSession();
        
        if (!session) {
          return res.status(401).json({ authenticated: false });
        }

        const isAdmin = await isUserAdmin(session.user.id);
        
        return res.status(200).json({
          authenticated: true,
          isAdmin,
          user: session.user,
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}