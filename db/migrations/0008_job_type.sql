-- Add job_type column to stringing table
ALTER TABLE stringing ADD COLUMN job_type TEXT DEFAULT 'stringing';
