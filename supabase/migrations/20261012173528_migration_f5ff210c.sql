-- Fix search_cache RLS policies to work with service role on production
DROP POLICY IF EXISTS "Public can manage search cache" ON search_cache;
DROP POLICY IF EXISTS "Service role can manage search cache" ON search_cache;
DROP POLICY IF EXISTS "Users can insert their own search cache" ON search_cache;
DROP POLICY IF EXISTS "Users can view their own search cache" ON search_cache;

-- Service role needs full access for caching
CREATE POLICY "service_role_full_access" ON search_cache
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read all cache (for web search results)
CREATE POLICY "authenticated_read_cache" ON search_cache
  FOR SELECT TO authenticated
  USING (true);

-- Add rakov family policies to conversations (avatar_url matching)
CREATE POLICY "family_view_shared_conversations" ON conversations
  FOR SELECT TO public
  USING (
    (auth.uid() IS NOT NULL) AND 
    (EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON (up1.avatar_url = up2.avatar_url)
      WHERE up1.user_id = auth.uid() 
        AND up2.user_id = conversations.user_id
        AND up1.avatar_url IS NOT NULL
        AND up2.avatar_url IS NOT NULL
    ))
  );

CREATE POLICY "family_manage_shared_conversations" ON conversations
  FOR ALL TO public
  USING (
    (auth.uid() IS NOT NULL) AND 
    (EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON (up1.avatar_url = up2.avatar_url)
      WHERE up1.user_id = auth.uid() 
        AND up2.user_id = conversations.user_id
        AND up1.avatar_url IS NOT NULL
        AND up2.avatar_url IS NOT NULL
    ))
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL) AND 
    (EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON (up1.avatar_url = up2.avatar_url)
      WHERE up1.user_id = auth.uid() 
        AND up2.user_id = conversations.user_id
        AND up1.avatar_url IS NOT NULL
        AND up2.avatar_url IS NOT NULL
    ))
  );

-- Add rakov family policies to saved_items (shopping lists, inventory)
CREATE POLICY "family_view_shared_items" ON saved_items
  FOR SELECT TO public
  USING (
    (auth.uid() IS NOT NULL) AND 
    (EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON (up1.avatar_url = up2.avatar_url)
      WHERE up1.user_id = auth.uid() 
        AND up2.user_id = saved_items.user_id
        AND up1.avatar_url IS NOT NULL
        AND up2.avatar_url IS NOT NULL
    ))
  );

CREATE POLICY "family_manage_shared_items" ON saved_items
  FOR ALL TO public
  USING (
    (auth.uid() IS NOT NULL) AND 
    (EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON (up1.avatar_url = up2.avatar_url)
      WHERE up1.user_id = auth.uid() 
        AND up2.user_id = saved_items.user_id
        AND up1.avatar_url IS NOT NULL
        AND up2.avatar_url IS NOT NULL
    ))
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL) AND 
    (EXISTS (
      SELECT 1 FROM user_profiles up1
      JOIN user_profiles up2 ON (up1.avatar_url = up2.avatar_url)
      WHERE up1.user_id = auth.uid() 
        AND up2.user_id = saved_items.user_id
        AND up1.avatar_url IS NOT NULL
        AND up2.avatar_url IS NOT NULL
    ))
  );