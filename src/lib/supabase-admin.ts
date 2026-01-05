import { createClient } from '@supabase/supabase-js';

// Admin client with service role for elevated permissions
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Regular client for auth
export const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SystemSettings {
  id: string;
  openai_api_key: string;
  openai_model: string;
  system_prompt: string;
  enable_ai: boolean;
  max_conversation_length: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    return data?.is_admin === true;
  } catch (error) {
    console.error('Exception checking admin status:', error);
    return false;
  }
}

// Get system settings
export async function getSystemSettings(): Promise<SystemSettings | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

// Update system settings
export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString()
      });

    return !error;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
}