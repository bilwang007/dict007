# Setup Database Properly - Step by Step

## 🎯 Goal
Set up the database with **correct, robust architecture** - not code workarounds.

## 📋 Step-by-Step Instructions

### Step 1: Check Current Database State

Run this in Supabase SQL Editor to see what you have:

```sql
-- Check if meaning_index column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'notebook_entries'
  AND column_name = 'meaning_index';

-- Check current constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE conrelid = 'notebook_entries'::regclass;
```

### Step 2: Choose Migration Path

#### Option A: Existing Database (Has Data)
**Use:** `migrate_to_complete_schema.sql`

1. **Backup first!**
```sql
CREATE TABLE notebook_entries_backup AS 
SELECT * FROM notebook_entries;
```

2. **Run migration:**
   - Open Supabase SQL Editor
   - Copy entire contents of `migrate_to_complete_schema.sql`
   - Paste and run
   - Should see: `✅ Migration completed successfully!`

#### Option B: New Database (No Data)
**Use:** `notebook_entries_complete_schema.sql`

1. Open Supabase SQL Editor
2. Copy entire contents of `notebook_entries_complete_schema.sql`
3. Paste and run
4. Table created with complete schema

### Step 3: Verify Schema

Run these verification queries:

```sql
-- 1. Check column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notebook_entries' 
  AND column_name = 'meaning_index';
-- Expected: meaning_index | integer

-- 2. Check unique constraint
SELECT conname 
FROM pg_constraint 
WHERE conname = 'notebook_entries_user_word_lang_meaning_unique';
-- Expected: notebook_entries_user_word_lang_meaning_unique

-- 3. Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'notebook_entries'
  AND indexname LIKE '%meaning%';
-- Expected: idx_notebook_entries_meaning_index

-- 4. Check validation constraints
SELECT conname 
FROM pg_constraint 
WHERE conname LIKE 'check_%';
-- Expected: check_meaning_index_positive, check_word_not_empty, etc.
```

### Step 4: Test the Application

1. **Test Single Meaning:**
   - Look up a word
   - Save to notebook
   - Should work normally

2. **Test Multiple Meanings:**
   - Look up word with multiple meanings (e.g., "bank")
   - Save to notebook
   - Should create separate entries
   - Each shows "(Meaning 1)", "(Meaning 2)", etc.

3. **Test Notebook Lookup:**
   - After saving, search same word
   - Should load from notebook (fast!)
   - Source should show "From Notebook"

## ✅ Expected Results

After migration:
- ✅ `meaning_index` column exists
- ✅ Unique constraint allows multiple meanings
- ✅ Validation constraints enforce data quality
- ✅ Indexes improve query performance
- ✅ Code works without workarounds
- ✅ All features work correctly

## 🐛 Troubleshooting

### Error: "column meaning_index does not exist"
**Solution:** Run `migrate_to_complete_schema.sql`

### Error: "unique constraint violation"
**Solution:** Migration should fix this. If persists, check:
```sql
SELECT conname FROM pg_constraint 
WHERE conrelid = 'notebook_entries'::regclass;
```

### Error: "permission denied"
**Solution:** Ensure you're running as database owner or have ALTER TABLE permissions

## 📚 Files Reference

1. **`migrate_to_complete_schema.sql`** - Migration for existing database
2. **`notebook_entries_complete_schema.sql`** - Complete schema for new database
3. **`DATABASE_ARCHITECTURE_GUIDE.md`** - Architecture principles
4. **`SETUP_DATABASE_PROPERLY.md`** - This file

---

**Remember:** Fix the database properly, then the code will work correctly!

