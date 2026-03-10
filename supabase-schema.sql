-- ═══════════════════════════════════════════════════════
--  MARGAIAN AI PLATFORM - Supabase Schema
--  Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Opportunities pipeline
CREATE TABLE opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  capital_required INTEGER NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('Low', 'Medium', 'High')),
  market_growth INTEGER CHECK (market_growth BETWEEN 0 AND 100),
  capital_efficiency INTEGER CHECK (capital_efficiency BETWEEN 0 AND 100),
  timing INTEGER CHECK (timing BETWEEN 0 AND 100),
  strategic_relevance INTEGER CHECK (strategic_relevance BETWEEN 0 AND 100),
  source TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Score history (tracks score changes over time)
CREATE TABLE score_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  breakdown JSONB,
  scored_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline ingestion log
CREATE TABLE ingestion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  errors JSONB,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio tracking
CREATE TABLE portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  geography TEXT NOT NULL,
  invested NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL,
  status TEXT DEFAULT 'active',
  entry_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts (for future automated notifications)
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_opportunities_location ON opportunities(location);
CREATE INDEX idx_score_history_opp ON score_history(opportunity_id);
CREATE INDEX idx_portfolio_status ON portfolio(status);
CREATE INDEX idx_alerts_read ON alerts(read);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER portfolio_updated_at
  BEFORE UPDATE ON portfolio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
