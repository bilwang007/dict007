# Database Migration Guide - Multiple Meanings Support

## Overview
This migration adds support for storing multiple meanings of the same word separately in the notebook. This allows users to practice each meaning individually.

## Changes Required

### 1. Database Schema Changes

**New Column:**
- `meaning_index` (INTEGER, nullable) - Stores the index of the meaning (1, 2, 3, etc.)

**Updated Constraint:**
- The UNIQUE constraint is updated to include `meaning_index`, allowing multiple entries for the same word with different meanings

### 2. Migration Steps

#### Step 1: Run the Migration SQL

Execute the SQL file `add-meaning-index-to-notebook.sql` in your Supabase SQL Editor:

```bash
# In Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy and paste the contents of add-meaning-index-to-notebook.sql
# 3. Click "Run"
```

Or via command line (if you have psql access):
```bash
psql -h your-db-host -U your-user -d your-database -f add-meaning-index-to-notebook.sql
```

#### Step 2: Verify Migration

Run this query to verify the column was added:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'notebook_entries'
  AND column_name = 'meaning_index';
```

Expected result:
```
column_name   | data_type | is_nullable
--------------+-----------+-------------
meaning_index | integer   | YES
```

#### Step 3: Verify Constraint

Check that the new unique constraint exists:
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'notebook_entries_user_word_lang_meaning_unique';
```

### 3. Backward Compatibility

- **Existing entries**: All existing notebook entries will have `meaning_index = NULL`
- **New entries without meaning**: Will also have `meaning_index = NULL`
- **New entries with meaning**: Will have `meaning_index = 1, 2, 3, etc.`

The code handles both cases:
- Entries without `meaningIndex` are treated as single-meaning entries
- Entries with `meaningIndex` are stored separately for each meaning

### 4. Potential Issues & Solutions

#### Issue 1: Column Not Found Error
**Error:** `column "meaning_index" does not exist`

**Solution:** Run the migration SQL file

#### Issue 2: Unique Constraint Violation
**Error:** `duplicate key value violates unique constraint`

**Solution:** The migration updates the unique constraint. If you see this error, the old constraint might still exist. The migration script handles this automatically.

#### Issue 3: Query Fails Silently
**Symptom:** Entries not saving or loading correctly

**Solution:** 
1. Check if the column exists (see Step 2 above)
2. Check browser console for warnings
3. Verify RLS policies allow INSERT/UPDATE operations

### 5. Testing After Migration

1. **Test Single Meaning Entry:**
   - Save a word without multiple meanings
   - Should save with `meaning_index = NULL`
   - Should display normally in notebook

2. **Test Multiple Meanings:**
   - Look up a word with multiple meanings (e.g., "bank", "leave")
   - Save to notebook
   - Should create separate entries for each meaning
   - Each entry should show "(Meaning 1)", "(Meaning 2)", etc.

3. **Test Notebook Lookup:**
   - After saving a word, search for it again
   - Should load directly from notebook (not from database/LLM)
   - Should show all meanings if multiple were saved

### 6. Rollback (if needed)

If you need to rollback the migration:

```sql
-- Remove the new unique constraint
ALTER TABLE public.notebook_entries 
DROP CONSTRAINT IF EXISTS notebook_entries_user_word_lang_meaning_unique;

-- Restore old unique constraint
ALTER TABLE public.notebook_entries 
ADD CONSTRAINT notebook_entries_user_id_word_target_language_native_language_key 
UNIQUE (user_id, word, target_language, native_language);

-- Remove the column (WARNING: This will lose meaning_index data)
ALTER TABLE public.notebook_entries 
DROP COLUMN IF EXISTS meaning_index;

-- Remove the index
DROP INDEX IF EXISTS idx_notebook_entries_meaning_index;
```

**⚠️ Warning:** Rolling back will cause data loss for entries with `meaning_index` values. Only do this if necessary.

### 7. UI Impact

The UI has been updated to:
- Display meaning index in notebook entries: "word (Meaning 1)"
- Handle multiple meanings when saving
- Show separate entries for each meaning in the notebook list

No additional UI changes needed after running the migration.

## Summary

✅ **Required Action:** Run `add-meaning-index-to-notebook.sql` migration
✅ **Backward Compatible:** Yes - existing entries work without changes
✅ **Breaking Changes:** None - old entries continue to work
✅ **UI Updates:** Already implemented in code

