# Admin Setup Testing Checklist

## ✅ Pre-Testing Checklist

Before testing, make sure:
- [ ] You've run `QUICK_ADMIN_SETUP.sql` in Supabase SQL Editor
- [ ] You've replaced `your-email@example.com` with your actual email
- [ ] Dev server is running (`npm run dev`)
- [ ] You're logged out (to test fresh login)

---

## 🧪 Test Steps

### Step 1: Verify Database Setup

1. Go to **Supabase Dashboard → SQL Editor**
2. Run this query (replace with your email):

```sql
SELECT 
  u.id,
  u.email,
  up.role,
  up.created_at
FROM auth.users u
LEFT JOIN public.user_profiles up ON u.id = up.id
WHERE u.email = 'your-email@example.com';
```

**Expected Result:**
- Should show your email
- `role` should be `'admin'`
- If `role` is `NULL` or `'user'`, run the admin setup SQL again

---

### Step 2: Test Authentication

1. **Logout** (if logged in)
2. Go to: `http://localhost:3000/login`
3. **Login** with your admin account
4. Check browser console (F12) for:
   - ✅ "Admin status: true" (should appear)
   - ❌ No red error messages

---

### Step 3: Test Debug Endpoint

1. Visit: `http://localhost:3000/api/debug/auth`
2. **Expected JSON response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "your-user-id",
    "email": "your-email@example.com"
  },
  "profile": {
    "id": "your-user-id",
    "email": "your-email@example.com",
    "role": "admin"
  },
  "isAdmin": true
}
```

**If `isAdmin` is `false`:**
- Check the SQL query result from Step 1
- Make sure `role = 'admin'` in database
- Try logging out and in again

---

### Step 4: Test Admin Button

1. After logging in, check the **navigation bar**
2. **Expected:** You should see a purple "Admin" button
3. **If not visible:**
   - Open browser console (F12)
   - Look for "Admin status" logs
   - Check for any errors
   - Refresh the page (Ctrl+R or Cmd+R)

---

### Step 5: Test Protected Routes

#### Test Notebook Access:
1. Click "Notebook" in navigation (or go to `/notebook`)
2. **Expected:** Should load notebook page (even if empty)
3. **If redirected to login:**
   - Check `/api/debug/auth` - is `authenticated: true`?
   - Check browser console for errors
   - Try logging out and in again

#### Test Study Access:
1. Click "Study" in navigation (or go to `/study`)
2. **Expected:** Should load study page
3. **If redirected to login:** Same troubleshooting as above

---

### Step 6: Test Admin Dashboard

1. Click the **"Admin"** button in navigation (or go to `/admin`)
2. **Expected:** Should see Admin Dashboard with:
   - Stats overview (Total Words, Users, etc.)
   - Admin tools cards (Data Initiation, Review Definitions, etc.)
3. **If redirected to login:**
   - Your role might not be set correctly
   - Check Step 1 (database query)

---

## 🔍 Troubleshooting

### Issue: Admin button not showing

**Check:**
1. Browser console (F12) → Look for "Admin status" log
2. Visit `/api/debug/auth` → Check `isAdmin` value
3. Database → Verify `role = 'admin'` in `user_profiles`

**Fix:**
```sql
-- Re-run admin setup
UPDATE public.user_profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

Then logout and login again.

---

### Issue: Can't access /notebook or /study

**Check:**
1. Visit `/api/debug/auth` → Is `authenticated: true`?
2. Browser console → Any errors?
3. Are you actually logged in? (Check navigation for your email)

**Fix:**
- Logout completely
- Clear browser cookies (optional)
- Login again
- Try accessing the routes

---

### Issue: Profile doesn't exist

**Check:**
```sql
SELECT * FROM public.user_profiles WHERE email = 'your-email@example.com';
```

**Fix:**
```sql
-- Create profile manually
INSERT INTO public.user_profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## ✅ Success Criteria

All of these should work:
- [ ] Can login successfully
- [ ] Admin button appears in navigation
- [ ] Can access `/notebook` without redirect
- [ ] Can access `/study` without redirect
- [ ] Can access `/admin` dashboard
- [ ] `/api/debug/auth` shows `isAdmin: true`

---

## 📝 Quick Test Commands

**Check auth status:**
```bash
curl http://localhost:3000/api/debug/auth
```

**Check if server is running:**
```bash
curl http://localhost:3000
```

---

## 🆘 Still Not Working?

If all tests fail, share:
1. Output from `/api/debug/auth`
2. Browser console errors (F12 → Console)
3. Result of SQL query from Step 1
4. Any error messages from server terminal

