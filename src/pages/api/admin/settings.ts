import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin, isUserAdmin, getSystemSettings, updateSystemSettings } from '@/lib/supabase-admin';

async function verifyAdminAuth(req: NextApiRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) return false;
    return await isUserAdmin(user.id);
  } catch {
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify admin authentication
  const isAdmin = await verifyAdminAuth(req);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (req.method === 'GET') {
    try {
      const settings = await getSystemSettings();
      
      // Don't expose full API keys in response
      if (settings?.openai_api_key) {
        settings.openai_api_key = settings.openai_api_key.slice(0, 20) + '...';
      }

      return res.status(200).json({ settings });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { settings } = req.body;
      const success = await updateSystemSettings(settings);
      
      if (!success) {
        throw new Error('Failed to update settings');
      }

      return res.status(200).json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}