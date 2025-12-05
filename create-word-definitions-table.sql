-- Create word_definitions table for database-first lookup
-- Run this in Supabase SQL Editor
-- IMPORTANT: This table must be in the public schema

-- Create word_definitions table
CREATE TABLE IF NOT EXISTS public.word_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  
  -- Definition content
  phonetic TEXT, -- Phonetic transcription (音标)
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
  CONSTRAINT unique_approved_definition UNIQUE(word, target_language, native_language, status) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Create user_definition_edits table for user-specific overrides
CREATE TABLE IF NOT EXISTS public.user_definition_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_definition_id UUID NOT NULL REFERENCES public.word_definitions(id) ON DELETE CASCADE,
  
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

-- Create word_definition_proposals table for admin review
CREATE TABLE IF NOT EXISTS public.word_definition_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  
  -- Proposed definition content
  definition_target TEXT NOT NULL,
  definition TEXT NOT NULL,
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
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- User who proposed
  proposed_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_word_definitions_word_lang ON public.word_definitions(word, target_language, native_language);
CREATE INDEX IF NOT EXISTS idx_word_definitions_status ON public.word_definitions(status);
CREATE INDEX IF NOT EXISTS idx_word_definitions_created_by ON public.word_definitions(created_by);
CREATE INDEX IF NOT EXISTS idx_user_definition_edits_user ON public.user_definition_edits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_definition_edits_definition ON public.user_definition_edits(word_definition_id);
CREATE INDEX IF NOT EXISTS idx_word_definition_proposals_status ON public.word_definition_proposals(status);
CREATE INDEX IF NOT EXISTS idx_word_definition_proposals_proposed_by ON public.word_definition_proposals(proposed_by);

-- Enable Row Level Security
ALTER TABLE public.word_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_definition_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_definition_proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for word_definitions
-- Everyone can read approved definitions
DROP POLICY IF EXISTS "Anyone can view approved definitions" ON public.word_definitions;
CREATE POLICY "Anyone can view approved definitions"
  ON public.word_definitions FOR SELECT
  USING (status = 'approved');

-- Users can view their own pending definitions
DROP POLICY IF EXISTS "Users can view own pending definitions" ON public.word_definitions;
CREATE POLICY "Users can view own pending definitions"
  ON public.word_definitions FOR SELECT
  USING (created_by = auth.uid() AND status = 'pending');

-- Admins can view all definitions (using service role check to avoid recursion)
DROP POLICY IF EXISTS "Admins can view all definitions" ON public.word_definitions;
CREATE POLICY "Admins can view all definitions"
  ON public.word_definitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Users can create new definitions
DROP POLICY IF EXISTS "Users can create definitions" ON public.word_definitions;
CREATE POLICY "Users can create definitions"
  ON public.word_definitions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own pending definitions
DROP POLICY IF EXISTS "Users can update own pending definitions" ON public.word_definitions;
CREATE POLICY "Users can update own pending definitions"
  ON public.word_definitions FOR UPDATE
  USING (created_by = auth.uid() AND status = 'pending')
  WITH CHECK (created_by = auth.uid());

-- Admins can approve/reject definitions
DROP POLICY IF EXISTS "Admins can approve definitions" ON public.word_definitions;
CREATE POLICY "Admins can approve definitions"
  ON public.word_definitions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- RLS Policies for user_definition_edits
DROP POLICY IF EXISTS "Users can view own edits" ON public.user_definition_edits;
CREATE POLICY "Users can view own edits"
  ON public.user_definition_edits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own edits" ON public.user_definition_edits;
CREATE POLICY "Users can create own edits"
  ON public.user_definition_edits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own edits" ON public.user_definition_edits;
CREATE POLICY "Users can update own edits"
  ON public.user_definition_edits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own edits" ON public.user_definition_edits;
CREATE POLICY "Users can delete own edits"
  ON public.user_definition_edits FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for word_definition_proposals
-- Users can view their own proposals
DROP POLICY IF EXISTS "Users can view own proposals" ON public.word_definition_proposals;
CREATE POLICY "Users can view own proposals"
  ON public.word_definition_proposals FOR SELECT
  USING (proposed_by = auth.uid());

-- Admins can view all proposals
DROP POLICY IF EXISTS "Admins can view all proposals" ON public.word_definition_proposals;
CREATE POLICY "Admins can view all proposals"
  ON public.word_definition_proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Users can create proposals
DROP POLICY IF EXISTS "Users can create proposals" ON public.word_definition_proposals;
CREATE POLICY "Users can create proposals"
  ON public.word_definition_proposals FOR INSERT
  WITH CHECK (auth.uid() = proposed_by);

-- Admins can update proposals (approve/reject)
DROP POLICY IF EXISTS "Admins can update proposals" ON public.word_definition_proposals;
CREATE POLICY "Admins can update proposals"
  ON public.word_definition_proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

