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
        // Check which tables exist - use correct primary key columns
        const tableChecks = [
          { name: 'conversations', pkColumn: 'id' },
          { name: 'system_settings', pkColumn: 'key' },
          { name: 'user_profiles', pkColumn: 'user_id' }
        ];
        const results: Record<string, boolean> = {};

        for (const table of tableChecks) {
          try {
            const { error } = await supabaseAdmin
              .from(table.name)
              .select(table.pkColumn)
              .limit(1);
            results[table.name] = !error;
          } catch {
            results[table.name] = false;
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

    if (test === 'brave-search') {
      try {
        const apiKey = process.env.BRAVE_SEARCH_API_KEY;
        
        if (!apiKey || apiKey === 'your_brave_api_key_here') {
          return res.status(200).json({
            success: false,
            error: 'Brave Search API key not configured',
            details: 'Set BRAVE_SEARCH_API_KEY in environment variables'
          });
        }

        // Test with a simple query
        const testQuery = 'test search';
        const braveResponse = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(testQuery)}&count=1`,
          {
            headers: {
              'Accept': 'application/json',
              'Accept-Encoding': 'gzip',
              'X-Subscription-Token': apiKey,
            },
          }
        );

        if (!braveResponse.ok) {
          const errorText = await braveResponse.text();
          return res.status(200).json({
            success: false,
            error: `Brave Search API returned ${braveResponse.status}`,
            details: errorText,
          });
        }

        const data = await braveResponse.json();
        const resultsCount = data.web?.results?.length || 0;

        return res.status(200).json({
          success: true,
          message: 'Brave Search API working',
          resultsCount,
          apiKeyPrefix: apiKey.substring(0, 8) + '...',
        });
      } catch (error: any) {
        return res.status(200).json({
          success: false,
          error: 'Brave Search API Error',
          details: error.message,
        });
      }
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}