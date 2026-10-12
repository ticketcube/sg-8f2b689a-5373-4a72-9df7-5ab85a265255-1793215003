-- Step 1: Add missing columns from user_profiles to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'fan',
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_status text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS subscription_started_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS subscription_ends_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS fandragon_id text,
  ADD COLUMN IF NOT EXISTS has_used_trial boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS sui_wallet_address text,
  ADD COLUMN IF NOT EXISTS tcube_balance numeric DEFAULT 0;

-- Add constraint conditionally
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_stripe_subscription_status_check'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_stripe_subscription_status_check 
        CHECK (stripe_subscription_status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid'));
  END IF;
END $$;

-- Create indexes matching user_profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(stripe_subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_sui_wallet ON profiles(sui_wallet_address);

-- Step 2: Migrate data from user_profiles to profiles
UPDATE profiles p
SET 
  username = up.username,
  email = COALESCE(p.email, up.email),
  display_name = COALESCE(p.display_name, up.display_name),
  avatar_url = COALESCE(p.avatar_url, up.avatar_url),
  role = up.role,
  is_admin = up.is_admin,
  stripe_customer_id = up.stripe_customer_id,
  stripe_subscription_id = up.stripe_subscription_id,
  stripe_subscription_status = up.stripe_subscription_status,
  stripe_price_id = up.stripe_price_id,
  subscription_started_at = up.subscription_started_at,
  subscription_ends_at = up.subscription_ends_at,
  fandragon_id = up.fandragon_id,
  has_used_trial = up.has_used_trial,
  sui_wallet_address = up.sui_wallet_address,
  tcube_balance = up.tcube_balance,
  updated_at = now()
FROM user_profiles up
WHERE p.id = up.user_id;

-- Add unique constraint conditionally
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;