-- ── Task lists ───────────────────────────────────────────────────────
-- Named lists ("Work", "Home", …). Tasks with list_id = NULL are
-- uncategorised and show only under "All tasks".

CREATE TABLE IF NOT EXISTS task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'cyan',
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES task_lists(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS tasks_list_id_idx ON tasks(list_id);

ALTER TABLE task_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_lists_select" ON task_lists;
CREATE POLICY "task_lists_select" ON task_lists
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "task_lists_insert" ON task_lists;
CREATE POLICY "task_lists_insert" ON task_lists
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "task_lists_update" ON task_lists;
CREATE POLICY "task_lists_update" ON task_lists
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "task_lists_delete" ON task_lists;
CREATE POLICY "task_lists_delete" ON task_lists
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ── Google Calendar sync ─────────────────────────────────────────────
-- Client-visible connection state lives on user_settings; the OAuth
-- refresh token lives in a separate table that clients can never read.

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS google_calendar_connected BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_calendar_email TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_prompt_dismissed BOOLEAN NOT NULL DEFAULT false;

-- Calendar event created for a task with a time set (NULL = not synced)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS google_event_id TEXT;

CREATE TABLE IF NOT EXISTS google_credentials (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS on with ZERO policies = no client (anon or authenticated) can read
-- or write these rows. Only the server's service-role key bypasses RLS.
ALTER TABLE google_credentials ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE google_credentials IS 'Google OAuth refresh tokens — server-only, never exposed to clients';
