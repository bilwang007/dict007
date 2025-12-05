-- Add phonetic column to notebook_entries table
-- Run this in Supabase SQL Editor

ALTER TABLE public.notebook_entries 
ADD COLUMN IF NOT EXISTS phonetic TEXT;

