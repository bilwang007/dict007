-- Add phonetic column to existing word_definitions table
-- Run this in Supabase SQL Editor if the table already exists

ALTER TABLE public.word_definitions 
ADD COLUMN IF NOT EXISTS phonetic TEXT;

-- Add index for phonetic lookups (optional, but can be useful)
CREATE INDEX IF NOT EXISTS idx_word_definitions_phonetic ON public.word_definitions(phonetic) WHERE phonetic IS NOT NULL;

