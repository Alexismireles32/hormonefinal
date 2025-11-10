-- HORMOIQ DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- Project: xyxhvvpyyfgwssimntxs

-- ============================================
-- ENABLE UUID EXTENSION (if not already enabled)
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT, -- User's full name (for Avatar initials)
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- HORMONE TESTS TABLE (Core data)
-- ============================================
CREATE TABLE IF NOT EXISTS hormone_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  test_date TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Hormone values (nullable - user can test 1, 2, or all 3)
  cortisol DECIMAL(4,1), -- ng/mL (e.g., 16.2)
  testosterone DECIMAL(5,1), -- ng/dL (e.g., 720.5)
  progesterone DECIMAL(4,1), -- ng/mL (e.g., 12.3)
  
  -- Context data
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  exercise_today BOOLEAN DEFAULT FALSE,
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  
  -- Tags and notes
  supplements_taken TEXT[], -- Array of supplement names
  notes TEXT,
  
  -- Metadata
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'night')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- READY SCORES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ready_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  confidence INTEGER CHECK (confidence BETWEEN 0 AND 100),
  calculated_at TIMESTAMP DEFAULT NOW(),
  based_on_test_id UUID REFERENCES hormone_tests(id)
);

-- ============================================
-- BIOAGE CALCULATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bioage_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chronological_age INTEGER,
  biological_age INTEGER,
  years_difference INTEGER,
  confidence INTEGER,
  percentile INTEGER,
  breakdown JSONB, -- Detailed breakdown of score components
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AI CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB, -- Array of {role, content, timestamp}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- EXPERIMENTS TABLE (for Impact™ feature)
-- ============================================
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('supplement', 'habit', 'exercise', 'diet', 'other')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  hypothesis TEXT,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- IMPACT ANALYSES TABLE (cached results)
-- ============================================
CREATE TABLE IF NOT EXISTS impact_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  supplement_name TEXT NOT NULL,
  hormone TEXT NOT NULL,
  avg_without DECIMAL(6,2),
  avg_with DECIMAL(6,2),
  percent_change DECIMAL(5,2),
  p_value DECIMAL(4,3),
  is_significant BOOLEAN,
  sample_size_with INTEGER,
  sample_size_without INTEGER,
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tests_user_date ON hormone_tests(user_id, test_date DESC);
CREATE INDEX IF NOT EXISTS idx_tests_user_cortisol ON hormone_tests(user_id, cortisol);
CREATE INDEX IF NOT EXISTS idx_ready_scores_user ON ready_scores(user_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_bioage_user ON bioage_calculations(user_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON ai_conversations(user_id, updated_at DESC);

-- ============================================
-- CREATE A TEST USER (for development)
-- ============================================
INSERT INTO users (email, name, date_of_birth, gender) 
VALUES ('test@hormoiq.com', 'Alex Mireles', '1990-01-01', 'male')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all tables were created:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ============================================
-- NOTES:
-- ============================================
-- 1. All tables use UUID for primary keys
-- 2. Foreign keys cascade on delete for data cleanup
-- 3. Indexes added for common query patterns
-- 4. Check constraints ensure data validity
-- 5. Test user created for development (user_id can be retrieved with: SELECT id FROM users WHERE email = 'test@hormoiq.com')

