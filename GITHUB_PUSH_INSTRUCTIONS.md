# Push Code to GitHub - Using Personal Access Token

## Current Status
✅ Remote is configured: `https://github.com/bilwang007/dict007.git`  
❌ Need authentication to push

---

## Option 1: Use Personal Access Token (Recommended)

### Step 1: Create Personal Access Token

1. Go to: [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note:** "Vercel Deployment"
   - **Expiration:** Choose duration (90 days, 1 year, or no expiration)
   - **Scopes:** Check ✅ **`repo`** (full control of private repositories)
4. Click **"Generate token"**
5. **⚠️ IMPORTANT:** Copy the token immediately (you won't see it again!)
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Push Using Token

```bash
cd "/Users/billwang007/projects/dictionary-zara copy"

# When prompted for username: enter your GitHub username (bilwang007)
# When prompted for password: paste the token (not your GitHub password!)
git push -u origin main
```

**Or use token directly in URL:**
```bash
# Replace YOUR_TOKEN with the token you copied
git remote set-url origin https://YOUR_TOKEN@github.com/bilwang007/dict007.git
git push -u origin main
```

---

## Option 2: Use SSH (Alternative)

### Step 1: Check for SSH Key

```bash
ls -la ~/.ssh/id_*.pub
```

If you see a file, you have an SSH key. If not, create one:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter to accept defaults
```

### Step 2: Add SSH Key to GitHub

1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Copy the output
   ```

2. Go to: [github.com/settings/keys](https://github.com/settings/keys)
3. Click **"New SSH key"**
4. Paste your key and save

### Step 3: Change Remote to SSH

```bash
cd "/Users/billwang007/projects/dictionary-zara copy"
git remote set-url origin git@github.com:bilwang007/dict007.git
git push -u origin main
```

---

## Option 3: Use GitHub Desktop (Easiest for Beginners)

1. Download: [desktop.github.com](https://desktop.github.com)
2. Sign in with GitHub
3. File → Add Local Repository
4. Select: `/Users/billwang007/projects/dictionary-zara copy`
5. Click "Publish repository" or "Push origin"

---

## Quick Reference

**Current remote:**
```
origin  https://github.com/bilwang007/dict007.git
```

**To push (after authentication):**
```bash
git push -u origin main
```

---

## Recommendation

**Use Option 1 (Personal Access Token)** - it's the most reliable and works immediately.

After you create the token, run:
```bash
git push -u origin main
```

When prompted:
- **Username:** `bilwang007`
- **Password:** Paste your token (not your GitHub password!)

---

## After Successful Push

Once code is pushed, you can:
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository: `dict007`
4. Follow: `VERCEL_DEPLOY_STEP_BY_STEP.md`

