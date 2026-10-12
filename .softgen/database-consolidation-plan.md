# Database Consolidation Plan: user_profiles → profiles

## Problem
The database has two nearly-identical user tables:
- `profiles` (used by frontend UI)
- `user_profiles` (used by AI backend)

This creates data inconsistency where UI updates don't reach the AI features.

## Solution: Consolidate to `profiles`

### Phase 1: Schema Analysis ✓
Both tables have identical columns. The only difference:
- `profiles.id` (PK)
- `user_profiles.user_id` (PK)

### Phase 2: Foreign Key Migration

Tables currently referencing `user_profiles.user_id`:
1. minting_transactions (buyer_user_id, artist_user_id)
2. cube_update_notifications (holder_user_id, artist_user_id)
3. tcube_transactions (user_id)
4. tcube_stakes (user_id)
5. tcube_rewards (user_id)
6. cube_face_unlocks (user_id)

RLS policies checking `user_profiles`:
- Multiple TicketCube-related policies checking role/is_admin via user_profiles
- Platform_config admin checks
- Stubhub mappings admin checks
- saved_items family sharing (avatar_url matching)
- conversations family sharing
- family_events family sharing

### Phase 3: Migration SQL

```sql
-- Step 1: Verify data consistency
-- Check if any users exist in user_profiles but not profiles
SELECT up.user_id, up.email, up.username
FROM user_profiles up
LEFT JOIN profiles p ON up.user_id = p.id
WHERE p.id IS NULL;

-- Step 2: Sync any missing data from user_profiles to profiles
INSERT INTO profiles (id, email, full_name, avatar_url, display_name, username, role, is_admin, 
  stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_price_id,
  subscription_started_at, subscription_ends_at, fandragon_id, has_used_trial, 
  sui_wallet_address, tcube_balance, created_at, updated_at)
SELECT user_id, email, display_name as full_name, avatar_url, display_name, username, role, is_admin,
  stripe_customer_id, stripe_subscription_id, stripe_subscription_status, stripe_price_id,
  subscription_started_at, subscription_ends_at, fandragon_id, has_used_trial,
  sui_wallet_address, tcube_balance, created_at, updated_at
FROM user_profiles
WHERE user_id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  username = EXCLUDED.username,
  role = EXCLUDED.role,
  is_admin = EXCLUDED.is_admin,
  updated_at = EXCLUDED.updated_at;

-- Step 3: Update RLS policies to reference profiles instead of user_profiles
-- This requires updating each policy that queries user_profiles

-- Example for cube_update_notifications:
DROP POLICY IF EXISTS "Artists can create notifications" ON cube_update_notifications;
CREATE POLICY "Artists can create notifications" ON cube_update_notifications
FOR INSERT
TO public
WITH CHECK (
  artist_user_id IN (
    SELECT id FROM profiles 
    WHERE id = uid() AND role = 'artist'
  )
);

-- Step 4: Drop foreign key constraints from user_profiles
ALTER TABLE minting_transactions DROP CONSTRAINT IF EXISTS minting_transactions_buyer_user_id_fkey;
ALTER TABLE minting_transactions DROP CONSTRAINT IF EXISTS minting_transactions_artist_user_id_fkey;
ALTER TABLE tcube_transactions DROP CONSTRAINT IF EXISTS tcube_transactions_user_id_fkey;
ALTER TABLE tcube_stakes DROP CONSTRAINT IF EXISTS tcube_stakes_user_id_fkey;
ALTER TABLE tcube_rewards DROP CONSTRAINT IF EXISTS tcube_rewards_user_id_fkey;
ALTER TABLE cube_face_unlocks DROP CONSTRAINT IF EXISTS cube_face_unlocks_user_id_fkey;

-- Step 5: Add foreign keys to profiles
-- (Note: These tables already reference the correct user IDs, just need new FK constraints)
ALTER TABLE minting_transactions 
  ADD CONSTRAINT minting_transactions_buyer_user_id_fkey 
  FOREIGN KEY (buyer_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE minting_transactions 
  ADD CONSTRAINT minting_transactions_artist_user_id_fkey 
  FOREIGN KEY (artist_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE tcube_transactions 
  ADD CONSTRAINT tcube_transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE tcube_stakes 
  ADD CONSTRAINT tcube_stakes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE tcube_rewards 
  ADD CONSTRAINT tcube_rewards_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE cube_face_unlocks 
  ADD CONSTRAINT cube_face_unlocks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 6: Drop user_profiles table
DROP TABLE user_profiles CASCADE;
```

### Phase 4: Code Updates Required

**Backend Files (Change `user_profiles` → `profiles`):**
1. `src/pages/api/smart-conversation.ts` - Query profiles instead
2. `src/pages/api/web-search.ts` - Query profiles instead  
3. `src/lib/supabase-admin.ts` - Query profiles instead

**Search/Replace Pattern:**
- `FROM user_profiles` → `FROM profiles`
- `.from('user_profiles')` → `.from('profiles')`
- `user_profiles up` → `profiles up`
- References to `up.user_id` → `up.id` (when joining/filtering)

### Phase 5: Verification

After migration:
1. Run `npm run build` - Should have no TypeScript errors
2. Test AI chat - Should still access user context correctly
3. Test user profile updates - Should reflect in AI responses
4. Test TicketCube features - Should still enforce role-based access
5. Run `check_for_errors` - Should show no database errors

### Phase 6: Regenerate Types
```bash
npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/database.types.ts
```

## Benefits
✅ Single source of truth for user data  
✅ AI features see real-time profile updates  
✅ Simpler data model (one less table)  
✅ Consistent foreign key references  
✅ Reduced RLS policy complexity