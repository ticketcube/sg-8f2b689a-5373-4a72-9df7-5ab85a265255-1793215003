-- Migration: Consolidate profiles → user_profiles
-- Make user_profiles the single source of truth for user data

-- Step 1: Ensure user_profiles has all necessary columns
-- Check if any columns exist in profiles but not in user_profiles
-- (Both tables currently have identical schema, so this should pass)

-- Step 2: Migrate data from profiles to user_profiles
-- Copy any users that exist in profiles but not in user_profiles
INSERT INTO user_profiles (user_id, email, full_name, role, is_admin, created_at, updated_at)
SELECT p.id, p.email, p.full_name, p.role, p.is_admin, p.created_at, p.updated_at
FROM profiles p
LEFT JOIN user_profiles up ON p.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Step 3: Verify data migration success
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM profiles p
  LEFT JOIN user_profiles up ON p.id = up.user_id
  WHERE up.user_id IS NULL;
  
  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Found % users in profiles not migrated to user_profiles. Migration failed.', missing_count;
  END IF;
END $$;

-- Step 4: Update foreign key constraints to reference user_profiles.user_id
-- Note: Tables currently reference profiles.id, need to change to user_profiles.user_id

-- games table
ALTER TABLE games 
  DROP CONSTRAINT IF EXISTS games_user_id_fkey;
ALTER TABLE games 
  ADD CONSTRAINT games_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- waitlist table
ALTER TABLE waitlist 
  DROP CONSTRAINT IF EXISTS waitlist_user_id_fkey;
ALTER TABLE waitlist 
  ADD CONSTRAINT waitlist_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- ticketcube_seats table
ALTER TABLE ticketcube_seats 
  DROP CONSTRAINT IF EXISTS ticketcube_seats_holder_id_fkey;
ALTER TABLE ticketcube_seats 
  ADD CONSTRAINT ticketcube_seats_holder_id_fkey 
  FOREIGN KEY (holder_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL;

-- seat_assignment_history table
ALTER TABLE seat_assignment_history 
  DROP CONSTRAINT IF EXISTS seat_assignment_history_new_holder_id_fkey;
ALTER TABLE seat_assignment_history 
  ADD CONSTRAINT seat_assignment_history_new_holder_id_fkey 
  FOREIGN KEY (new_holder_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL;

ALTER TABLE seat_assignment_history 
  DROP CONSTRAINT IF EXISTS seat_assignment_history_old_holder_id_fkey;
ALTER TABLE seat_assignment_history 
  ADD CONSTRAINT seat_assignment_history_old_holder_id_fkey 
  FOREIGN KEY (old_holder_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL;

-- minting_transactions (if they were updated to profiles, revert to user_profiles)
ALTER TABLE minting_transactions 
  DROP CONSTRAINT IF EXISTS minting_transactions_buyer_user_id_fkey;
ALTER TABLE minting_transactions 
  ADD CONSTRAINT minting_transactions_buyer_user_id_fkey 
  FOREIGN KEY (buyer_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

ALTER TABLE minting_transactions 
  DROP CONSTRAINT IF EXISTS minting_transactions_artist_user_id_fkey;
ALTER TABLE minting_transactions 
  ADD CONSTRAINT minting_transactions_artist_user_id_fkey 
  FOREIGN KEY (artist_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- cube_update_notifications
ALTER TABLE cube_update_notifications 
  DROP CONSTRAINT IF EXISTS cube_update_notifications_holder_user_id_fkey;
ALTER TABLE cube_update_notifications 
  ADD CONSTRAINT cube_update_notifications_holder_user_id_fkey 
  FOREIGN KEY (holder_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

ALTER TABLE cube_update_notifications 
  DROP CONSTRAINT IF EXISTS cube_update_notifications_artist_user_id_fkey;
ALTER TABLE cube_update_notifications 
  ADD CONSTRAINT cube_update_notifications_artist_user_id_fkey 
  FOREIGN KEY (artist_user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- tcube_transactions
ALTER TABLE tcube_transactions 
  DROP CONSTRAINT IF EXISTS tcube_transactions_user_id_fkey;
ALTER TABLE tcube_transactions 
  ADD CONSTRAINT tcube_transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- tcube_stakes
ALTER TABLE tcube_stakes 
  DROP CONSTRAINT IF EXISTS tcube_stakes_user_id_fkey;
ALTER TABLE tcube_stakes 
  ADD CONSTRAINT tcube_stakes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- tcube_rewards
ALTER TABLE tcube_rewards 
  DROP CONSTRAINT IF EXISTS tcube_rewards_user_id_fkey;
ALTER TABLE tcube_rewards 
  ADD CONSTRAINT tcube_rewards_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- cube_face_unlocks
ALTER TABLE cube_face_unlocks 
  DROP CONSTRAINT IF EXISTS cube_face_unlocks_user_id_fkey;
ALTER TABLE cube_face_unlocks 
  ADD CONSTRAINT cube_face_unlocks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- Step 5: Update RLS policies to reference user_profiles instead of profiles
-- This will be done on a per-table basis as needed

-- Step 6: Drop the profiles table
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 7: Add documentation comment
COMMENT ON TABLE user_profiles IS 'Primary user profiles table. Contains all user account information, roles, and settings. Used by both frontend UI and backend AI features.';