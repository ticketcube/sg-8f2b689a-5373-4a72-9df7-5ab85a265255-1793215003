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
        console.log('🔐 ADMIN_LOGIN: Starting login for email:', email);
        
        // Step 1: Authenticate with regular client
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.log('🔴 ADMIN_LOGIN: Auth failed:', error.message);
          throw error;
        }

        console.log('✅ ADMIN_LOGIN: Auth successful for user_id:', data.user.id);

        // Step 2: Check if user is admin using service role client
        console.log('🔍 ADMIN_LOGIN: Checking admin status for user_id:', data.user.id);
        const isAdmin = await isUserAdmin(data.user.id);
        console.log('🔍 ADMIN_LOGIN: isUserAdmin returned:', isAdmin);
        
        if (!isAdmin) {
          console.log('🔴 ADMIN_LOGIN: User is NOT admin, rejecting access');
          // Sign out the session since they're not admin
          await supabase.auth.signOut();
          return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        console.log('✅ ADMIN_LOGIN: User IS admin, granting access');
        // Step 3: Return session for admin user
        return res.status(200).json({
          user: data.user,
          session: data.session,
        });
      } catch (error: any) {
        console.log('🔴 ADMIN_LOGIN: Unexpected error:', error);
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
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ authenticated: false });
        }

        const token = authHeader.replace('Bearer ', '');
        
        // Verify the token with Supabase
        const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
        
        if (error || !user) {
          return res.status(401).json({ authenticated: false });
        }

        const isAdmin = await isUserAdmin(user.id);
        
        return res.status(200).json({
          authenticated: true,
          isAdmin,
          user,
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}