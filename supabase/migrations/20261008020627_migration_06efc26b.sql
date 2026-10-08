-- Step 1: Update family_events RLS policies for family sharing
DROP POLICY IF EXISTS "family_members_view_all_events" ON family_events;
DROP POLICY IF EXISTS "family_members_can_create_events" ON family_events;
DROP POLICY IF EXISTS "users_update_own_events" ON family_events;
DROP POLICY IF EXISTS "users_delete_own_events" ON family_events;

-- New family-based policies using avatar_url as family identifier
CREATE POLICY "family_view_shared_events" ON family_events
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON up1.avatar_url = up2.avatar_url
      WHERE up1.user_id = auth.uid()
      AND up2.user_id = family_events.user_id
      AND up1.avatar_url IS NOT NULL
      AND up2.avatar_url IS NOT NULL
    )
  );

CREATE POLICY "family_create_events" ON family_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "family_update_shared_events" ON family_events
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON up1.avatar_url = up2.avatar_url
      WHERE up1.user_id = auth.uid()
      AND up2.user_id = family_events.user_id
      AND up1.avatar_url IS NOT NULL
      AND up2.avatar_url IS NOT NULL
    )
  );

CREATE POLICY "family_delete_shared_events" ON family_events
  FOR DELETE USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON up1.avatar_url = up2.avatar_url
      WHERE up1.user_id = auth.uid()
      AND up2.user_id = family_events.user_id
      AND up1.avatar_url IS NOT NULL
      AND up2.avatar_url IS NOT NULL
    )
  );

-- Step 2: Fix saved_items to be strictly private
DROP POLICY IF EXISTS "Allow all operations on saved_items" ON saved_items;

-- Ensure only authenticated users policies remain
-- These should already exist, but create if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_items' 
    AND policyname = 'authenticated_users_select'
  ) THEN
    CREATE POLICY "authenticated_users_select" ON saved_items
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_items' 
    AND policyname = 'authenticated_users_insert'
  ) THEN
    CREATE POLICY "authenticated_users_insert" ON saved_items
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_items' 
    AND policyname = 'authenticated_users_update'
  ) THEN
    CREATE POLICY "authenticated_users_update" ON saved_items
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_items' 
    AND policyname = 'authenticated_users_delete'
  ) THEN
    CREATE POLICY "authenticated_users_delete" ON saved_items
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;