-- Migration: Drop user_profiles table after consolidation to profiles
-- All application code now uses profiles table exclusively

-- Step 1: Verify no data loss - check for users in user_profiles but not in profiles
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM user_profiles up
  LEFT JOIN profiles p ON up.user_id = p.id
  WHERE p.id IS NULL;
  
  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Found % users in user_profiles not in profiles. Run data migration first.', missing_count;
  END IF;
END $$;

-- Step 2: Update foreign key constraints to reference profiles instead of user_profiles
-- Note: Only update if the constraint exists and references user_profiles

-- minting_transactions
ALTER TABLE minting_transactions 
  DROP CONSTRAINT IF EXISTS minting_transactions_buyer_user_id_fkey;
ALTER TABLE minting_transactions 
  ADD CONSTRAINT minting_transactions_buyer_user_id_fkey 
  FOREIGN KEY (buyer_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE minting_transactions 
  DROP CONSTRAINT IF EXISTS minting_transactions_artist_user_id_fkey;
ALTER TABLE minting_transactions 
  ADD CONSTRAINT minting_transactions_artist_user_id_fkey 
  FOREIGN KEY (artist_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- cube_update_notifications
ALTER TABLE cube_update_notifications 
  DROP CONSTRAINT IF EXISTS cube_update_notifications_holder_user_id_fkey;
ALTER TABLE cube_update_notifications 
  ADD CONSTRAINT cube_update_notifications_holder_user_id_fkey 
  FOREIGN KEY (holder_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE cube_update_notifications 
  DROP CONSTRAINT IF EXISTS cube_update_notifications_artist_user_id_fkey;
ALTER TABLE cube_update_notifications 
  ADD CONSTRAINT cube_update_notifications_artist_user_id_fkey 
  FOREIGN KEY (artist_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- tcube_transactions
ALTER TABLE tcube_transactions 
  DROP CONSTRAINT IF EXISTS tcube_transactions_user_id_fkey;
ALTER TABLE tcube_transactions 
  ADD CONSTRAINT tcube_transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- tcube_stakes
ALTER TABLE tcube_stakes 
  DROP CONSTRAINT IF EXISTS tcube_stakes_user_id_fkey;
ALTER TABLE tcube_stakes 
  ADD CONSTRAINT tcube_stakes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- tcube_rewards
ALTER TABLE tcube_rewards 
  DROP CONSTRAINT IF EXISTS tcube_rewards_user_id_fkey;
ALTER TABLE tcube_rewards 
  ADD CONSTRAINT tcube_rewards_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- cube_face_unlocks
ALTER TABLE cube_face_unlocks 
  DROP CONSTRAINT IF EXISTS cube_face_unlocks_user_id_fkey;
ALTER TABLE cube_face_unlocks 
  ADD CONSTRAINT cube_face_unlocks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 3: Update RLS policies that reference user_profiles
-- Replace any policies that query user_profiles with profiles

-- Note: This is a template - actual policies will vary by table
-- Example pattern for updating policies:
-- DROP POLICY IF EXISTS "policy_name" ON table_name;
-- CREATE POLICY "policy_name" ON table_name
-- USING (user_id IN (SELECT id FROM profiles WHERE id = auth.uid() AND role = 'desired_role'));

-- Step 4: Drop the user_profiles table
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 5: Add comment for documentation
COMMENT ON TABLE profiles IS 'Consolidated user profiles table. Previously split between profiles (frontend) and user_profiles (backend). All code now uses this single table.';