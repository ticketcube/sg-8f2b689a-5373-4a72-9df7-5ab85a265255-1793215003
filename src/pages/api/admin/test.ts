import type { NextApiRequest, NextApiResponse } from 'next';
import { isUserAdmin, supabaseAdmin } from '@/lib/supabase-admin';
import OpenAI from 'openai';

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

  if (req.method === 'POST') {
    const { test } = req.body;

    if (test === 'openai') {
      try {
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey || !apiKey.startsWith('sk-')) {
          return res.status(200).json({
            success: false,
            error: 'OpenAI API key not configured or invalid format',
            details: 'Key should start with sk-'
          });
        }

        const openai = new OpenAI({ apiKey });
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: 'Say "test successful" if you can read this.' }
          ],
          max_tokens: 20,
        });

        return res.status(200).json({
          success: true,
          response: completion.choices[0].message.content,
          model: completion.model,
        });
      } catch (error: any) {
        return res.status(200).json({
          success: false,
          error: 'OpenAI API Error',
          details: error.message,
        });
      }
    }

    if (test === 'supabase') {
      try {
        // Test connection by querying a table
        const { data, error } = await supabaseAdmin
          .from('conversations')
          .select('id')
          .limit(1);

        if (error) throw error;

        return res.status(200).json({
          success: true,
          message: 'Supabase connection successful',
          recordCount: data?.length || 0,
        });
      } catch (error: any) {
        return res.status(200).json({
          success: false,
          error: 'Supabase Error',
          details: error.message,
        });
      }
    }

    if (test === 'database-tables') {
      try {
        // Check which tables exist
        const tables = ['conversations', 'system_settings', 'user_profiles'];
        const results: Record<string, boolean> = {};

        for (const table of tables) {
          try {
            const { error } = await supabaseAdmin
              .from(table)
              .select('id')
              .limit(1);
            results[table] = !error;
          } catch {
            results[table] = false;
          }
        }

        return res.status(200).json({
          success: true,
          tables: results,
        });
      } catch (error: any) {
        return res.status(200).json({
          success: false,
          error: error.message,
        });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}