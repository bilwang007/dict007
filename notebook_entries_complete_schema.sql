-- ============================================================================
-- COMPLETE NOTEBOOK_ENTRIES TABLE SCHEMA
-- ============================================================================
-- This is the definitive, correct schema for notebook_entries table
-- Includes all required columns including meaning_index for multiple meanings
-- ============================================================================

-- Drop existing table if needed (USE WITH CAUTION - BACKUP FIRST!)
-- DROP TABLE IF EXISTS public.notebook_entries CASCADE;

-- Create notebook_entries table with complete schema
CREATE TABLE IF NOT EXISTS public.notebook_entries (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key to User
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Word Information
  word TEXT NOT NULL,
  phonetic TEXT, -- Phonetic transcription (音标)
  
  -- Language Information
  target_language TEXT NOT NULL, -- Language being learned
  native_language TEXT NOT NULL, -- User's native language
  
  -- Definition Information
  definition TEXT NOT NULL, -- Native language definition
  definition_target TEXT, -- Target language definition
  
  -- Multiple Meanings Support
  meaning_index INTEGER, -- Index of meaning (1, 2, 3, etc.) - NULL for single meaning entries
  
  -- Media
  image_url TEXT, -- Image URL for this specific meaning
  audio_url TEXT, -- Audio pronunciation URL
  
  -- Examples
  example_sentence_1 TEXT,
  example_sentence_2 TEXT,
  example_translation_1 TEXT,
  example_translation_2 TEXT,
  
  -- Additional Information
  usage_note TEXT, -- Usage notes and cultural context
  tags TEXT[] DEFAULT '{}', -- Tags for categorization
  
  -- Timestamps
  first_learned_date TIMESTAMPTZ, -- When word was first learned
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  -- Unique constraint: allows multiple entries for same word with different meanings
  -- NULL meaning_index is treated as -1 for uniqueness (single meaning entries)
  CONSTRAINT notebook_entries_user_word_lang_meaning_unique 
    UNIQUE (user_id, word, target_language, native_language, COALESCE(meaning_index, -1))
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Index on user_id for fast user queries
CREATE INDEX IF NOT EXISTS idx_notebook_entries_user_id 
  ON public.notebook_entries(user_id);

-- Index on word + languages for fast lookups
CREATE INDEX IF NOT EXISTS idx_notebook_entries_word_lookup 
  ON public.notebook_entries(user_id, word, target_language, native_language);

-- Index on meaning_index for multiple meanings queries
CREATE INDEX IF NOT EXISTS idx_notebook_entries_meaning_index 
  ON public.notebook_entries(user_id, word, target_language, native_language, meaning_index)
  WHERE meaning_index IS NOT NULL;

-- GIN index on tags for fast tag filtering
CREATE INDEX IF NOT EXISTS idx_notebook_entries_tags 
  ON public.notebook_entries USING GIN(tags);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_notebook_entries_created_at 
  ON public.notebook_entries(created_at DESC);

-- Index on first_learned_date for learning progress
CREATE INDEX IF NOT EXISTS idx_notebook_entries_first_learned 
  ON public.notebook_entries(first_learned_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.notebook_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notebook entries" ON public.notebook_entries;
DROP POLICY IF EXISTS "Users can insert own notebook entries" ON public.notebook_entries;
DROP POLICY IF EXISTS "Users can update own notebook entries" ON public.notebook_entries;
DROP POLICY IF EXISTS "Users can delete own notebook entries" ON public.notebook_entries;

-- SELECT Policy: Users can only view their own entries
CREATE POLICY "Users can view own notebook entries"
  ON public.notebook_entries FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT Policy: Users can only insert their own entries
CREATE POLICY "Users can insert own notebook entries"
  ON public.notebook_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE Policy: Users can only update their own entries
CREATE POLICY "Users can update own notebook entries"
  ON public.notebook_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE Policy: Users can only delete their own entries
CREATE POLICY "Users can delete own notebook entries"
  ON public.notebook_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS for updated_at
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_notebook_entries_updated_at ON public.notebook_entries;
CREATE TRIGGER update_notebook_entries_updated_at
  BEFORE UPDATE ON public.notebook_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VALIDATION CONSTRAINTS
-- ============================================================================

-- Ensure meaning_index is positive if not NULL
ALTER TABLE public.notebook_entries 
  ADD CONSTRAINT check_meaning_index_positive 
  CHECK (meaning_index IS NULL OR meaning_index > 0);

-- Ensure word is not empty
ALTER TABLE public.notebook_entries 
  ADD CONSTRAINT check_word_not_empty 
  CHECK (LENGTH(TRIM(word)) > 0);

-- Ensure languages are valid (2-5 character codes)
ALTER TABLE public.notebook_entries 
  ADD CONSTRAINT check_target_language_format 
  CHECK (LENGTH(TRIM(target_language)) BETWEEN 2 AND 5);

ALTER TABLE public.notebook_entries 
  ADD CONSTRAINT check_native_language_format 
  CHECK (LENGTH(TRIM(native_language)) BETWEEN 2 AND 5);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Display table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notebook_entries'
ORDER BY ordinal_position;

-- Display indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'notebook_entries'
ORDER BY indexname;

-- Display constraints
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.notebook_entries'::regclass
ORDER BY conname;

-- Display RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notebook_entries'
ORDER BY policyname;

