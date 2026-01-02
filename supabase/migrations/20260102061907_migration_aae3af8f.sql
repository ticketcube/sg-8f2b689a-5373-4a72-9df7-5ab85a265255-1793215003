-- First, delete conversations with null user_id (since we can't assign them to anyone)
DELETE FROM conversations WHERE user_id IS NULL;

-- Now enable RLS and drop old policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations for now" ON conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;

-- Make user_id NOT NULL
ALTER TABLE conversations ALTER COLUMN user_id SET NOT NULL;

-- Create proper RLS policies for authenticated users only
CREATE POLICY "Users can view their own conversations" 
ON conversations FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" 
ON conversations FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON conversations FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON conversations FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);