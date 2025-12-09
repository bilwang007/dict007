-- ============================================================================
-- DATABASE SCHEMA VERIFICATION SCRIPT
-- ============================================================================
-- Run this to verify your database schema is correct and complete
-- ============================================================================

-- ============================================================================
-- 1. CHECK COLUMNS
-- ============================================================================
SELECT 
  'Column Check' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notebook_entries'
ORDER BY ordinal_position;

-- Expected columns:
-- id, user_id, word, phonetic, target_language, native_language,
-- definition, definition_target, meaning_index, image_url, audio_url,
-- example_sentence_1, example_sentence_2, example_translation_1, 
-- example_translation_2, usage_note, tags, first_learned_date,
-- created_at, updated_at

-- ============================================================================
-- 2. CHECK CONSTRAINTS
-- ============================================================================
SELECT 
  'Constraint Check' as check_type,
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.notebook_entries'::regclass
ORDER BY conname;

-- Expected constraints:
-- notebook_entries_pkey (PRIMARY KEY on id)
-- notebook_entries_user_id_fkey (FOREIGN KEY to auth.users)
-- notebook_entries_user_word_lang_meaning_unique (UNIQUE constraint)
-- check_meaning_index_positive
-- check_word_not_empty
-- check_target_language_format
-- check_native_language_format

-- ============================================================================
-- 3. CHECK INDEXES
-- ============================================================================
SELECT 
  'Index Check' as check_type,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'notebook_entries'
ORDER BY indexname;

-- Expected indexes:
-- idx_notebook_entries_user_id
-- idx_notebook_entries_word_lookup
-- idx_notebook_entries_meaning_index
-- idx_notebook_entries_tags
-- idx_notebook_entries_created_at
-- idx_notebook_entries_first_learned

-- ============================================================================
-- 4. CHECK RLS POLICIES
-- ============================================================================
SELECT 
  'RLS Policy Check' as check_type,
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

-- Expected policies:
-- Users can view own notebook entries (SELECT)
-- Users can insert own notebook entries (INSERT)
-- Users can update own notebook entries (UPDATE)
-- Users can delete own notebook entries (DELETE)

-- ============================================================================
-- 5. CHECK TRIGGERS
-- ============================================================================
SELECT 
  'Trigger Check' as check_type,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'notebook_entries'
ORDER BY trigger_name;

-- Expected trigger:
-- update_notebook_entries_updated_at (BEFORE UPDATE)

-- ============================================================================
-- 6. SUMMARY CHECK
-- ============================================================================
DO $$
DECLARE
  column_count INTEGER;
  constraint_count INTEGER;
  index_count INTEGER;
  policy_count INTEGER;
  trigger_count INTEGER;
  has_meaning_index BOOLEAN;
  has_unique_constraint BOOLEAN;
BEGIN
  -- Count columns
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'notebook_entries';
  
  -- Check meaning_index column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notebook_entries'
      AND column_name = 'meaning_index'
  ) INTO has_meaning_index;
  
  -- Count constraints
  SELECT COUNT(*) INTO constraint_count
  FROM pg_constraint
  WHERE conrelid = 'public.notebook_entries'::regclass;
  
  -- Check unique constraint
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.notebook_entries'::regclass
      AND conname = 'notebook_entries_user_word_lang_meaning_unique'
  ) INTO has_unique_constraint;
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'notebook_entries';
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'notebook_entries';
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_schema = 'public'
    AND event_object_table = 'notebook_entries';
  
  -- Display summary
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DATABASE SCHEMA VERIFICATION SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Columns: % (Expected: ~20)', column_count;
  RAISE NOTICE 'meaning_index column: %', CASE WHEN has_meaning_index THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'Constraints: % (Expected: ~7)', constraint_count;
  RAISE NOTICE 'Unique constraint with meaning_index: %', CASE WHEN has_unique_constraint THEN '✅ EXISTS' ELSE '❌ MISSING' END;
  RAISE NOTICE 'Indexes: % (Expected: ~6)', index_count;
  RAISE NOTICE 'RLS Policies: % (Expected: 4)', policy_count;
  RAISE NOTICE 'Triggers: % (Expected: 1)', trigger_count;
  RAISE NOTICE '========================================';
  
  IF has_meaning_index AND has_unique_constraint AND column_count >= 18 AND constraint_count >= 6 AND index_count >= 5 AND policy_count = 4 THEN
    RAISE NOTICE '✅ SCHEMA IS CORRECT AND COMPLETE!';
  ELSE
    RAISE WARNING '⚠️ SCHEMA MAY BE INCOMPLETE - Please review above';
    IF NOT has_meaning_index THEN
      RAISE WARNING '   → Run migration: migrate_to_complete_schema.sql';
    END IF;
    IF NOT has_unique_constraint THEN
      RAISE WARNING '   → Unique constraint needs to be updated';
    END IF;
  END IF;
END $$;

