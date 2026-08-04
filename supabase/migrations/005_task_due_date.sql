-- Optional due date for a task. NULL keeps the existing behaviour: the
-- task belongs to today, and its calendar event (if any) lands today.
-- With a date set, the task is scheduled for that day and its Google
-- Calendar event is created on that date instead.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;

COMMENT ON COLUMN tasks.due_date IS 'Day the task is scheduled for; NULL = today';
