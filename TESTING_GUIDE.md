# Testing Guide - Local vs Vercel

## 🎯 Recommendation: Test Locally First, Then Vercel

### Why Test Locally First?
- ✅ **Faster iteration** - See changes instantly
- ✅ **Easier debugging** - Full console access
- ✅ **No deployment needed** - Test before pushing
- ✅ **Free** - No API costs during development

### Why Test on Vercel After?
- ✅ **Production environment** - Real-world conditions
- ✅ **Final verification** - Ensure everything works deployed
- ✅ **Performance testing** - See actual load times

---

## 🏠 Local Testing (Recommended First)

### Step 1: Start Development Server

```bash
cd "/Users/billwang007/projects/dictionary-zara copy"
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### Step 2: Open Browser

Go to: **http://localhost:3000**

### Step 3: Test All 9 Bug Fixes

#### ✅ Bug 1: White Text Fix
- [ ] Open any page with select dropdowns
- [ ] Check that text is visible (dark text on white background)
- [ ] Try language selectors, profile settings

#### ✅ Bug 2: Batch Upload Template
- [ ] Go to Notebook page
- [ ] Click "Batch Upload"
- [ ] Verify "Download CSV Template" link appears
- [ ] Download and check template format

#### ✅ Bug 3: Lookup Speed
- [ ] Search for a word (e.g., "bank")
- [ ] Time the response (should be < 3 seconds)
- [ ] Check browser Network tab for API call timing

#### ✅ Bug 4: Smooth Animation
- [ ] Search for a new word
- [ ] Verify smooth bouncing dots (not jumping spinner)
- [ ] Animation should be consistent

#### ✅ Bug 5: Study Mode
- [ ] Go to Study page
- [ ] Check buttons are closer to card
- [ ] Press **Space** to flip card
- [ ] Press **←** for previous, **→** for next
- [ ] Verify keyboard shortcuts work

#### ✅ Bug 6: Profile Interface Language
- [ ] Go to Profile page
- [ ] Change Interface Language
- [ ] Click Save
- [ ] Verify it saves successfully
- [ ] Refresh page - should persist

#### ✅ Bug 7: Dark Mode
- [ ] Go to Profile page
- [ ] Change Theme to "Dark"
- [ ] Click Save
- [ ] Verify entire app switches to dark mode
- [ ] Try "Auto" mode (should follow system)

#### ✅ Bug 8: Tag Filtering
- [ ] Go to Notebook page
- [ ] Verify filter buttons at top (All, Last 3 Days, etc.)
- [ ] Click "Last 7 Days" - entries should filter
- [ ] Click a custom tag - should filter by tag
- [ ] Check count shows "Showing X of Y entries"

#### ✅ Bug 9: Welcome Page
- [ ] Clear localStorage: `localStorage.removeItem('hasVisitedWelcome')`
- [ ] Refresh page - should show welcome page
- [ ] Or go to `/welcome` directly
- [ ] Click through all 6 steps
- [ ] Verify Help link in navigation works

---

## ☁️ Vercel Testing (After Local Testing)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Fix all 9 bugs: white text, batch upload, speed, animation, study mode, profile, dark mode, tags, welcome"
git push origin main
```

### Step 2: Vercel Auto-Deploys

Vercel will automatically:
- Build your app
- Deploy to production
- Show deployment URL

### Step 3: Test on Vercel

1. **Go to your Vercel dashboard**
2. **Click on your project**
3. **Open the deployment URL** (e.g., `https://your-app.vercel.app`)

### Step 4: Verify Environment Variables

In Vercel Dashboard:
- Go to **Settings** → **Environment Variables**
- Verify all required variables are set:
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (if needed)

### Step 5: Re-test All 9 Bugs

Run through the same checklist as local testing, but on the Vercel URL.

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found" errors locally
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Dark mode not working
**Solution:**
- Check browser console for errors
- Verify `ThemeProvider` is in `layout.tsx`
- Check `tailwind.config.ts` has `darkMode: 'class'`

### Issue: Welcome page not showing
**Solution:**
- Clear localStorage: Open DevTools → Application → Local Storage → Clear
- Or manually: `localStorage.removeItem('hasVisitedWelcome')`

### Issue: Vercel deployment fails
**Solution:**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Check for TypeScript errors: `npm run type-check`

---

## 📊 Testing Checklist

### Local Testing ✅
- [ ] All 9 bugs fixed and working
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All features functional

### Vercel Testing ✅
- [ ] Deployment successful
- [ ] All environment variables set
- [ ] All 9 bugs work on production
- [ ] Performance acceptable
- [ ] No production errors

---

## 🚀 Quick Commands

### Local Development
```bash
# Start dev server
npm run dev

# Type check
npm run type-check

# Build for production (test locally)
npm run build
npm start
```

### Vercel Deployment
```bash
# Push to trigger deployment
git push origin main

# Or deploy manually
vercel --prod
```

---

## 📝 Notes

- **Local testing is faster** - Make changes, see results immediately
- **Vercel testing is final** - Ensures production readiness
- **Test both** - Local for development, Vercel for production verification

---

**Ready to test? Start with local testing first!** 🎯
