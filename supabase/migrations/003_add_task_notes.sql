-- Add notes column to tasks table for per-task comments/notes
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;
