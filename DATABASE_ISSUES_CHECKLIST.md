# Database Issues Checklist & Verification

## ✅ Issues Found and Fixed

### 1. Missing `meaning_index` Column
**Status:** ⚠️ **REQUIRES MIGRATION**

**Problem:**
- Code uses `meaning_index` column but it doesn't exist in database schema
- Will cause errors when saving entries with multiple meanings
- Queries will fail with "column does not exist" error

**Solution:**
- ✅ Created migration file: `add-meaning-index-to-notebook.sql`
- ✅ Migration adds column safely with backward compatibility
- ✅ Updated unique constraint to allow multiple meanings

**Action Required:**
```sql
-- Run this in Supabase SQL Editor:
-- File: add-meaning-index-to-notebook.sql
```

### 2. Unique Constraint Conflict
**Status:** ✅ **FIXED IN MIGRATION**

**Problem:**
- Old constraint: `UNIQUE(user_id, word, target_language, native_language)`
- Prevents storing multiple meanings of same word
- Will cause constraint violations

**Solution:**
- ✅ Migration updates constraint to include `meaning_index`
- ✅ New constraint: `UNIQUE(user_id, word, target_language, native_language, COALESCE(meaning_index, -1))`
- ✅ Allows multiple entries for same word with different meanings

### 3. Query Error Handling
**Status:** ✅ **FIXED**

**Problem:**
- Code uses `.single()` which throws error if no result
- No handling for missing column case

**Solution:**
- ✅ Changed to `.maybeSingle()` for graceful handling
- ✅ Added error handling for missing column (code 42703)
- ✅ Shows warning if migration not run

### 4. Notebook Lookup - Multiple Meanings
**Status:** ✅ **FIXED**

**Problem:**
- Lookup only gets first notebook entry
- Doesn't handle multiple meanings properly

**Solution:**
- ✅ Updated to fetch all entries for the word
- ✅ Combines multiple meanings into single result
- ✅ Preserves meaning structure

## 🔍 Verification Steps

### Step 1: Check Current Schema
Run in Supabase SQL Editor:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'notebook_entries'
ORDER BY ordinal_position;
```

**Expected:** Should see `meaning_index` column after migration

### Step 2: Test Single Meaning Entry
1. Look up a word (e.g., "hello")
2. Save to notebook
3. Check database: `meaning_index` should be `NULL`
4. Look up again - should load from notebook

### Step 3: Test Multiple Meanings
1. Look up word with multiple meanings (e.g., "bank", "leave")
2. Save to notebook
3. Check database: Should see multiple entries with `meaning_index = 1, 2, 3...`
4. Each entry should be separate in notebook list

### Step 4: Test Notebook Priority
1. Save a word to notebook
2. Search for the same word again
3. Should load from notebook (not database/LLM)
4. Source should show "From Notebook"

## 🐛 Potential Runtime Issues

### Issue 1: Column Not Found
**Error Message:**
```
column "meaning_index" does not exist
```

**Fix:**
- Run migration: `add-meaning-index-to-notebook.sql`
- Restart application

### Issue 2: Constraint Violation
**Error Message:**
```
duplicate key value violates unique constraint
```

**Fix:**
- Migration should fix this automatically
- If persists, check if old constraint still exists:
```sql
SELECT conname FROM pg_constraint 
WHERE conrelid = 'notebook_entries'::regclass;
```

### Issue 3: Entries Not Saving
**Symptoms:**
- Save button doesn't work
- No error shown
- Entries don't appear in notebook

**Debug:**
1. Check browser console for errors
2. Check Supabase logs
3. Verify RLS policies allow INSERT
4. Verify user is authenticated

### Issue 4: Multiple Meanings Not Separating
**Symptoms:**
- All meanings saved as single entry
- Only one entry appears in notebook

**Debug:**
1. Check if `meaningIndex` is being passed in save function
2. Check database - should see multiple rows
3. Verify migration was run successfully

## 📋 Pre-Deployment Checklist

- [ ] Run migration: `add-meaning-index-to-notebook.sql`
- [ ] Verify column exists: `SELECT * FROM information_schema.columns WHERE column_name = 'meaning_index'`
- [ ] Verify constraint updated: Check unique constraint includes `meaning_index`
- [ ] Test single meaning save
- [ ] Test multiple meanings save
- [ ] Test notebook lookup priority
- [ ] Check browser console for errors
- [ ] Verify UI displays meaning index correctly

## 🎯 UI Impact Summary

### Components Updated:
1. ✅ `NotebookItem.tsx` - Shows meaning index: "word (Meaning 1)"
2. ✅ `ResultCard.tsx` - Handles multiple meanings display
3. ✅ `page.tsx` - Saves multiple meanings separately
4. ✅ `storage-supabase.ts` - Handles meaning_index in queries

### No Breaking Changes:
- Existing entries continue to work (meaning_index = NULL)
- UI gracefully handles missing meaning_index
- Backward compatible with old entries

## 📝 Migration Summary

**File:** `add-meaning-index-to-notebook.sql`
**Impact:** Low (backward compatible)
**Downtime:** None (safe migration)
**Rollback:** Possible (see DATABASE_MIGRATION_GUIDE.md)

**Changes:**
1. Adds `meaning_index INTEGER` column (nullable)
2. Updates unique constraint to include meaning_index
3. Creates index for faster lookups
4. Maintains backward compatibility

