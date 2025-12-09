-- Quick verification script for meaning_index migration
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- 1. Verify column exists
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'notebook_entries'
  AND column_name = 'meaning_index';

-- 2. Verify unique index exists
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'notebook_entries'
  AND indexname = 'notebook_entries_user_word_lang_meaning_unique';

-- 3. Verify the index works (test uniqueness)
-- This should show the index is being used
EXPLAIN SELECT * 
FROM notebook_entries 
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid
  AND word = 'test'
  AND target_language = 'en'
  AND native_language = 'zh'
  AND COALESCE(meaning_index, -1) = -1;

-- 4. Summary
DO $$
DECLARE
  column_exists BOOLEAN;
  index_exists BOOLEAN;
BEGIN
  -- Check column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notebook_entries'
    AND column_name = 'meaning_index'
  ) INTO column_exists;
  
  -- Check index
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'notebook_entries_user_word_lang_meaning_unique'
  ) INTO index_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migration Verification Results:';
  RAISE NOTICE '========================================';
  
  IF column_exists THEN
    RAISE NOTICE '✅ meaning_index column: EXISTS';
  ELSE
    RAISE NOTICE '❌ meaning_index column: MISSING';
  END IF;
  
  IF index_exists THEN
    RAISE NOTICE '✅ Unique index: EXISTS';
  ELSE
    RAISE NOTICE '❌ Unique index: MISSING';
  END IF;
  
  RAISE NOTICE '';
  
  IF column_exists AND index_exists THEN
    RAISE NOTICE '🎉 Migration is COMPLETE and VERIFIED!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run system tests: npm run test:system';
    RAISE NOTICE '2. Start dev server: npm run dev';
    RAISE NOTICE '3. Run UAT: See UAT_TEST_PLAN.md';
  ELSE
    RAISE WARNING '⚠️ Migration may be incomplete. Please check errors above.';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

