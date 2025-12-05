# Database Setup Guide

## Why This Guide?

This guide ensures all required database tables are created before using the application. Running features that depend on missing tables will cause 404 errors and broken functionality.

## Quick Setup (Recommended)

**Run this single script to create all tables at once:**

1. Go to Supabase Dashboard → SQL Editor
2. Open the file: `SETUP_ALL_TABLES.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click "Run"

This will create all 7 required tables:
- ✅ `user_profiles` - User accounts and roles
- ✅ `word_definitions` - Shared dictionary (curated)
- ✅ `notebook_entries` - Personal notebook (user-specific)
- ✅ `stories` - Generated stories
- ✅ `word_comments` - User comments on words
- ✅ `user_definition_edits` - User customizations
- ✅ `word_definition_proposals` - Admin review system

## Individual Table Setup (Alternative)

If you prefer to set up tables individually, run these scripts in order:

1. `create-user-profiles-table.sql` (or use `QUICK_ADMIN_SETUP.sql`)
2. `create-word-definitions-table.sql`
3. `create-notebook-tables.sql`
4. `create-word-comments-table.sql`

## Verification

After running the setup script, verify tables exist:

1. Go to Supabase Dashboard → Table Editor
2. You should see all 7 tables listed

## Common Issues

### 404 Errors
- **Symptom**: "Failed to load resource: 404"
- **Cause**: Table doesn't exist
- **Fix**: Run `SETUP_ALL_TABLES.sql`

### Syntax Errors
- **Symptom**: "syntax error at or near..."
- **Cause**: Invalid SQL syntax
- **Fix**: Check for trailing commas, missing quotes, or comments in wrong places

### Permission Errors
- **Symptom**: "permission denied"
- **Cause**: RLS policies blocking access
- **Fix**: Ensure you're logged in and RLS policies are created correctly

## Best Practices

1. **Always run setup scripts** before testing new features
2. **Use `SETUP_ALL_TABLES.sql`** for initial setup
3. **Check Table Editor** to verify tables exist
4. **Read error messages** carefully - they usually indicate which table is missing

## Notes

- All scripts use `IF NOT EXISTS` so they're safe to run multiple times
- RLS (Row Level Security) is enabled on all tables for data privacy
- Indexes are created for performance
- Foreign key constraints ensure data integrity

