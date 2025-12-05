-- Verify all policies are correct
-- Run this to see the complete policy details including WITH CHECK

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Expected result:
-- 1. "Users can insert own profile" - INSERT with WITH CHECK (auth.uid() = id)
-- 2. "Users can update own profile" - UPDATE with USING and WITH CHECK (auth.uid() = id)
-- 3. "Users can view own profile" - SELECT with USING (auth.uid() = id)
-- 
-- The "Admins can view all profiles" policy should NOT exist (that's the recursive one we removed)

