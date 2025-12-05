-- Test RLS policy directly
-- This simulates what the app is trying to do

-- First, check if you can read your own profile as the authenticated user
-- Note: This might not work in SQL Editor (which uses service role)
-- But it shows what the policy should allow

-- Test 1: Check if policy allows reading own profile
SELECT 
  id,
  email,
  role
FROM public.user_profiles
WHERE id = '3bf82e74-2cb0-4665-aa02-ea2e9840cb2c';

-- Test 2: Check what auth.uid() returns (in SQL Editor, this might be null)
SELECT auth.uid() as current_user_id;

-- Test 3: Temporarily disable RLS to test if that's the issue
-- (Only for testing - re-enable after!)
-- ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Test 4: Re-enable RLS after testing
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Test 5: Check if the policy condition works
-- This should return your profile if RLS is working
SELECT 
  id,
  email,
  role,
  (auth.uid() = id) as can_read_own_profile
FROM public.user_profiles
WHERE email = 'hongfeng.wong@gmail.com';

