# Database Architecture Guide

## 🏗️ Proper Database Structure

This guide ensures the database schema is **correct, robust, and follows best practices** - not workarounds in code.

## 📋 Current Schema Issues

### ❌ Problems Found:
1. **Missing `meaning_index` column** - Required for multiple meanings feature
2. **Incorrect UNIQUE constraint** - Doesn't allow multiple meanings
3. **Missing validation constraints** - No data integrity checks
4. **Missing indexes** - Performance issues for lookups
5. **No trigger for `updated_at`** - Manual timestamp management

## ✅ Correct Schema

### Complete Table Structure

The `notebook_entries` table should have:

```sql
CREATE TABLE public.notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  phonetic TEXT,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  definition TEXT NOT NULL,
  definition_target TEXT,
  meaning_index INTEGER,  -- ← REQUIRED for multiple meanings
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
  
  -- Proper unique constraint including meaning_index
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
```

## 🔧 Migration Strategy

### Option 1: Update Existing Table (Recommended)
**File:** `migrate_to_complete_schema.sql`

- ✅ Safe migration for existing data
- ✅ Adds missing column
- ✅ Updates constraints
- ✅ Adds indexes
- ✅ Adds validation
- ✅ Preserves all existing data

### Option 2: Create Fresh Table
**File:** `notebook_entries_complete_schema.sql`

- ⚠️ Use only for new installations
- ⚠️ Will drop existing table (data loss!)
- ✅ Complete, correct schema from start

## 📊 Required Indexes

For optimal performance:

```sql
-- User lookups
CREATE INDEX idx_notebook_entries_user_id ON notebook_entries(user_id);

-- Word lookups (most common query)
CREATE INDEX idx_notebook_entries_word_lookup 
  ON notebook_entries(user_id, word, target_language, native_language);

-- Multiple meanings lookups
CREATE INDEX idx_notebook_entries_meaning_index 
  ON notebook_entries(user_id, word, target_language, native_language, meaning_index)
  WHERE meaning_index IS NOT NULL;

-- Tag filtering
CREATE INDEX idx_notebook_entries_tags 
  ON notebook_entries USING GIN(tags);

-- Sorting
CREATE INDEX idx_notebook_entries_created_at 
  ON notebook_entries(created_at DESC);
```

## 🔒 Row Level Security (RLS)

Proper RLS policies:

```sql
-- Users can only access their own entries
CREATE POLICY "Users can view own notebook entries"
  ON notebook_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notebook entries"
  ON notebook_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notebook entries"
  ON notebook_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notebook entries"
  ON notebook_entries FOR DELETE
  USING (auth.uid() = user_id);
```

## ⚡ Automatic Timestamps

Trigger for `updated_at`:

```sql
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
```

## ✅ Data Integrity

### Validation Constraints

1. **meaning_index**: Must be positive if not NULL
2. **word**: Cannot be empty
3. **languages**: Must be 2-5 characters (valid language codes)

These constraints ensure data quality at the database level, not just in application code.

## 🚀 Migration Steps

### Step 1: Backup (IMPORTANT!)
```sql
-- Create backup table
CREATE TABLE notebook_entries_backup AS 
SELECT * FROM notebook_entries;
```

### Step 2: Run Migration
```sql
-- In Supabase SQL Editor, run:
-- migrate_to_complete_schema.sql
```

### Step 3: Verify
```sql
-- Check column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notebook_entries' 
  AND column_name = 'meaning_index';

-- Check constraint exists
SELECT conname 
FROM pg_constraint 
WHERE conname = 'notebook_entries_user_word_lang_meaning_unique';

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'notebook_entries';
```

## 🎯 Architecture Principles

### ✅ DO:
- Fix schema at database level
- Use proper constraints for data integrity
- Create indexes for performance
- Use triggers for automatic updates
- Validate data at database level

### ❌ DON'T:
- Work around missing columns in code
- Handle validation only in application
- Skip indexes for common queries
- Manually manage timestamps
- Ignore database-level constraints

## 📝 Code Changes

After running migration, the code:
- ✅ Assumes correct schema exists
- ✅ Throws clear errors if schema is wrong
- ✅ No workarounds or fallbacks
- ✅ Relies on database constraints
- ✅ Clean, maintainable code

## 🔍 Verification Checklist

- [ ] `meaning_index` column exists
- [ ] Unique constraint includes `meaning_index`
- [ ] All validation constraints exist
- [ ] All indexes created
- [ ] RLS policies enabled
- [ ] Trigger for `updated_at` works
- [ ] Code runs without errors
- [ ] Multiple meanings save correctly
- [ ] Queries are fast (use indexes)

## 📚 Files Reference

1. **`notebook_entries_complete_schema.sql`** - Complete schema (new installations)
2. **`migrate_to_complete_schema.sql`** - Migration script (existing databases)
3. **`DATABASE_ARCHITECTURE_GUIDE.md`** - This file

---

**Remember:** Fix the database structure properly, don't work around it in code!

