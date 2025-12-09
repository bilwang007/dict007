-- ============================================================================
-- MIGRATION: Update notebook_entries to complete schema
-- ============================================================================
-- This migration safely updates existing notebook_entries table to include
-- meaning_index and all proper constraints, indexes, and validations
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Add meaning_index column if it doesn't exist
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notebook_entries' 
    AND column_name = 'meaning_index'
  ) THEN
    ALTER TABLE public.notebook_entries 
    ADD COLUMN meaning_index INTEGER;
    
    RAISE NOTICE '✅ Added meaning_index column';
  ELSE
    RAISE NOTICE 'ℹ️ meaning_index column already exists';
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Update UNIQUE constraint to include meaning_index
-- ============================================================================
DO $$
BEGIN
  -- Drop old unique constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notebook_entries_user_id_word_target_language_native_language_key'
  ) THEN
    ALTER TABLE public.notebook_entries 
    DROP CONSTRAINT notebook_entries_user_id_word_target_language_native_language_key;
    
    RAISE NOTICE '✅ Dropped old unique constraint';
  END IF;
  
  -- Create new unique constraint with meaning_index
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notebook_entries_user_word_lang_meaning_unique'
  ) THEN
    ALTER TABLE public.notebook_entries 
    ADD CONSTRAINT notebook_entries_user_word_lang_meaning_unique 
    UNIQUE (user_id, word, target_language, native_language, COALESCE(meaning_index, -1));
    
    RAISE NOTICE '✅ Created new unique constraint with meaning_index';
  ELSE
    RAISE NOTICE 'ℹ️ Unique constraint with meaning_index already exists';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Add validation constraints
-- ============================================================================
DO $$
BEGIN
  -- Check constraint for positive meaning_index
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_meaning_index_positive'
  ) THEN
    ALTER TABLE public.notebook_entries 
    ADD CONSTRAINT check_meaning_index_positive 
    CHECK (meaning_index IS NULL OR meaning_index > 0);
    
    RAISE NOTICE '✅ Added meaning_index validation constraint';
  END IF;
  
  -- Check constraint for non-empty word
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_word_not_empty'
  ) THEN
    ALTER TABLE public.notebook_entries 
    ADD CONSTRAINT check_word_not_empty 
    CHECK (LENGTH(TRIM(word)) > 0);
    
    RAISE NOTICE '✅ Added word validation constraint';
  END IF;
  
  -- Check constraints for language format
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_target_language_format'
  ) THEN
    ALTER TABLE public.notebook_entries 
    ADD CONSTRAINT check_target_language_format 
    CHECK (LENGTH(TRIM(target_language)) BETWEEN 2 AND 5);
    
    RAISE NOTICE '✅ Added target_language validation constraint';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_native_language_format'
  ) THEN
    ALTER TABLE public.notebook_entries 
    ADD CONSTRAINT check_native_language_format 
    CHECK (LENGTH(TRIM(native_language)) BETWEEN 2 AND 5);
    
    RAISE NOTICE '✅ Added native_language validation constraint';
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Create/Update indexes
-- ============================================================================

-- Index for meaning_index lookups
CREATE INDEX IF NOT EXISTS idx_notebook_entries_meaning_index 
  ON public.notebook_entries(user_id, word, target_language, native_language, meaning_index)
  WHERE meaning_index IS NOT NULL;

-- Index for word lookups (composite)
CREATE INDEX IF NOT EXISTS idx_notebook_entries_word_lookup 
  ON public.notebook_entries(user_id, word, target_language, native_language);

-- Index for first_learned_date
CREATE INDEX IF NOT EXISTS idx_notebook_entries_first_learned 
  ON public.notebook_entries(first_learned_date);

-- ============================================================================
-- STEP 5: Create/Update trigger for updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notebook_entries_updated_at ON public.notebook_entries;
CREATE TRIGGER update_notebook_entries_updated_at
  BEFORE UPDATE ON public.notebook_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: Verify migration
-- ============================================================================
DO $$
DECLARE
  column_exists BOOLEAN;
  constraint_exists BOOLEAN;
  index_exists BOOLEAN;
BEGIN
  -- Check column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notebook_entries' 
    AND column_name = 'meaning_index'
  ) INTO column_exists;
  
  -- Check constraint
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'notebook_entries_user_word_lang_meaning_unique'
  ) INTO constraint_exists;
  
  -- Check index
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'notebook_entries'
    AND indexname = 'idx_notebook_entries_meaning_index'
  ) INTO index_exists;
  
  IF column_exists AND constraint_exists AND index_exists THEN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '   - meaning_index column: ✅';
    RAISE NOTICE '   - Unique constraint: ✅';
    RAISE NOTICE '   - Indexes: ✅';
  ELSE
    RAISE WARNING '⚠️ Migration may be incomplete';
    RAISE NOTICE '   - meaning_index column: %', CASE WHEN column_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE '   - Unique constraint: %', CASE WHEN constraint_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE '   - Index: %', CASE WHEN index_exists THEN '✅' ELSE '❌' END;
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (Run separately to verify)
-- ============================================================================

-- View all columns
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'notebook_entries' 
-- ORDER BY ordinal_position;

-- View all constraints
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'notebook_entries'::regclass;

-- View all indexes
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'notebook_entries';

