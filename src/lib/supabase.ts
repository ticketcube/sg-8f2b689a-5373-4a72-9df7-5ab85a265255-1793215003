import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface ConversationRecord {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  user_id?: string;
  metadata?: {
    model?: string;
    tokens?: number;
    sources?: string[];
  };
}