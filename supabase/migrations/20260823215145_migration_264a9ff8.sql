CREATE TABLE IF NOT EXISTS mind_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON mind_maps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON mind_maps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON mind_maps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own" ON mind_maps FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mind_maps_user_id ON mind_maps(user_id);
CREATE INDEX IF NOT EXISTS idx_mind_maps_updated_at ON mind_maps(updated_at DESC);