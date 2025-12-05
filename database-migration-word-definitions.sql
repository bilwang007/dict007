-- Migration: Add word_definitions table for database-first lookup
-- This allows caching definitions and user/admin management

-- Create word_definitions table
CREATE TABLE IF NOT EXISTS word_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  
  -- Definition content
  definition_target TEXT NOT NULL, -- Definition in target language
  definition TEXT NOT NULL, -- Definition in native language
  example_sentence_1 TEXT NOT NULL,
  example_sentence_2 TEXT NOT NULL,
  example_translation_1 TEXT NOT NULL,
  example_translation_2 TEXT NOT NULL,
  usage_note TEXT,
  
  -- Metadata
  image_url TEXT,
  audio_url TEXT,
  is_valid_word BOOLEAN DEFAULT true,
  suggested_word TEXT,
  
  -- Approval system
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- User who created/updated
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one approved definition per word+language pair
  UNIQUE(word, target_language, native_language, status) WHERE status = 'approved'
);

-- Create user_definition_edits table for user-specific overrides
CREATE TABLE IF NOT EXISTS user_definition_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_definition_id UUID NOT NULL REFERENCES word_definitions(id) ON DELETE CASCADE,
  
  -- User's custom definition
  definition_target TEXT,
  definition TEXT,
  example_sentence_1 TEXT,
  example_sentence_2 TEXT,
  example_translation_1 TEXT,
  example_translation_2 TEXT,
  usage_note TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One edit per user per definition
  UNIQUE(user_id, word_definition_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_word_definitions_word_lang ON word_definitions(word, target_language, native_language);
CREATE INDEX IF NOT EXISTS idx_word_definitions_status ON word_definitions(status);
CREATE INDEX IF NOT EXISTS idx_word_definitions_created_by ON word_definitions(created_by);
CREATE INDEX IF NOT EXISTS idx_user_definition_edits_user ON user_definition_edits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_definition_edits_definition ON user_definition_edits(word_definition_id);

-- Enable Row Level Security
ALTER TABLE word_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_definition_edits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for word_definitions
-- Everyone can read approved definitions
DROP POLICY IF EXISTS "Anyone can view approved definitions" ON word_definitions;
CREATE POLICY "Anyone can view approved definitions"
  ON word_definitions FOR SELECT
  USING (status = 'approved');

-- Users can view their own pending definitions
DROP POLICY IF EXISTS "Users can view own pending definitions" ON word_definitions;
CREATE POLICY "Users can view own pending definitions"
  ON word_definitions FOR SELECT
  USING (created_by = auth.uid() AND status = 'pending');

-- Admins can view all definitions
DROP POLICY IF EXISTS "Admins can view all definitions" ON word_definitions;
CREATE POLICY "Admins can view all definitions"
  ON word_definitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Users can create new definitions
DROP POLICY IF EXISTS "Users can create definitions" ON word_definitions;
CREATE POLICY "Users can create definitions"
  ON word_definitions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own pending definitions
DROP POLICY IF EXISTS "Users can update own pending definitions" ON word_definitions;
CREATE POLICY "Users can update own pending definitions"
  ON word_definitions FOR UPDATE
  USING (created_by = auth.uid() AND status = 'pending')
  WITH CHECK (created_by = auth.uid());

-- Admins can approve/reject definitions
DROP POLICY IF EXISTS "Admins can approve definitions" ON word_definitions;
CREATE POLICY "Admins can approve definitions"
  ON word_definitions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policies for user_definition_edits
-- Users can view their own edits
DROP POLICY IF EXISTS "Users can view own edits" ON user_definition_edits;
CREATE POLICY "Users can view own edits"
  ON user_definition_edits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own edits
DROP POLICY IF EXISTS "Users can create own edits" ON user_definition_edits;
CREATE POLICY "Users can create own edits"
  ON user_definition_edits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own edits
DROP POLICY IF EXISTS "Users can update own edits" ON user_definition_edits;
CREATE POLICY "Users can update own edits"
  ON user_definition_edits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own edits
DROP POLICY IF EXISTS "Users can delete own edits" ON user_definition_edits;
CREATE POLICY "Users can delete own edits"
  ON user_definition_edits FOR DELETE
  USING (auth.uid() = user_id);

-- Add role column to user_profiles for admin functionality
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

