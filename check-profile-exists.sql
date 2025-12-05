-- Check if your profile exists and what the role is
-- Replace 'hongfeng.wong@gmail.com' with your actual email

-- Check if profile exists
SELECT 
  id,
  email,
  role,
  created_at
FROM public.user_profiles
WHERE email = 'hongfeng.wong@gmail.com';

-- Check if user exists in auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'hongfeng.wong@gmail.com';

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Test if you can read your own profile (run this as the authenticated user)
-- This simulates what the Navigation component is trying to do
SELECT 
  id,
  email,
  role
FROM public.user_profiles
WHERE id = auth.uid();

