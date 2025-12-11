# Push to GitHub - Quick Guide

## Current Issue
Git needs authentication to push. You have 2 options:

---

## Option 1: Use Personal Access Token (Recommended)

### Step 1: Get Token
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Name it: "Vercel Deployment"
4. Check ✅ **`repo`** scope
5. Click **"Generate token"**
6. **Copy the token** (starts with `ghp_...`)

### Step 2: Push with Token

Run this command, and when prompted:
- **Username:** `bilwang007`
- **Password:** Paste your token (NOT your GitHub password)

```bash
cd "/Users/billwang007/projects/dictionary-zara copy"
git push -u origin main
```

---

## Option 2: Use Token in URL (One-Time)

If you have the token, you can embed it in the URL:

```bash
cd "/Users/billwang007/projects/dictionary-zara copy"

# Replace YOUR_TOKEN with your actual token
git remote set-url origin https://YOUR_TOKEN@github.com/bilwang007/dict007.git

# Now push (no authentication prompt)
git push -u origin main

# After push, remove token from URL for security
git remote set-url origin https://github.com/bilwang007/dict007.git
```

---

## Option 3: Use GitHub Desktop

1. Download: https://desktop.github.com
2. Sign in
3. File → Add Local Repository
4. Select your project folder
5. Click "Publish repository"

---

## Quick Steps

1. **Get token:** https://github.com/settings/tokens
2. **Run:** `git push -u origin main`
3. **Enter:** Username = `bilwang007`, Password = your token

---

**After successful push, proceed to Vercel deployment!** 🚀

