-- Add user_id column to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Update RLS policies to be user-specific
DROP POLICY IF EXISTS "Allow all operations for now" ON conversations;

-- Enable RLS if not already enabled
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can only view their own conversations
CREATE POLICY "Users can view own conversations" 
ON conversations FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own conversations
CREATE POLICY "Users can insert own conversations" 
ON conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations" 
ON conversations FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations" 
ON conversations FOR DELETE 
USING (auth.uid() = user_id);