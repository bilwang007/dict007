-- Migration: Add meaning_index column to notebook_entries table
-- This allows storing multiple meanings of the same word separately
-- Date: 2024

-- Step 1: Add meaning_index column (nullable, allows NULL for backward compatibility)
DO $$
BEGIN
  -- Check if column already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notebook_entries' 
    AND column_name = 'meaning_index'
  ) THEN
    ALTER TABLE public.notebook_entries 
    ADD COLUMN meaning_index INTEGER;
    
    RAISE NOTICE 'Added meaning_index column to notebook_entries';
  ELSE
    RAISE NOTICE 'Column meaning_index already exists in notebook_entries';
  END IF;
END $$;

-- Step 2: Update the UNIQUE constraint to include meaning_index
-- This allows multiple entries for the same word with different meanings
DO $$
BEGIN
  -- Drop the old unique constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notebook_entries_user_id_word_target_language_native_language_key'
  ) THEN
    ALTER TABLE public.notebook_entries 
    DROP CONSTRAINT notebook_entries_user_id_word_target_language_native_language_key;
    
    RAISE NOTICE 'Dropped old unique constraint';
  END IF;
  
  -- Drop old unique index if it exists (in case migration was partially run)
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'notebook_entries_user_word_lang_meaning_unique'
  ) THEN
    DROP INDEX IF EXISTS notebook_entries_user_word_lang_meaning_unique;
    RAISE NOTICE 'Dropped old unique index if it existed';
  END IF;
END $$;

-- Create unique index using COALESCE to handle NULL meaning_index
-- This allows: same word + same languages + different meaning_index = different entries
-- And: same word + same languages + NULL meaning_index = single entry (backward compatible)
-- Note: We use a unique INDEX instead of CONSTRAINT because indexes support expressions
CREATE UNIQUE INDEX IF NOT EXISTS notebook_entries_user_word_lang_meaning_unique
ON public.notebook_entries(user_id, word, target_language, native_language, COALESCE(meaning_index, -1));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'notebook_entries_user_word_lang_meaning_unique'
  ) THEN
    RAISE NOTICE 'Created new unique index with meaning_index';
  ELSE
    RAISE WARNING 'Unique index may not have been created';
  END IF;
END $$;

-- Step 3: Create index for faster lookups by meaning_index
CREATE INDEX IF NOT EXISTS idx_notebook_entries_meaning_index 
ON public.notebook_entries(user_id, word, target_language, native_language, meaning_index)
WHERE meaning_index IS NOT NULL;

-- Step 4: Verify the migration
DO $$
DECLARE
  column_exists BOOLEAN;
  constraint_exists BOOLEAN;
BEGIN
  -- Check if column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notebook_entries' 
    AND column_name = 'meaning_index'
  ) INTO column_exists;
  
  -- Check if unique index exists (we use index, not constraint)
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'notebook_entries_user_word_lang_meaning_unique'
  ) INTO constraint_exists;
  
  IF column_exists AND constraint_exists THEN
    RAISE NOTICE '✅ Migration successful: meaning_index column and unique index added';
  ELSIF column_exists THEN
    RAISE WARNING '⚠️ Column added but unique index may be missing';
  ELSE
    RAISE WARNING '⚠️ Migration may have failed - column not found';
  END IF;
END $$;

-- Display current schema for verification
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'notebook_entries'
  AND column_name IN ('meaning_index', 'word', 'target_language', 'native_language', 'user_id')
ORDER BY ordinal_position;

