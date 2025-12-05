# Login Instructions

## Current Status
You are **not logged in**. That's why:
- ❌ No Admin button appears
- ❌ Can't access `/notebook` and `/study`
- ❌ `/api/debug/auth` shows `authenticated: false`

## Solution: Login First

### Step 1: Check if you have an account

**Option A: You already have an account**
- Go to: `http://localhost:3000/login`
- Enter your email and password
- Click "Login"

**Option B: You need to create an account**
- Go to: `http://localhost:3000/register`
- Enter your email and password
- Click "Register"
- You'll be automatically logged in

### Step 2: After Login

1. **Check navigation bar:**
   - Should see your email/username
   - Should see "Logout" button
   - **If you're admin:** Should see purple "Admin" button

2. **Test protected routes:**
   - Click "Notebook" → Should work now
   - Click "Study" → Should work now
   - Click "Admin" (if visible) → Should show dashboard

3. **Verify admin status:**
   - Visit: `http://localhost:3000/api/debug/auth`
   - Should show: `"authenticated": true`
   - Should show: `"isAdmin": true` (if you set yourself as admin)

### Step 3: If Admin Button Still Not Showing

1. **Verify in database:**
   ```sql
   SELECT email, role FROM public.user_profiles 
   WHERE email = 'your-email@example.com';
   ```
   - Should show: `role = 'admin'`

2. **If role is not 'admin':**
   - Run the admin setup SQL again (see `QUICK_ADMIN_SETUP.sql`)
   - Logout and login again

3. **Check browser console:**
   - Open F12 → Console tab
   - Look for "Admin status: true" log
   - Check for any errors

---

## Quick Test Flow

1. ✅ **Login/Register** → `http://localhost:3000/login` or `/register`
2. ✅ **Check navigation** → Should see your email and logout button
3. ✅ **Check admin button** → Should appear if you're admin
4. ✅ **Test `/notebook`** → Should load (not redirect)
5. ✅ **Test `/study`** → Should load (not redirect)
6. ✅ **Test `/api/debug/auth`** → Should show `authenticated: true`

---

## Troubleshooting

### "Invalid login credentials"
- Make sure you're using the correct email/password
- If you forgot, you may need to reset password or create a new account

### "Email already registered"
- Use the login page instead of register
- Or use a different email

### Login works but still can't access routes
- Check browser console for errors
- Try logging out and in again
- Check `/api/debug/auth` to verify session

---

## Next Steps After Login

Once logged in:
1. ✅ Verify admin button appears (if you're admin)
2. ✅ Test notebook and study pages
3. ✅ If admin, go to `/admin` dashboard
4. ✅ Upload common words using Data Initiation tool

