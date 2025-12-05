# Step-by-Step Setup Guide

Follow these steps to run the AI Dictionary app:

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js 18+ installed
- ✅ npm or yarn installed
- ✅ OpenAI API key

## Step 1: Check Node.js Installation

Open your terminal and run:
```bash
node --version
npm --version
```

**Expected output:** Should show version numbers like:
```
v18.17.0
9.6.7
```

**If not installed:**
- Download from: https://nodejs.org/
- Or install via Homebrew (macOS): `brew install node`

---

## Step 2: Install Dependencies

Navigate to the project directory:
```bash
cd "/Users/billwang007/projects/dictionary-zara copy"
```

Install all required packages:
```bash
npm install
```

**What this does:**
- Downloads and installs all dependencies from `package.json`
- Creates `node_modules` folder with all packages
- Takes 1-3 minutes depending on your internet speed

**Expected output:**
```
added 350 packages in 45s
```

**Troubleshooting:**
- If you get permission errors, try: `sudo npm install`
- If you get network errors, check your internet connection
- If npm is slow, try: `npm install --legacy-peer-deps`

---

## Step 3: Create Environment File

Create a file named `.env.local` in the project root:

**Option A: Using terminal**
```bash
cd "/Users/billwang007/projects/dictionary-zara copy"
cat > .env.local << 'EOF'
OPENAI_API_KEY=your-api-key-here
EOF
```

**Option B: Using text editor**
1. Open the project folder in your text editor
2. Create a new file called `.env.local` in the root directory
3. Add this line:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```
4. Save the file

**Important:**
- Replace `your-api-key-here` with your actual OpenAI API key
- Get your API key from: https://platform.openai.com/api-keys
- Make sure the file is named exactly `.env.local` (with the dot at the start)
- Never commit this file to git (it should already be in .gitignore)

---

## Step 4: Start the Development Server

Run this command:
```bash
npm run dev
```

**What this does:**
- Starts the Next.js development server
- Compiles TypeScript to JavaScript
- Watches for file changes (auto-reloads)

**Expected output:**
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

**Keep this terminal window open** - the server runs until you stop it (Ctrl+C)

**Troubleshooting:**
- If port 3000 is busy, Next.js will use 3001 automatically
- If you get errors about missing packages, run `npm install` again
- If TypeScript errors appear, check your `.env.local` file

---

## Step 5: Open in Browser

Open your web browser and go to:
```
http://localhost:3000
```

**What you should see:**
- ✅ AI Dictionary title with gradient colors
- ✅ Language selector (Native/Target language dropdowns)
- ✅ Search box to enter words
- ✅ "Notebook" and "Study" buttons in the header

**If you see errors:**
- Check the terminal for error messages
- Make sure `.env.local` has a valid `OPENAI_API_KEY`
- Try refreshing the page (Cmd+R / Ctrl+R)

---

## Step 6: Test the Application

### Test 1: Look Up a Word
1. Select languages (e.g., Native: English, Target: Spanish)
2. Enter a word: "hola"
3. Click "Look Up"
4. Wait 5-10 seconds
5. ✅ Should show definition, image, examples, usage note

### Test 2: Audio Pronunciation
1. After lookup, click the 🔊 audio button
2. ✅ Should hear pronunciation after 1-2 seconds

### Test 3: Save to Notebook
1. After lookup, click "Save to Notebook"
2. ✅ Should see "Saved to notebook!" alert

### Test 4: View Notebook
1. Click "Notebook" button in header
2. ✅ Should see your saved word(s)

### Test 5: Study Mode
1. Click "Study" button in header
2. ✅ Should see flashcards if you have saved words
3. Click card to flip it
4. ✅ Should see flip animation

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for linting errors
npm run lint

# Stop the server (press Ctrl+C in terminal)
```

---

## Common Issues & Solutions

### Issue: "OPENAI_API_KEY is not set"
**Solution:** 
- Check that `.env.local` file exists
- Verify the file has `OPENAI_API_KEY=sk-...`
- Make sure the file is in the project root directory
- Restart the dev server (`npm run dev`)

### Issue: "Cannot find module 'openai'"
**Solution:**
```bash
npm install
```

### Issue: Port 3000 already in use
**Solution:**
- Stop the other application using port 3000
- Or Next.js will automatically use port 3001

### Issue: Images not loading
**Solution:**
- Check you have DALL-E 3 access in OpenAI account
- Verify you have credits in OpenAI account
- Check browser console for errors (F12)

### Issue: Audio not playing
**Solution:**
- Check browser console (F12) for errors
- Verify TTS API is accessible
- Try a different browser

---

## What's Next?

Once the app is running:
1. ✅ Test all features
2. ✅ Look up words in different languages
3. ✅ Save words to notebook
4. ✅ Generate stories
5. ✅ Practice with flashcards

**Need help?** Check the terminal output for error messages and browser console (F12) for client-side errors.

---

## Stopping the Server

When you're done testing:
1. Go to the terminal where `npm run dev` is running
2. Press `Ctrl+C` (or `Cmd+C` on Mac)
3. Server will stop

---

**Setup complete!** 🎉 Your app should now be running at http://localhost:3000

