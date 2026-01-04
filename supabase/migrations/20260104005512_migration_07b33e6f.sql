-- Add user_id column to saved_items if it doesn't exist
ALTER TABLE saved_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);