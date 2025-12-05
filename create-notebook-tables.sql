-- Create notebook_entries table
CREATE TABLE IF NOT EXISTS notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  definition TEXT NOT NULL,
  definition_target TEXT,
  image_url TEXT,
  audio_url TEXT,
  example_sentence_1 TEXT NOT NULL,
  example_sentence_2 TEXT NOT NULL,
  example_translation_1 TEXT NOT NULL,
  example_translation_2 TEXT NOT NULL,
  usage_note TEXT,
  tags TEXT[] DEFAULT '{}',
  first_learned_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word, target_language, native_language)
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  translation TEXT NOT NULL,
  words_used UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notebook_entries_user_id ON notebook_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_tags ON notebook_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_created_at ON notebook_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notebook_entries
DROP POLICY IF EXISTS "Users can view own entries" ON notebook_entries;
CREATE POLICY "Users can view own entries"
  ON notebook_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own entries" ON notebook_entries;
CREATE POLICY "Users can insert own entries"
  ON notebook_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entries" ON notebook_entries;
CREATE POLICY "Users can update own entries"
  ON notebook_entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own entries" ON notebook_entries;
CREATE POLICY "Users can delete own entries"
  ON notebook_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for stories
DROP POLICY IF EXISTS "Users can view own stories" ON stories;
CREATE POLICY "Users can view own stories"
  ON stories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
CREATE POLICY "Users can insert own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('notebook_entries', 'stories');

