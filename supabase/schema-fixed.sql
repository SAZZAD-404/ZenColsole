-- ZenConsole Database Schema for Supabase (Fixed Version)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (if re-running)
-- ============================================
DROP TABLE IF EXISTS request_logs CASCADE;
DROP TABLE IF EXISTS usage_daily_summary CASCADE;
DROP TABLE IF EXISTS usage_history CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS pricing CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS combos CASCADE;
DROP TABLE IF EXISTS mitm_alias CASCADE;
DROP TABLE IF EXISTS custom_models CASCADE;
DROP TABLE IF EXISTS model_aliases CASCADE;
DROP TABLE IF EXISTS proxy_pools CASCADE;
DROP TABLE IF EXISTS provider_nodes CASCADE;
DROP TABLE IF EXISTS provider_connections CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
('global', '{
  "cloudEnabled": false,
  "tunnelEnabled": false,
  "tunnelUrl": "",
  "tunnelProvider": "cloudflare",
  "tailscaleEnabled": false,
  "tailscaleUrl": "",
  "stickyRoundRobinLimit": 3,
  "providerStrategies": {},
  "comboStrategy": "fallback",
  "comboStickyRoundRobinLimit": 1,
  "comboStrategies": {},
  "requireLogin": true,
  "tunnelDashboardAccess": true,
  "observabilityEnabled": true,
  "observabilityMaxRecords": 1000,
  "observabilityBatchSize": 20,
  "observabilityFlushIntervalMs": 5000,
  "observabilityMaxJsonSize": 1024,
  "outboundProxyEnabled": false,
  "outboundProxyUrl": "",
  "outboundNoProxy": "",
  "mitmRouterBaseUrl": "http://localhost:20128",
  "dnsToolEnabled": {},
  "rtkEnabled": true,
  "cavemanEnabled": false,
  "cavemanLevel": "full"
}'::jsonb);

-- ============================================
-- PROVIDER CONNECTIONS TABLE
-- ============================================
CREATE TABLE provider_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  auth_type TEXT NOT NULL DEFAULT 'oauth',
  name TEXT,
  display_name TEXT,
  email TEXT,
  priority INTEGER DEFAULT 1,
  global_priority INTEGER,
  is_active BOOLEAN DEFAULT true,
  default_model TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  token_type TEXT,
  scope TEXT,
  project_id TEXT,
  api_key TEXT,
  test_status TEXT,
  last_tested TIMESTAMPTZ,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  error_code TEXT,
  rate_limited_until TIMESTAMPTZ,
  expires_in INTEGER,
  consecutive_use_count INTEGER DEFAULT 0,
  provider_specific_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_provider_connections_provider ON provider_connections(provider);
CREATE INDEX idx_provider_connections_is_active ON provider_connections(is_active);
CREATE INDEX idx_provider_connections_provider_active ON provider_connections(provider, is_active);

-- ============================================
-- PROVIDER NODES TABLE
-- ============================================
CREATE TABLE provider_nodes (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  prefix TEXT,
  api_type TEXT,
  base_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROXY POOLS TABLE
-- ============================================
CREATE TABLE proxy_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  proxy_url TEXT NOT NULL,
  no_proxy TEXT DEFAULT '',
  type TEXT DEFAULT 'http',
  is_active BOOLEAN DEFAULT true,
  strict_proxy BOOLEAN DEFAULT false,
  test_status TEXT DEFAULT 'unknown',
  last_tested_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MODEL ALIASES TABLE
-- ============================================
CREATE TABLE model_aliases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alias TEXT UNIQUE NOT NULL,
  target_model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOM MODELS TABLE
-- ============================================
CREATE TABLE custom_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_alias TEXT NOT NULL,
  model_id TEXT NOT NULL,
  type TEXT DEFAULT 'llm',
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_alias, model_id, type)
);

-- ============================================
-- MITM ALIAS TABLE
-- ============================================
CREATE TABLE mitm_alias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_name TEXT NOT NULL UNIQUE,
  mappings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMBOS TABLE
-- ============================================
CREATE TABLE combos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  models TEXT[] NOT NULL,
  kind TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- API KEYS TABLE
-- ============================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  machine_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- ============================================
-- PRICING TABLE
-- ============================================
CREATE TABLE pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  input NUMERIC,
  output NUMERIC,
  cached NUMERIC,
  reasoning NUMERIC,
  cache_creation NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, model)
);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  allowed_models TEXT[] DEFAULT ARRAY[]::TEXT[],
  registration_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO user_settings (allowed_models, registration_enabled) 
VALUES (ARRAY[]::TEXT[], true);

-- ============================================
-- USAGE HISTORY TABLE
-- ============================================
CREATE TABLE usage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  connection_id UUID REFERENCES provider_connections(id) ON DELETE SET NULL,
  api_key TEXT,
  endpoint TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  reasoning_tokens INTEGER DEFAULT 0,
  cached_tokens INTEGER DEFAULT 0,
  cache_creation_tokens INTEGER DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'ok',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_history_provider ON usage_history(provider);
CREATE INDEX idx_usage_history_model ON usage_history(model);
CREATE INDEX idx_usage_history_timestamp ON usage_history(timestamp DESC);
CREATE INDEX idx_usage_history_provider_model ON usage_history(provider, model);

-- ============================================
-- USAGE DAILY SUMMARY TABLE
-- ============================================
CREATE TABLE usage_daily_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  provider TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  connection_id TEXT DEFAULT '',
  api_key TEXT DEFAULT '',
  endpoint TEXT DEFAULT '',
  requests INTEGER DEFAULT 0,
  prompt_tokens BIGINT DEFAULT 0,
  completion_tokens BIGINT DEFAULT 0,
  reasoning_tokens BIGINT DEFAULT 0,
  cached_tokens BIGINT DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, provider, model, connection_id, api_key, endpoint)
);

CREATE INDEX idx_usage_daily_summary_date ON usage_daily_summary(date DESC);
CREATE INDEX idx_usage_daily_summary_provider ON usage_daily_summary(provider);

-- ============================================
-- REQUEST LOGS TABLE
-- ============================================
CREATE TABLE request_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  connection_id UUID,
  account_name TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_logs_timestamp ON request_logs(timestamp DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_connections_updated_at BEFORE UPDATE ON provider_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_nodes_updated_at BEFORE UPDATE ON provider_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proxy_pools_updated_at BEFORE UPDATE ON proxy_pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_aliases_updated_at BEFORE UPDATE ON model_aliases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mitm_alias_updated_at BEFORE UPDATE ON mitm_alias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_combos_updated_at BEFORE UPDATE ON combos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_updated_at BEFORE UPDATE ON pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_daily_summary_updated_at BEFORE UPDATE ON usage_daily_summary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Cleanup old request logs (keep last 1000)
CREATE OR REPLACE FUNCTION cleanup_old_request_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM request_logs
  WHERE id NOT IN (
    SELECT id FROM request_logs
    ORDER BY timestamp DESC
    LIMIT 1000
  );
END;
$$ LANGUAGE plpgsql;

-- Aggregate usage to daily summary
CREATE OR REPLACE FUNCTION aggregate_usage_to_daily_summary()
RETURNS void AS $$
BEGIN
  INSERT INTO usage_daily_summary (
    date, provider, model, connection_id, api_key, endpoint,
    requests, prompt_tokens, completion_tokens, reasoning_tokens, cached_tokens, cost
  )
  SELECT 
    timestamp::date as date,
    COALESCE(provider, '') as provider,
    COALESCE(model, '') as model,
    COALESCE(connection_id::text, '') as connection_id,
    COALESCE(api_key, '') as api_key,
    COALESCE(endpoint, '') as endpoint,
    COUNT(*) as requests,
    SUM(prompt_tokens) as prompt_tokens,
    SUM(completion_tokens) as completion_tokens,
    SUM(reasoning_tokens) as reasoning_tokens,
    SUM(cached_tokens) as cached_tokens,
    SUM(cost) as cost
  FROM usage_history
  WHERE timestamp::date = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY timestamp::date, provider, model, connection_id, api_key, endpoint
  ON CONFLICT (date, provider, model, connection_id, api_key, endpoint)
  DO UPDATE SET
    requests = usage_daily_summary.requests + EXCLUDED.requests,
    prompt_tokens = usage_daily_summary.prompt_tokens + EXCLUDED.prompt_tokens,
    completion_tokens = usage_daily_summary.completion_tokens + EXCLUDED.completion_tokens,
    reasoning_tokens = usage_daily_summary.reasoning_tokens + EXCLUDED.reasoning_tokens,
    cached_tokens = usage_daily_summary.cached_tokens + EXCLUDED.cached_tokens,
    cost = usage_daily_summary.cost + EXCLUDED.cost,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS
-- ============================================

CREATE OR REPLACE VIEW active_provider_connections AS
SELECT * FROM provider_connections
WHERE is_active = true
ORDER BY priority ASC;

CREATE OR REPLACE VIEW recent_usage AS
SELECT * FROM usage_history
WHERE timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

CREATE OR REPLACE VIEW usage_by_provider_30d AS
SELECT 
  provider,
  COUNT(*) as total_requests,
  SUM(prompt_tokens) as total_prompt_tokens,
  SUM(completion_tokens) as total_completion_tokens,
  SUM(cost) as total_cost
FROM usage_history
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY provider
ORDER BY total_cost DESC;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ ZenConsole database schema created successfully!';
  RAISE NOTICE '📊 Tables created: 15';
  RAISE NOTICE '🔍 Indexes created: 12+';
  RAISE NOTICE '⚡ Triggers created: 11';
  RAISE NOTICE '🎯 Views created: 3';
  RAISE NOTICE '🚀 Ready to use!';
END $$;
