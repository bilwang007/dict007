# 🚀 Vercel Deployment - Step by Step Guide

This guide will walk you through deploying your AI Dictionary to Vercel in **simple, easy steps**.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] **GitHub account** (or GitLab/Bitbucket)
- [ ] **Vercel account** (free tier works fine)
- [ ] **Supabase project** set up
- [ ] **OpenAI/SiliconFlow API key**
- [ ] **Code pushed to Git repository**

---

## Step 1: Prepare Your Code ✅

### 1.1 Test Local Build

First, make sure your code builds successfully:

```bash
cd "/Users/billwang007/projects/dictionary-zara copy"

# Install dependencies
npm install

# Run type check
npm run type-check

# Build the project
npm run build
```

**✅ Success looks like:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

**❌ If you see errors:** Fix them before deploying.

---

### 1.2 Commit and Push to Git

```bash
# Check what files changed
git status

# Add all changes
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Push to GitHub (or your Git provider)
git push origin main
```

**✅ Verify:** Go to your GitHub repository and confirm all files are pushed.

---

## Step 2: Create Vercel Account & Project 🎯

### 2.1 Sign Up / Log In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** (or **"Log In"** if you have an account)
3. Choose **"Continue with GitHub"** (recommended - easiest)

### 2.2 Import Your Project

1. After logging in, click **"Add New..."** → **"Project"**
2. Find your repository: `dictionary-zara copy` (or your repo name)
3. Click **"Import"**

---

## Step 3: Configure Project Settings ⚙️

### 3.1 Project Configuration

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset:** `Next.js` ✅
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` (auto-detected) ✅
- **Install Command:** `npm install` ✅

**Click "Deploy"** (we'll add environment variables next)

---

## Step 4: Add Environment Variables 🔐

### 4.1 Go to Project Settings

After the first deployment (it will fail without env vars - that's OK):

1. Go to your project dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in the left sidebar

### 4.2 Add Required Variables

Add these **one by one**:

#### **Supabase Variables** (Required)

```
NEXT_PUBLIC_SUPABASE_URL
```
- **Value:** Your Supabase project URL
- **Where to find:** Supabase Dashboard → Settings → API → Project URL
- **Example:** `https://xxxxx.supabase.co`
- **Environment:** Production, Preview, Development (select all)

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- **Value:** Your Supabase anon/public key
- **Where to find:** Supabase Dashboard → Settings → API → anon public
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Environment:** Production, Preview, Development (select all)

```
SUPABASE_SERVICE_ROLE_KEY
```
- **Value:** Your Supabase service role key (for admin operations)
- **Where to find:** Supabase Dashboard → Settings → API → service_role
- **Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Environment:** Production, Preview, Development (select all)
- **⚠️ Important:** Keep this secret! Never expose in client-side code.

#### **OpenAI/SiliconFlow API Key** (Required)

```
OPENAI_API_KEY
```
- **Value:** Your OpenAI or SiliconFlow API key
- **Where to find:** 
  - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  - SiliconFlow: [siliconflow.cn](https://siliconflow.cn)
- **Example:** `sk-xxxxxxxxxxxxx`
- **Environment:** Production, Preview, Development (select all)

#### **Optional: API Base URL** (If using SiliconFlow)

```
API_BASE_URL
```
- **Value:** `https://api.siliconflow.cn/v1` (if using SiliconFlow)
- **Leave empty** if using OpenAI directly
- **Environment:** Production, Preview, Development (select all)

#### **Optional: AI Model** (If using custom model)

```
AI_MODEL
```
- **Value:** Model name (e.g., `deepseek-ai/DeepSeek-V3`)
- **Default:** Uses DeepSeek-V3 if not set
- **Environment:** Production, Preview, Development (select all)

#### **Optional: App URL** (For production)

```
NEXT_PUBLIC_APP_URL
```
- **Value:** Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- **Environment:** Production only

---

## Step 5: Run Database Migration 🗄️

### 5.1 Run Migration in Supabase

Before the app works, you need to run the database migration:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the file: `add-meaning-index-to-notebook.sql`
3. Copy the entire SQL script
4. Paste into Supabase SQL Editor
5. Click **"Run"**

**✅ Verify:** You should see success messages:
```
✅ Migration successful: meaning_index column and unique index added
```

---

## Step 6: Redeploy 🚀

### 6.1 Trigger New Deployment

After adding environment variables:

1. Go to your Vercel project dashboard
2. Click **"Deployments"** tab
3. Click the **"..."** menu on the latest deployment
4. Click **"Redeploy"**
5. Or: Make a small change and push to trigger auto-deploy

**✅ Wait for deployment to complete** (usually 2-5 minutes)

---

## Step 7: Verify Deployment ✅

### 7.1 Check Deployment Status

1. Go to **"Deployments"** tab
2. Look for **green checkmark** ✅ = Success
3. Click on the deployment to see logs

### 7.2 Test Your App

1. Click **"Visit"** button (or use the URL: `https://your-app.vercel.app`)
2. Test these features:
   - [ ] Homepage loads
   - [ ] Can search for a word
   - [ ] Definition appears
   - [ ] Can save to notebook
   - [ ] Can generate images
   - [ ] Login works (if implemented)

---

## Step 8: Custom Domain (Optional) 🌐

### 8.1 Add Custom Domain

1. Go to **Settings** → **Domains**
2. Enter your domain (e.g., `dictionary.yourdomain.com`)
3. Follow Vercel's DNS instructions
4. Wait for DNS propagation (5-60 minutes)

---

## 🔧 Troubleshooting

### Build Fails

**Error:** `Module not found` or `Type errors`
- **Fix:** Run `npm install` locally and commit `package-lock.json`
- **Fix:** Check `npm run build` works locally first

**Error:** `Environment variable not found`
- **Fix:** Double-check all env vars are added in Vercel Settings
- **Fix:** Make sure you selected all environments (Production, Preview, Development)

### App Works But API Calls Fail

**Error:** `401 Unauthorized` or `Failed to fetch`
- **Fix:** Check Supabase URL and keys are correct
- **Fix:** Verify Supabase RLS policies allow public access (if needed)
- **Fix:** Check browser console for CORS errors

**Error:** `OpenAI API error` or `Rate limit exceeded`
- **Fix:** Verify `OPENAI_API_KEY` is correct
- **Fix:** Check API key has credits/quota
- **Fix:** Verify `API_BASE_URL` is set if using SiliconFlow

### Database Errors

**Error:** `column 'meaning_index' does not exist`
- **Fix:** Run the migration script in Supabase SQL Editor
- **Fix:** Verify migration completed successfully

**Error:** `relation "notebook_entries" does not exist`
- **Fix:** Check if tables exist in Supabase
- **Fix:** Run initial database setup if needed

---

## 📊 Monitoring & Logs

### View Logs

1. Go to **Deployments** → Click on a deployment
2. Click **"Functions"** tab to see API route logs
3. Click **"Runtime Logs"** for server-side logs

### Check Function Performance

1. Go to **Analytics** tab
2. View:
   - Function invocations
   - Function duration
   - Error rates

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] ✅ Homepage loads without errors
- [ ] ✅ Word lookup works
- [ ] ✅ Definitions appear correctly
- [ ] ✅ Multiple meanings display properly
- [ ] ✅ Images can be generated
- [ ] ✅ Notebook save/load works
- [ ] ✅ Login/authentication works (if implemented)
- [ ] ✅ No console errors in browser
- [ ] ✅ No errors in Vercel logs

---

## 🔄 Updating Your App

### Automatic Deployments

Vercel automatically deploys when you push to:
- **`main` branch** → Production
- **Other branches** → Preview deployments

### Manual Deployment

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Vercel automatically deploys (watch in dashboard)

---

## 📚 Additional Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Vercel Logs:** Deployments → Your deployment → Functions/Logs
2. **Check Browser Console:** F12 → Console tab
3. **Verify Environment Variables:** Settings → Environment Variables
4. **Test Locally First:** Make sure `npm run build` works

---

**🎊 Congratulations!** Your AI Dictionary is now live on Vercel!

Your app URL: `https://your-project-name.vercel.app`

