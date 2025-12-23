-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID,
  metadata JSONB,
  CONSTRAINT conversations_question_check CHECK (char_length(question) > 0),
  CONSTRAINT conversations_answer_check CHECK (char_length(answer) > 0)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations(user_id);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations for now" ON conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: Create a function to clean old conversations (keep last 100)
CREATE OR REPLACE FUNCTION cleanup_old_conversations()
RETURNS void AS $$
BEGIN
  DELETE FROM conversations
  WHERE id NOT IN (
    SELECT id FROM conversations
    ORDER BY created_at DESC
    LIMIT 100
  );
END;
$$ LANGUAGE plpgsql;