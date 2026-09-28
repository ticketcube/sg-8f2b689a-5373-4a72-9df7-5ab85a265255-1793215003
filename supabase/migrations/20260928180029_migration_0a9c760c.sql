-- Create family_events table for shared calendar
CREATE TABLE IF NOT EXISTS family_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('reminder', 'milestone', 'event', 'birthday', 'appointment', 'other')),
  all_day boolean DEFAULT true,
  event_time time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view all family events (family-wide visibility)
CREATE POLICY "family_members_view_all_events"
  ON family_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own events
CREATE POLICY "users_insert_own_events"
  ON family_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "users_update_own_events"
  ON family_events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "users_delete_own_events"
  ON family_events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_family_events_user_id ON family_events(user_id);
CREATE INDEX idx_family_events_event_date ON family_events(event_date DESC);
CREATE INDEX idx_family_events_event_type ON family_events(event_type);