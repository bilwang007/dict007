-- ============================================
-- COMPLETE DATABASE SETUP SCRIPT
-- Run this in Supabase SQL Editor to create all required tables
-- ============================================

-- ============================================
-- 1. User Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio TEXT,
  interface_language TEXT DEFAULT 'en',
  preferred_languages TEXT[],
  learning_goals TEXT,
  daily_goal INTEGER DEFAULT 10,
  notifications_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Add bio column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'bio') THEN
    ALTER TABLE public.user_profiles ADD COLUMN bio TEXT;
  END IF;
  
  -- Add interface_language column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'interface_language') THEN
    ALTER TABLE public.user_profiles ADD COLUMN interface_language TEXT DEFAULT 'en';
  END IF;
  
  -- Add preferred_languages column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'preferred_languages') THEN
    ALTER TABLE public.user_profiles ADD COLUMN preferred_languages TEXT[];
  END IF;
  
  -- Add learning_goals column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'learning_goals') THEN
    ALTER TABLE public.user_profiles ADD COLUMN learning_goals TEXT;
  END IF;
  
  -- Add daily_goal column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'daily_goal') THEN
    ALTER TABLE public.user_profiles ADD COLUMN daily_goal INTEGER DEFAULT 10;
  END IF;
  
  -- Add notifications_enabled column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'notifications_enabled') THEN
    ALTER TABLE public.user_profiles ADD COLUMN notifications_enabled BOOLEAN DEFAULT true;
  END IF;
  
  -- Add theme column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_profiles' 
                 AND column_name = 'theme') THEN
    ALTER TABLE public.user_profiles ADD COLUMN theme TEXT DEFAULT 'light';
  END IF;
END $$;

-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. Word Definitions Table (Shared Dictionary)
-- ============================================
CREATE TABLE IF NOT EXISTS public.word_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  phonetic TEXT,
  definition_target TEXT NOT NULL,
  definition TEXT NOT NULL,
  example_sentence_1 TEXT,
  example_sentence_2 TEXT,
  example_translation_1 TEXT,
  example_translation_2 TEXT,
  usage_note TEXT,
  is_valid_word BOOLEAN DEFAULT true,
  suggested_word TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(word, target_language, native_language)
);

-- Indexes for word_definitions
CREATE INDEX IF NOT EXISTS idx_word_definitions_word ON word_definitions(word, target_language, native_language);
CREATE INDEX IF NOT EXISTS idx_word_definitions_status ON word_definitions(status);
CREATE INDEX IF NOT EXISTS idx_word_definitions_created_by ON word_definitions(created_by);

-- RLS for word_definitions
ALTER TABLE word_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved definitions" ON word_definitions;
CREATE POLICY "Anyone can view approved definitions"
  ON word_definitions FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Admins can manage all definitions" ON word_definitions;
CREATE POLICY "Admins can manage all definitions"
  ON word_definitions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- 3. Notebook Entries Table (Personal Notebook)
-- ============================================
CREATE TABLE IF NOT EXISTS public.notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  phonetic TEXT,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  definition TEXT NOT NULL,
  definition_target TEXT,
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
  UNIQUE(user_id, word, target_language, native_language)
);

-- Indexes for notebook_entries
CREATE INDEX IF NOT EXISTS idx_notebook_entries_user_id ON notebook_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_word ON notebook_entries(word, target_language, native_language);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_tags ON notebook_entries USING GIN(tags);

-- RLS for notebook_entries
ALTER TABLE notebook_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notebook entries" ON notebook_entries;
CREATE POLICY "Users can view own notebook entries"
  ON notebook_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notebook entries" ON notebook_entries;
CREATE POLICY "Users can insert own notebook entries"
  ON notebook_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notebook entries" ON notebook_entries;
CREATE POLICY "Users can update own notebook entries"
  ON notebook_entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notebook entries" ON notebook_entries;
CREATE POLICY "Users can delete own notebook entries"
  ON notebook_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. Stories Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  words TEXT[] NOT NULL,
  story TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for stories
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- RLS for stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stories" ON stories;
CREATE POLICY "Users can view own stories"
  ON stories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
CREATE POLICY "Users can insert own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. Word Comments Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.word_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_definition_id UUID REFERENCES public.word_definitions(id) ON DELETE CASCADE,
  word TEXT,
  target_language TEXT,
  native_language TEXT,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for word_comments
CREATE INDEX IF NOT EXISTS idx_word_comments_user_id ON word_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_word_comments_word_definition_id ON word_comments(word_definition_id);
CREATE INDEX IF NOT EXISTS idx_word_comments_word ON word_comments(word, target_language, native_language);

-- Unique indexes for comments
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_word_definition_comment 
  ON word_comments(word_definition_id, user_id) 
  WHERE word_definition_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_user_word_direct_comment 
  ON word_comments(word, target_language, native_language, user_id) 
  WHERE word_definition_id IS NULL;

-- RLS for word_comments
ALTER TABLE word_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own comments" ON word_comments;
CREATE POLICY "Users can view own comments"
  ON word_comments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own comments" ON word_comments;
CREATE POLICY "Users can insert own comments"
  ON word_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON word_comments;
CREATE POLICY "Users can update own comments"
  ON word_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON word_comments;
CREATE POLICY "Users can delete own comments"
  ON word_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. User Definition Edits Table (Optional - for user customizations)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_definition_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_definition_id UUID NOT NULL REFERENCES public.word_definitions(id) ON DELETE CASCADE,
  definition_target TEXT,
  definition TEXT,
  example_sentence_1 TEXT,
  example_sentence_2 TEXT,
  example_translation_1 TEXT,
  example_translation_2 TEXT,
  usage_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word_definition_id)
);

-- Indexes for user_definition_edits
CREATE INDEX IF NOT EXISTS idx_user_definition_edits_user_id ON user_definition_edits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_definition_edits_word_definition_id ON user_definition_edits(word_definition_id);

-- RLS for user_definition_edits
ALTER TABLE user_definition_edits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own edits" ON user_definition_edits;
CREATE POLICY "Users can view own edits"
  ON user_definition_edits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own edits" ON user_definition_edits;
CREATE POLICY "Users can insert own edits"
  ON user_definition_edits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own edits" ON user_definition_edits;
CREATE POLICY "Users can update own edits"
  ON user_definition_edits FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own edits" ON user_definition_edits;
CREATE POLICY "Users can delete own edits"
  ON user_definition_edits FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. Word Definition Proposals Table (Optional - for admin review)
-- ============================================
CREATE TABLE IF NOT EXISTS public.word_definition_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  phonetic TEXT,
  definition_target TEXT NOT NULL,
  definition TEXT NOT NULL,
  example_sentence_1 TEXT,
  example_sentence_2 TEXT,
  example_translation_1 TEXT,
  example_translation_2 TEXT,
  usage_note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for word_definition_proposals
CREATE INDEX IF NOT EXISTS idx_word_definition_proposals_user_id ON word_definition_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_word_definition_proposals_status ON word_definition_proposals(status);

-- RLS for word_definition_proposals
ALTER TABLE word_definition_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own proposals" ON word_definition_proposals;
CREATE POLICY "Users can view own proposals"
  ON word_definition_proposals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all proposals" ON word_definition_proposals;
CREATE POLICY "Admins can view all proposals"
  ON word_definition_proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can insert proposals" ON word_definition_proposals;
CREATE POLICY "Users can insert proposals"
  ON word_definition_proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update proposals" ON word_definition_proposals;
CREATE POLICY "Admins can update proposals"
  ON word_definition_proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ All tables created successfully!';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  1. user_profiles';
  RAISE NOTICE '  2. word_definitions';
  RAISE NOTICE '  3. notebook_entries';
  RAISE NOTICE '  4. stories';
  RAISE NOTICE '  5. word_comments';
  RAISE NOTICE '  6. user_definition_edits';
  RAISE NOTICE '  7. word_definition_proposals';
END $$;

