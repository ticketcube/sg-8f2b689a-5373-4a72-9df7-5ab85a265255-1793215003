import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(401).json({ 
        authenticated: false,
        error: 'No access token provided' 
      });
    }

    // Check session with FanDragon Supabase
    const response = await fetch(
      'https://agyoehyzvergiiwdbzmz.supabase.co/auth/v1/user',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'apikey': process.env.FANDRAGON_SUPABASE_ANON_KEY || '',
        },
      }
    );

    if (!response.ok) {
      return res.status(401).json({ 
        authenticated: false,
        error: 'Invalid session' 
      });
    }

    const userData = await response.json();

    return res.status(200).json({
      authenticated: true,
      user: userData,
    });
  } catch (error: any) {
    console.error('Session check error:', error);
    return res.status(500).json({ 
      authenticated: false,
      error: 'Failed to verify session',
      details: error.message 
    });
  }
}