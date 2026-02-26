-- ============================================================
-- NomadBalance — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up your database
-- ============================================================

-- 1. EXERCISES (static reference data)
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "order" INT DEFAULT 0,
  "group" TEXT NOT NULL, -- neck_cervical, shoulders_thoracic, wrists_forearms, lower_back_core, hips_legs
  dosage TEXT,
  execution TEXT,
  anti_cheating TEXT,
  modification TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. DAY SESSIONS
CREATE TABLE day_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'standby', -- active, standby, completed
  started_at TEXT,
  focus_sessions_completed INT DEFAULT 0,
  focus_work_minutes INT DEFAULT 45,
  focus_break_minutes INT DEFAULT 5,
  focus_sound TEXT,
  relax_sound TEXT,
  meeting_mode BOOLEAN DEFAULT false,
  body_breaks_done INT DEFAULT 0,
  body_breaks_target INT DEFAULT 4,
  body_break_schedule JSONB DEFAULT '[]',
  exercises_done_today JSONB DEFAULT '[]',
  selected_exercise_groups JSONB DEFAULT '[]',
  eating_window_start TEXT,
  eating_window_end TEXT,
  meal_plan JSONB DEFAULT '[]',
  meals_logged JSONB DEFAULT '[]',
  snacks_allowed INT DEFAULT 0,
  fasting_preset TEXT DEFAULT '16/8',
  custom_fasting_hours INT,
  max_meals INT DEFAULT 3,
  work_start_today TEXT,
  work_end_today TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TASKS
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  session_id UUID REFERENCES day_sessions(id) ON DELETE SET NULL,
  "order" INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  is_work_day_task BOOLEAN DEFAULT false,
  alarm_time TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. USER SETTINGS
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  morning_work_start TEXT DEFAULT '09:00',
  morning_work_end TEXT DEFAULT '13:00',
  afternoon_work_start TEXT DEFAULT '14:00',
  afternoon_work_end TEXT DEFAULT '18:00',
  breathing_technique TEXT DEFAULT '4-7-8',
  notifications_enabled BOOLEAN DEFAULT false,
  notification_start_time TEXT,
  notification_end_time TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Each user can only access their own data
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Exercises: readable by all authenticated users (shared reference data)
CREATE POLICY "exercises_select" ON exercises
  FOR SELECT TO authenticated USING (true);

-- Day Sessions: users see only their own
CREATE POLICY "day_sessions_select" ON day_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "day_sessions_insert" ON day_sessions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "day_sessions_update" ON day_sessions
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "day_sessions_delete" ON day_sessions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Tasks: users see only their own
CREATE POLICY "tasks_select" ON tasks
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "tasks_update" ON tasks
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "tasks_delete" ON tasks
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- User Settings: users see only their own
CREATE POLICY "user_settings_select" ON user_settings
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_settings_insert" ON user_settings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "user_settings_update" ON user_settings
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_settings_delete" ON user_settings
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_day_sessions_user_date ON day_sessions(user_id, date DESC);
CREATE INDEX idx_tasks_user_session ON tasks(user_id, session_id);
CREATE INDEX idx_tasks_user_order ON tasks(user_id, "order");
CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE INDEX idx_exercises_group ON exercises("group", "order");
