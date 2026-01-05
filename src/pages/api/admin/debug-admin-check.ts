import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: 'userId query parameter required' });
  }

  try {
    // Direct database query to check admin status
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return res.status(200).json({
      userId,
      found: !!data,
      data: data,
      error: error,
      isAdmin: data?.is_admin === true,
      isAdminType: typeof data?.is_admin,
      isAdminValue: data?.is_admin,
      serviceRoleKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    });
  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
}