-- Live Event Market Calculator Schema
-- Created: 2026-09-09
-- Purpose: Support event marketing decision engine with ticket economics, media planning, and recommendations

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Event Details
  event_name TEXT NOT NULL,
  artist_production TEXT NOT NULL,
  market_city TEXT NOT NULL,
  venue TEXT NOT NULL,
  event_date DATE NOT NULL,
  
  -- Venue & Ticket Economics
  venue_capacity INTEGER NOT NULL CHECK (venue_capacity > 0),
  target_sellthrough_pct DECIMAL(5,2) NOT NULL DEFAULT 90.00 CHECK (target_sellthrough_pct >= 0 AND target_sellthrough_pct <= 100),
  current_tickets_sold INTEGER NOT NULL DEFAULT 0 CHECK (current_tickets_sold >= 0),
  
  -- Pricing
  avg_ticket_price DECIMAL(10,2) NOT NULL CHECK (avg_ticket_price > 0),
  premium_ticket_pct DECIMAL(5,2) NOT NULL DEFAULT 20.00 CHECK (premium_ticket_pct >= 0 AND premium_ticket_pct <= 100),
  premium_ticket_price DECIMAL(10,2) NOT NULL CHECK (premium_ticket_price >= 0),
  standard_ticket_price DECIMAL(10,2) NOT NULL CHECK (standard_ticket_price >= 0),
  
  -- Revenue
  current_gross_revenue DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (current_gross_revenue >= 0),
  target_gross_revenue DECIMAL(12,2) NOT NULL CHECK (target_gross_revenue >= 0),
  
  -- Sales Pacing
  days_to_event INTEGER CHECK (days_to_event >= 0),
  expected_organic_sales_per_day INTEGER DEFAULT 0 CHECK (expected_organic_sales_per_day >= 0),
  historical_sellthrough_pct DECIMAL(5,2) CHECK (historical_sellthrough_pct >= 0 AND historical_sellthrough_pct <= 100),
  pacing_status TEXT CHECK (pacing_status IN ('ahead', 'on_pace', 'slightly_behind', 'significantly_behind')),
  
  -- Settings
  learning_mode BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_event_date ON events(event_date DESC);
CREATE INDEX idx_events_created_at ON events(created_at DESC);

-- ============================================
-- MEDIA CHANNELS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS media_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Channel Type (8 paid + CRM)
  channel_type TEXT NOT NULL CHECK (channel_type IN (
    'tv_ctv',
    'radio_audio',
    'ooh',
    'paid_social',
    'paid_search',
    'display_programmatic',
    'youtube_video',
    'retargeting',
    'crm_email'
  )),
  
  -- Budget
  budget DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (budget >= 0),
  
  -- Metrics (varies by channel type)
  cpm DECIMAL(10,2) CHECK (cpm >= 0),
  cpc DECIMAL(10,2) CHECK (cpc >= 0),
  ctr DECIMAL(5,4) CHECK (ctr >= 0 AND ctr <= 1),
  conversion_rate DECIMAL(5,4) NOT NULL DEFAULT 0.01 CHECK (conversion_rate >= 0 AND conversion_rate <= 1),
  
  -- Incrementality
  incrementality_factor DECIMAL(4,3) DEFAULT 1.00 CHECK (incrementality_factor >= 0 AND incrementality_factor <= 1),
  
  -- CRM-specific fields
  audience_size INTEGER CHECK (audience_size >= 0),
  open_rate DECIMAL(5,4) CHECK (open_rate >= 0 AND open_rate <= 1),
  click_rate DECIMAL(5,4) CHECK (click_rate >= 0 AND click_rate <= 1),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, channel_type)
);

-- Indexes
CREATE INDEX idx_media_channels_event_id ON media_channels(event_id);
CREATE INDEX idx_media_channels_channel_type ON media_channels(channel_type);

-- ============================================
-- SCENARIOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  scenario_name TEXT NOT NULL CHECK (scenario_name IN (
    'base',
    'upside',
    'downside',
    'aggressive_marketing',
    'low_media'
  )),
  
  -- Multipliers
  conversion_multiplier DECIMAL(5,3) NOT NULL DEFAULT 1.00 CHECK (conversion_multiplier > 0),
  demand_multiplier DECIMAL(5,3) NOT NULL DEFAULT 1.00 CHECK (demand_multiplier > 0),
  budget_multiplier DECIMAL(5,3) NOT NULL DEFAULT 1.00 CHECK (budget_multiplier > 0),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, scenario_name)
);

-- Indexes
CREATE INDEX idx_scenarios_event_id ON scenarios(event_id);

-- ============================================
-- MARKET DIAGNOSTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS market_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  diagnostic_type TEXT NOT NULL CHECK (diagnostic_type IN (
    'low_awareness',
    'low_traffic',
    'low_conversion',
    'wrong_audience',
    'pricing',
    'inventory',
    'competitive',
    'weak_creative',
    'insufficient_media',
    'unknown'
  )),
  
  notes TEXT,
  recommended_action TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_market_diagnostics_event_id ON market_diagnostics(event_id);
CREATE INDEX idx_market_diagnostics_type ON market_diagnostics(diagnostic_type);

-- ============================================
-- BENCHMARKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Benchmark Context
  event_type TEXT NOT NULL,
  market TEXT NOT NULL,
  
  -- Historical Performance
  avg_cpt DECIMAL(10,2) NOT NULL CHECK (avg_cpt >= 0),
  avg_roas DECIMAL(6,2) NOT NULL CHECK (avg_roas >= 0),
  avg_sellthrough_pct DECIMAL(5,2) NOT NULL CHECK (avg_sellthrough_pct >= 0 AND avg_sellthrough_pct <= 100),
  
  sample_size INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_benchmarks_user_id ON benchmarks(user_id);
CREATE INDEX idx_benchmarks_event_type ON benchmarks(event_type);
CREATE INDEX idx_benchmarks_market ON benchmarks(market);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;

-- EVENTS policies
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = user_id);

-- MEDIA CHANNELS policies
CREATE POLICY "Users can view media channels for their events"
  ON media_channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media_channels.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media channels for their events"
  ON media_channels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media_channels.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update media channels for their events"
  ON media_channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media_channels.event_id
      AND events.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete media channels for their events"
  ON media_channels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = media_channels.event_id
      AND events.user_id = auth.uid()
    )
  );

-- SCENARIOS policies
CREATE POLICY "Users can manage scenarios for their events"
  ON scenarios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = scenarios.event_id
      AND events.user_id = auth.uid()
    )
  );

-- MARKET DIAGNOSTICS policies
CREATE POLICY "Users can manage diagnostics for their events"
  ON market_diagnostics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = market_diagnostics.event_id
      AND events.user_id = auth.uid()
    )
  );

-- BENCHMARKS policies
CREATE POLICY "Users can view their own benchmarks"
  ON benchmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own benchmarks"
  ON benchmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own benchmarks"
  ON benchmarks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own benchmarks"
  ON benchmarks FOR DELETE
  USING (auth.uid() = user_id);