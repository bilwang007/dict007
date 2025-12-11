# Connect GitHub to Vercel for Auto-Deployment

## Problem
Pushing to GitHub doesn't automatically trigger Vercel deployment.

## Solution: Connect Your GitHub Repository

### Option 1: Connect from Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard

2. **Import Your Project**
   - Click **"Add New..."** → **"Project"**
   - Click **"Import Git Repository"**
   - Select **GitHub** as your Git provider
   - **If not connected:**
     - Click "Connect GitHub Account"
     - Authorize Vercel to access your GitHub repositories
   
3. **Select Your Repository**
   - Search for: `bilwang007/dict007`
   - Click **"Import"**

4. **Configure Project**
   - **Project Name:** `dict007` (or any name you prefer)
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

5. **Add Environment Variables** (Before deploying!)
   - Add these in the "Environment Variables" section:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     OPENAI_API_KEY=your_openai_key
     ```

6. **Deploy**
   - Click **"Deploy"**
   - Wait for deployment to complete (2-5 minutes)

### Option 2: Use Vercel CLI (Alternative)

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link project (in your project directory)
cd "/Users/billwang007/projects/dictionary-zara copy"
vercel link

# Deploy
vercel --prod
```

---

## After Connecting: Verify Auto-Deployment

1. **Make a small change:**
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "Test auto-deployment"
   git push origin main
   ```

2. **Check Vercel Dashboard:**
   - You should see a new deployment starting automatically
   - This confirms auto-deployment is working

---

## Troubleshooting

### Issue: "Repository not found"
- **Solution:** Make sure Vercel has access to your GitHub repositories
- Go to: https://github.com/settings/installations
- Find Vercel and ensure it has access to your repositories

### Issue: "Build fails"
- **Solution:** Check build logs in Vercel dashboard
- Make sure all environment variables are set
- Verify `package.json` has correct build scripts

### Issue: "No deployments showing"
- **Solution:** 
  1. Check if project exists in Vercel dashboard
  2. Verify GitHub integration is enabled
  3. Check project settings → Git → Connected Repository

---

## Quick Steps Summary

1. ✅ Go to https://vercel.com/dashboard
2. ✅ Click "Add New" → "Project"
3. ✅ Import `bilwang007/dict007` repository
4. ✅ Add environment variables
5. ✅ Deploy
6. ✅ Verify auto-deployment works

---

**Once connected, every push to `main` branch will automatically trigger a new deployment!** 🚀

