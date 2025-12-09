-- Create notebook_entries table with complete schema
CREATE TABLE IF NOT EXISTS notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  phonetic TEXT,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  definition TEXT NOT NULL,
  definition_target TEXT,
  meaning_index INTEGER, -- Index of meaning (1, 2, 3, etc.) - NULL for single meaning entries
  image_url TEXT,
  audio_url TEXT,
  example_sentence_1 TEXT,
  example_sentence_2 TEXT,
  example_translation_1 TEXT,
  example_translation_2 TEXT,
  usage_note TEXT,
  tags TEXT[] DEFAULT '{}',
  first_learned_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Unique constraint allowing multiple meanings
  CONSTRAINT notebook_entries_user_word_lang_meaning_unique 
    UNIQUE (user_id, word, target_language, native_language, COALESCE(meaning_index, -1)),
  -- Validation constraints
  CONSTRAINT check_meaning_index_positive 
    CHECK (meaning_index IS NULL OR meaning_index > 0),
  CONSTRAINT check_word_not_empty 
    CHECK (LENGTH(TRIM(word)) > 0),
  CONSTRAINT check_target_language_format 
    CHECK (LENGTH(TRIM(target_language)) BETWEEN 2 AND 5),
  CONSTRAINT check_native_language_format 
    CHECK (LENGTH(TRIM(native_language)) BETWEEN 2 AND 5)
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

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_notebook_entries_user_id ON notebook_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_word_lookup 
  ON notebook_entries(user_id, word, target_language, native_language);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_meaning_index 
  ON notebook_entries(user_id, word, target_language, native_language, meaning_index)
  WHERE meaning_index IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notebook_entries_tags ON notebook_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_created_at ON notebook_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_first_learned ON notebook_entries(first_learned_date);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- Create trigger for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notebook_entries_updated_at
  BEFORE UPDATE ON notebook_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

