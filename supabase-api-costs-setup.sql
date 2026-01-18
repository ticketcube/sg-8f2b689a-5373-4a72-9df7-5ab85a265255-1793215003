-- API Usage Logs Table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  api_name TEXT NOT NULL, -- 'openai', 'brave_search', 'tts', 'supabase'
  endpoint TEXT, -- specific endpoint called (e.g., '/api/smart-conversation')
  model TEXT, -- for OpenAI: 'gpt-3.5-turbo', 'tts-1', etc.
  tokens_input INTEGER DEFAULT 0, -- input tokens (OpenAI)
  tokens_output INTEGER DEFAULT 0, -- output tokens (OpenAI)
  tokens_total INTEGER DEFAULT 0, -- total tokens
  api_calls INTEGER DEFAULT 1, -- number of API calls
  cost DECIMAL(10, 6) DEFAULT 0.00, -- calculated cost in USD
  request_data JSONB, -- optional: query, search terms, conversation_id, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_name ON api_usage_logs(api_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);

-- RLS Policies
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view their own API usage logs" 
  ON api_usage_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- Only system can insert logs (via service role)
CREATE POLICY "Service role can insert API usage logs" 
  ON api_usage_logs FOR INSERT 
  WITH CHECK (true);

-- Admins can view all logs
CREATE POLICY "Admins can view all API usage logs" 
  ON api_usage_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Search Cache Table
CREATE TABLE IF NOT EXISTS search_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  results JSONB NOT NULL, -- array of search results
  hit_count INTEGER DEFAULT 1, -- track how many times this cached result was used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_search_cache_query ON search_cache(query);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires_at ON search_cache(expires_at);

-- RLS Policies for search cache
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read cache (shared across users)
CREATE POLICY "Authenticated users can read search cache" 
  ON search_cache FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Only system can insert/update cache (via service role)
CREATE POLICY "Service role can manage search cache" 
  ON search_cache FOR ALL 
  USING (true);

-- Function to clean up expired cache entries (optional - can be called via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_search_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM search_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE api_usage_logs IS 'Tracks API calls and costs across all services';
COMMENT ON TABLE search_cache IS 'Caches web search results for 7 days to minimize API calls';