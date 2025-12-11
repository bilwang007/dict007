# Quick Steps to Connect Vercel for Auto-Deployment

## The Issue
Your code is pushed to GitHub, but Vercel isn't deploying automatically. This means the repository isn't connected to Vercel yet.

## Quick Fix: Connect Repository in Vercel Dashboard

### Step-by-Step:

1. **Go to Vercel Dashboard**
   👉 https://vercel.com/dashboard

2. **Click "Add New..." → "Project"**

3. **Import Repository**
   - Select **"Import Git Repository"**
   - If GitHub isn't connected, click "Connect GitHub"
   - Authorize Vercel to access your repositories

4. **Select Your Repository**
   - Search for: `dict007` or `bilwang007/dict007`
   - Click **"Import"**

5. **Configure (Use Defaults)**
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. **Add Environment Variables** (IMPORTANT!)
   Before clicking "Deploy", add these:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   ```

7. **Click "Deploy"**

---

## After Connection

Once connected, **every push to GitHub will automatically trigger a deployment**! 🎉

You can verify by:
- Making a small change
- Pushing to GitHub
- Watching Vercel dashboard - new deployment should start automatically

---

## If Project Already Exists in Vercel

If you already have the project in Vercel but it's not connected:

1. Go to your project in Vercel dashboard
2. Go to **Settings** → **Git**
3. Click **"Connect Git Repository"**
4. Select your repository
5. Choose branch (usually `main`)

---

**Need help? Let me know what you see in the Vercel dashboard!**

