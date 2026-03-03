-- Add desk tracking columns to day_sessions (if not already present)
-- Run this in the Supabase SQL Editor if you get "Desk tracking not available"

ALTER TABLE day_sessions ADD COLUMN IF NOT EXISTS desk_status TEXT DEFAULT 'at_desk';
ALTER TABLE day_sessions ADD COLUMN IF NOT EXISTS away_since TIMESTAMPTZ;
ALTER TABLE day_sessions ADD COLUMN IF NOT EXISTS away_log JSONB DEFAULT '[]';
