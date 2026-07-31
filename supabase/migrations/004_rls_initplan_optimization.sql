-- Performance: wrap auth.uid() in a scalar subquery so Postgres evaluates it
-- ONCE per statement (InitPlan) instead of once per row. On tables that grow
-- with history (day_sessions, tasks) the per-row re-evaluation makes every
-- RLS-filtered query progressively slower. This is the official Supabase
-- performance lint (auth_rls_initplan).
--
-- Apply in the Supabase SQL editor (or via supabase db push).

-- Day Sessions
ALTER POLICY "day_sessions_select" ON day_sessions USING (user_id = (SELECT auth.uid()));
ALTER POLICY "day_sessions_insert" ON day_sessions WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "day_sessions_update" ON day_sessions USING (user_id = (SELECT auth.uid()));
ALTER POLICY "day_sessions_delete" ON day_sessions USING (user_id = (SELECT auth.uid()));

-- Tasks
ALTER POLICY "tasks_select" ON tasks USING (user_id = (SELECT auth.uid()));
ALTER POLICY "tasks_insert" ON tasks WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "tasks_update" ON tasks USING (user_id = (SELECT auth.uid()));
ALTER POLICY "tasks_delete" ON tasks USING (user_id = (SELECT auth.uid()));

-- User Settings
ALTER POLICY "user_settings_select" ON user_settings USING (user_id = (SELECT auth.uid()));
ALTER POLICY "user_settings_insert" ON user_settings WITH CHECK (user_id = (SELECT auth.uid()));
ALTER POLICY "user_settings_update" ON user_settings USING (user_id = (SELECT auth.uid()));
ALTER POLICY "user_settings_delete" ON user_settings USING (user_id = (SELECT auth.uid()));
