-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('shopping', 'moving', 'email', 'general')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'saved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);

-- Add RLS policies (adjust based on your auth setup)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later with auth)
CREATE POLICY "Allow all operations on conversations" ON conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);