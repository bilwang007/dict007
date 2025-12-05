-- Create word_comments table for user comments on words
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.word_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Can reference either word_definition_id (preferred) or word directly
  word_definition_id UUID REFERENCES public.word_definitions(id) ON DELETE CASCADE,
  word TEXT,
  target_language TEXT,
  native_language TEXT,
  
  comment TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_word_comments_user_id ON word_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_word_comments_word_definition_id ON word_comments(word_definition_id);
CREATE INDEX IF NOT EXISTS idx_word_comments_word ON word_comments(word, target_language, native_language);

-- Create unique indexes for comments
-- For comments with word_definition_id
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_word_definition_comment 
  ON word_comments(word_definition_id, user_id) 
  WHERE word_definition_id IS NOT NULL;

-- For comments without word_definition_id (direct word reference)
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_word_direct_comment 
  ON word_comments(word, target_language, native_language, user_id) 
  WHERE word_definition_id IS NULL;

-- Enable Row Level Security
ALTER TABLE word_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own comments" ON word_comments;
CREATE POLICY "Users can view own comments"
  ON word_comments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own comments" ON word_comments;
CREATE POLICY "Users can insert own comments"
  ON word_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON word_comments;
CREATE POLICY "Users can update own comments"
  ON word_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON word_comments;
CREATE POLICY "Users can delete own comments"
  ON word_comments FOR DELETE
  USING (auth.uid() = user_id);

