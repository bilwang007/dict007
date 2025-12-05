-- Step 1: Check if your profile exists
SELECT 
  id,
  email,
  role,
  created_at
FROM public.user_profiles
WHERE email = 'hongfeng.wong@gmail.com';

-- Step 2: If profile doesn't exist or role is wrong, fix it
-- This will create the profile if it doesn't exist, or update the role if it does
INSERT INTO public.user_profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'hongfeng.wong@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Step 3: Verify it worked
SELECT 
  id,
  email,
  role,
  created_at
FROM public.user_profiles
WHERE email = 'hongfeng.wong@gmail.com';

-- Step 4: Test RLS - This should return your profile (if run as authenticated user)
-- Note: This might not work in SQL Editor, but it's what the app is trying to do
SELECT 
  id,
  email,
  role
FROM public.user_profiles
WHERE id = auth.uid();

