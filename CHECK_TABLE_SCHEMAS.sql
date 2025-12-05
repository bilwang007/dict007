-- Diagnostic script to check which tables exist and their schemas
-- Run this to see what's causing the "user_id does not exist" error

-- Check user_profiles
SELECT 'user_profiles' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check word_definitions
SELECT 'word_definitions' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'word_definitions'
ORDER BY ordinal_position;

-- Check notebook_entries
SELECT 'notebook_entries' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notebook_entries'
ORDER BY ordinal_position;

-- Check word_comments
SELECT 'word_comments' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'word_comments'
ORDER BY ordinal_position;

-- Check user_definition_edits
SELECT 'user_definition_edits' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_definition_edits'
ORDER BY ordinal_position;

-- Check word_definition_proposals
SELECT 'word_definition_proposals' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'word_definition_proposals'
ORDER BY ordinal_position;

-- Check stories
SELECT 'stories' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'stories'
ORDER BY ordinal_position;

