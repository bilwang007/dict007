# Quick Commands - Copy & Paste

## 📋 Current Status
- ✅ Project files ready
- ⚠️ Need to install dependencies
- ⚠️ Need to configure .env.local

## 🚀 Quick Start (3 Commands)

Open your terminal and run these commands one by one:

### Command 1: Navigate to Project
```bash
cd "/Users/billwang007/projects/dictionary-zara copy"
```

### Command 2: Install Dependencies
```bash
npm install
```
⏱️ Takes 1-3 minutes

### Command 3: Start the Server
```bash
npm run dev
```
⏱️ Takes 10-20 seconds

### Then Open Browser
Go to: **http://localhost:3000**

---

## ⚡ Even Quicker: Use the Script

Instead of running commands manually, use the setup script:

```bash
cd "/Users/billwang007/projects/dictionary-zara copy"
./RUN_ME.sh
```

This script will:
1. ✅ Check if Node.js is installed
2. ✅ Check if npm is installed  
3. ✅ Create/check .env.local file
4. ✅ Install dependencies automatically
5. ✅ Start the development server

---

## 🔑 Setup .env.local

Before running, you need to add your OpenAI API key:

### Option 1: Edit the file
Open `.env.local` in your text editor and replace:
```
OPENAI_API_KEY=your-api-key-here
```
with:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Option 2: Using terminal
```bash
# Open in default editor
open -e .env.local

# Or using nano
nano .env.local
```

### Option 3: Using VS Code
```bash
code .env.local
```

**Get your API key from:** https://platform.openai.com/api-keys

---

## 📝 Step-by-Step Instructions

### Step 1: Check Node.js
```bash
node --version
```
Should show: `v18.x.x` or higher

If not installed: https://nodejs.org/

### Step 2: Navigate to Project
```bash
cd "/Users/billwang007/projects/dictionary-zara copy"
```

### Step 3: Check .env.local
```bash
cat .env.local
```
Should show: `OPENAI_API_KEY=sk-...`

If you see `your-api-key-here`, replace it with your actual key.

### Step 4: Install Dependencies
```bash
npm install
```
Wait for it to finish (1-3 minutes)

### Step 5: Start Server
```bash
npm run dev
```

You should see:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
```

### Step 6: Open Browser
Go to: **http://localhost:3000**

---

## 🛑 Stopping the Server

When you're done testing:
- Press `Ctrl+C` in the terminal
- Or close the terminal window

---

## 🔍 Troubleshooting

### "node: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### "npm: command not found"  
**Solution:** npm comes with Node.js, reinstall Node.js

### "OPENAI_API_KEY is not set"
**Solution:** 
1. Check `.env.local` file exists
2. Make sure it has `OPENAI_API_KEY=sk-...`
3. Restart the server

### "Port 3000 already in use"
**Solution:** 
- Next.js will automatically use port 3001
- Or stop the other app using port 3000

### "Cannot find module '...'"
**Solution:** 
```bash
rm -rf node_modules
npm install
```

---

## ✅ Verification Checklist

Before starting, verify:
- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] In project directory (`pwd` shows correct path)
- [ ] `.env.local` exists with valid API key
- [ ] Ready to run `npm install`
- [ ] Ready to run `npm run dev`

---

## 📚 More Help

- **Detailed Setup:** See `SETUP_STEPS.md`
- **Testing Guide:** See `TESTING.md`
- **Quick Start:** See `QUICK_START.md`

