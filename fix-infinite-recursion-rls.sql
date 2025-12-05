-- Fix infinite recursion in RLS policies
-- The "Admins can view all profiles" policy was causing infinite recursion
-- because it queries user_profiles to check admin status, which triggers the same policy

-- Step 1: Drop the problematic admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Step 2: Re-enable RLS (if it was disabled)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Keep the simple policies (these work fine)
-- Users can view their own profile - this is the main one we need
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 4: Create a better admin policy that doesn't cause recursion
-- Instead of querying user_profiles, we'll use a function or check differently
-- For now, we'll remove the admin policy and handle admin access differently
-- (Admins can still access via service role in API routes)

-- Note: The "Users can view own profile" policy is sufficient for the Navigation component
-- Admin-specific queries can use service role in API routes

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

