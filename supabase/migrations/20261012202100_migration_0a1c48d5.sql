-- Migration: Consolidate profiles → user_profiles
-- Make user_profiles the single source of truth for user data

-- Step 1: Add missing columns to user_profiles if they don't exist
-- profiles has 'full_name' which user_profiles doesn't have
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Step 2: Migrate data from profiles to user_profiles
-- Copy any users that exist in profiles but not in user_profiles
INSERT INTO user_profiles (user_id, username, email, display_name, full_name, avatar_url, role, is_admin, created_at, updated_at, stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_price_id, subscription_started_at, subscription_ends_at, fandragon_id, has_used_trial, sui_wallet_address, tcube_balance)
SELECT 
  p.id, 
  COALESCE(p.username, 'user_' || substr(p.id::text, 1, 8)),
  p.email, 
  p.display_name,
  p.full_name,
  p.avatar_url, 
  p.role, 
  p.is_admin, 
  p.created_at, 
  p.updated_at,
  p.stripe_customer_id,
  p.stripe_subscription_id,
  p.stripe_subscription_status,
  p.stripe_price_id,
  p.subscription_started_at,
  p.subscription_ends_at,
  p.fandragon_id,
  p.has_used_trial,
  p.sui_wallet_address,
  p.tcube_balance
FROM profiles p
LEFT JOIN user_profiles up ON p.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  display_name = EXCLUDED.display_name,
  avatar_url = EXCLUDED.avatar_url,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin;

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

-- games table
ALTER TABLE games 
  DROP CONSTRAINT IF EXISTS games_user_id_fkey;
ALTER TABLE games 
  ADD CONSTRAINT games_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE SET NULL;

-- waitlist table  
ALTER TABLE waitlist 
  DROP CONSTRAINT IF EXISTS waitlist_user_id_fkey;
ALTER TABLE waitlist 
  DROP CONSTRAINT IF EXISTS waitlist_profile_fk;
ALTER TABLE waitlist 
  ADD CONSTRAINT waitlist_user_id_fkey 
  FOREIGN KEY (id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- ticketcube_seats table
ALTER TABLE ticketcube_seats 
  DROP CONSTRAINT IF EXISTS ticketcube_seats_assigned_by_fkey;
ALTER TABLE ticketcube_seats 
  ADD CONSTRAINT ticketcube_seats_assigned_by_fkey 
  FOREIGN KEY (assigned_by) REFERENCES user_profiles(user_id);

-- seat_assignment_history table
ALTER TABLE seat_assignment_history 
  DROP CONSTRAINT IF EXISTS seat_assignment_history_assigned_by_fkey;
ALTER TABLE seat_assignment_history 
  ADD CONSTRAINT seat_assignment_history_assigned_by_fkey 
  FOREIGN KEY (assigned_by) REFERENCES user_profiles(user_id);

-- minting_transactions (already reference user_profiles, but ensure they're correct)
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

-- Step 5: Drop the profiles table
DROP TABLE IF EXISTS profiles CASCADE;

-- Step 6: Add documentation comment
COMMENT ON TABLE user_profiles IS 'Primary user profiles table. Contains all user account information, roles, and settings. Used by both frontend UI and backend AI features. Consolidated from the old profiles table.';