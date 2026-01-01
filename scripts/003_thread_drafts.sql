-- Create thread_drafts table for storing draft threads before posting to Foru.ms
CREATE TABLE IF NOT EXISTS thread_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posting', 'posted', 'failed')),
  error_message TEXT,
  foru_thread_id TEXT,
  community_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE thread_drafts ENABLE ROW LEVEL SECURITY;

-- Create policies for thread_drafts
CREATE POLICY "Users can view own thread drafts"
  ON thread_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own thread drafts"
  ON thread_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own thread drafts"
  ON thread_drafts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own thread drafts"
  ON thread_drafts FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX thread_drafts_user_id_idx ON thread_drafts(user_id);
CREATE INDEX thread_drafts_status_idx ON thread_drafts(status);
