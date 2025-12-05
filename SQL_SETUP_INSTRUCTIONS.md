# SQL Setup Instructions

## ⚠️ Important: Run SQL Files, NOT TypeScript Files

If you see an error like:
```
ERROR: 42601: syntax error at or near "'use client'"
```

You accidentally copied a **TypeScript file** (`.tsx` or `.ts`) instead of a **SQL file** (`.sql`).

## ✅ Correct Steps:

### Step 1: Open the SQL File
Open the file: **`create-word-definitions-table.sql`**

### Step 2: Copy ONLY the SQL Content
- The file should start with `-- Create word_definitions table`
- It should NOT start with `'use client'` or `import` statements
- Copy the entire content of the `.sql` file

### Step 3: Run in Supabase SQL Editor
1. Go to Supabase Dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Paste the SQL content
5. Click **Run** (or press Cmd/Ctrl + Enter)

## 📋 Files to Run (in order):

1. **`create-word-definitions-table.sql`** - Creates word definitions tables
2. **`update-user-profiles-schema.sql`** - Adds new profile fields (if not already run)

## 🔍 How to Verify:

After running the SQL, you should see:
- ✅ "Success. No rows returned" (this is normal for CREATE TABLE statements)
- ✅ No error messages

If you see errors, check:
- Did you copy the entire SQL file?
- Does it start with `--` (SQL comments) or `CREATE TABLE`?
- Are you in the Supabase SQL Editor (not a code editor)?

