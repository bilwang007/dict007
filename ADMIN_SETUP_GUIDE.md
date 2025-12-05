# Admin Setup Guide

## 🎯 Quick Start

1. **Register a user account** at `/register`
2. **Set user as admin** in Supabase (see Step 2 below)
3. **Login** and access admin dashboard at `/admin`
4. **Upload common words** using Data Initiation tool

---

## How to Set Up Administrator Account

### Step 1: Create a User Account

1. Go to: http://localhost:3000/register
2. Register with your email and password
3. Complete the registration

### Step 2: Create user_profiles Table (REQUIRED - Do This First!)

**⚠️ CRITICAL:** You MUST create the `user_profiles` table BEFORE setting admin role. If you get an error "relation does not exist", you need to run this step first.

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the ENTIRE script below (or open `create-user-profiles-table.sql` file):

```sql
-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migrate existing users (if any)
INSERT INTO public.user_profiles (id, email, role)
SELECT id, email, 'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;
```

4. Click **Run** to execute
5. You should see: "Success. No rows returned" or similar success message
6. **Verify the table exists:** Go to **Table Editor** → You should now see `user_profiles` table

### Step 3: Set User as Admin

**⚠️ IMPORTANT:** Only proceed to this step AFTER Step 2 is complete and you've verified the `user_profiles` table exists!

After the table is created, you can set a user as admin using **SQL Editor** (recommended if Table Editor is read-only):

#### Option A: Using SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this SQL (replace `your-email@example.com` with your actual email):

```sql
-- First, make sure the user has a profile
INSERT INTO public.user_profiles (id, email, role)
SELECT id, email, 'user'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;

-- Then set them as admin
UPDATE public.user_profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

4. Click **Run** to execute

#### Option B: Using Table Editor (If Writable)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → `user_profiles`
3. Find your user by email (or create a new row if it doesn't exist)
4. Set the `id` field to your user's UUID (from `auth.users`)
5. Set the `email` field to your email
6. Set the `role` field to `admin`
7. Save the changes

#### Option C: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db execute "
UPDATE public.user_profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
"
```

### Step 4: Verify Admin Access

1. Logout (if logged in)
2. Login with your admin account
3. You should see admin tools in the navigation or go to: http://localhost:3000/admin
4. You should see the Admin Dashboard

### Step 5: Change Admin Password

To change your password:

1. Login to your admin account
2. Go to: http://localhost:3000/profile
3. Use Supabase's password reset feature, or:
4. In Supabase Dashboard → **Authentication** → **Users**
5. Find your user and click **Reset Password**

---

## Admin Tools Overview

### 1. Admin Dashboard (`/admin`)
- Overview of system statistics
- Quick access to all admin tools
- Shows: Total words, users, pending reviews, searches

### 2. Data Initiation (`/admin/data-initiation`)
- **Purpose**: Bulk upload word definitions to the database
- **Use Case**: Upload 2000 common words for fast database lookups
- **Features**:
  - Upload JSON file with word definitions
  - Download template to see expected format
  - Progress tracking during upload
  - Auto-approval of bulk uploaded words
  - Duplicate detection and skipping

### 3. Review Definitions (`/admin/definitions`)
- **Purpose**: Review and approve/reject pending word definitions
- **Features**:
  - View all pending definitions
  - See who proposed each definition
  - Approve or reject definitions
  - Only one approved definition per word+language pair

### 4. User Management (`/admin/users`)
- **Purpose**: View and manage user accounts
- **Features**:
  - View all users
  - See user roles (admin/user)
  - View join dates
  - See last login status
  - Search and filter users

### 5. Analytics & Traffic (`/admin/analytics`)
- **Purpose**: Track system usage and traffic
- **Features**:
  - Total searches count
  - Unique users count
  - Daily/weekly search statistics
  - Most searched words
  - Traffic trends

---

## Data Initiation: Bulk Upload Common Words

### Step 1: Prepare Your Data

1. Go to `/admin/data-initiation`
2. Click **Download Template** to see the expected JSON format
3. Prepare your JSON file with word definitions

### Example JSON Format:

```json
[
  {
    "word": "hello",
    "definitionTarget": "A greeting used when meeting someone",
    "definition": "见面时的问候语",
    "exampleSentence1": "Hello, how are you?",
    "exampleTranslation1": "你好，你好吗？",
    "exampleSentence2": "She said hello to everyone",
    "exampleTranslation2": "她向每个人问好",
    "usageNote": "Common greeting, very friendly",
    "isValidWord": true
  },
  {
    "word": "world",
    "definitionTarget": "The earth and all its inhabitants",
    "definition": "地球及其所有居民",
    "exampleSentence1": "The world is beautiful",
    "exampleTranslation1": "世界是美丽的",
    "exampleSentence2": "People from around the world",
    "exampleTranslation2": "来自世界各地的人们",
    "usageNote": "Refers to the entire planet",
    "isValidWord": true
  }
]
```

### Step 2: Upload Your Data

1. Select your JSON file
2. Choose target language and native language
3. Click **Upload Definitions**
4. Monitor progress in real-time
5. Review the upload log for any errors

### Step 3: Verify Upload

1. Go to `/admin` dashboard
2. Check the "Total Words" statistic
3. Try searching for one of the uploaded words
4. It should return instantly from the database!

---

## Tips for Bulk Upload

1. **Start Small**: Test with 10-20 words first
2. **Check Format**: Use the template to ensure correct format
3. **Language Consistency**: Make sure all words use the same language pair
4. **Common Words First**: Upload the most commonly searched words
5. **Monitor Progress**: Watch the log for any errors
6. **Duplicate Handling**: Duplicate words are automatically skipped

---

## Security Notes

- Only users with `role = 'admin'` in `user_profiles` can access admin tools
- Admin tools are protected by middleware
- All admin API endpoints verify admin status
- Regular users cannot access admin routes

---

## Troubleshooting

### Can't Access Admin Dashboard

1. **Check your role**: Make sure `role = 'admin'` in `user_profiles` table
2. **Logout and login again**: Session might need refresh
3. **Check Supabase connection**: Verify environment variables are set

### Bulk Upload Fails

1. **Check JSON format**: Use the template as reference
2. **Check file size**: Very large files might timeout
3. **Check server logs**: Look for specific error messages
4. **Try smaller batches**: Upload in smaller chunks

### Users Not Showing

1. **Check Supabase permissions**: Make sure RLS policies allow admin access
2. **Check API response**: Look at browser console for errors
3. **Verify admin status**: Ensure you're logged in as admin

---

## Next Steps

After setting up admin:

1. ✅ Upload common words (2000+ words recommended)
2. ✅ Review pending definitions
3. ✅ Monitor user activity
4. ✅ Track system usage

Your dictionary will now be much faster with database-first lookups! 🚀

