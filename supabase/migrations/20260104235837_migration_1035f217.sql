-- Add metadata column to saved_items table
ALTER TABLE saved_items ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT NULL;

-- Add index for efficient conversation_id lookups
CREATE INDEX IF NOT EXISTS idx_saved_items_metadata_conversation_id 
ON saved_items ((metadata->>'conversation_id'));