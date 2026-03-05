-- Add notes column to tasks for per-task comments/notes
-- Run this in the Supabase SQL Editor

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;
