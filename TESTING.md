# Testing Guide

## Prerequisites Checklist

Before testing, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] OpenAI API key with credits (for GPT-4 and DALL-E 3)
- [ ] PostgreSQL database (local or cloud like Supabase)

## Step-by-Step Testing Setup

### 1. Install Dependencies

```bash
cd "dictionary-zara copy"
npm install
```

Expected output: All packages installed without errors.

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required
OPENAI_API_KEY=sk-your-actual-api-key-here
DATABASE_URL=postgresql://user:password@host:port/database

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Quick Test for API Key:**
```bash
# Test if your OpenAI key works (replace with your key)
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-your-api-key"
```

### 3. Set Up Database

#### Option A: Using Supabase (Easiest)

1. Go to [supabase.com](https://supabase.com) and create free account
2. Create new project
3. Go to Settings > Database
4. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
5. Add to `.env.local` as `DATABASE_URL`

#### Option B: Local PostgreSQL

```bash
# Install PostgreSQL if not installed
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Start PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
createdb dictionary_db

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://yourusername@localhost:5432/dictionary_db"
```

#### Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

Expected output: Database tables created successfully.

**Verify Database:**
```bash
# Open Prisma Studio to view database
npx prisma studio
```
This opens a GUI at `http://localhost:5555` where you can see your database tables.

### 4. Start Development Server

```bash
npm run dev
```

Expected output:
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

Open your browser to `http://localhost:3000`

## Feature Testing Checklist

### ✅ 1. Language Selection

**Test:**
- [ ] Page loads with language selector
- [ ] Can select native language (defaults to English)
- [ ] Can select target language (defaults to Spanish)
- [ ] Selection persists after page refresh (stored in localStorage)
- [ ] All 10 languages are available:
  - English, Spanish, Mandarin Chinese, Hindi, Arabic
  - Portuguese, Bengali, Russian, Japanese, French

**Expected Result:** Both dropdowns work and save selections.

---

### ✅ 2. Word Lookup

**Test:**
1. Select languages (e.g., Native: English, Target: Spanish)
2. Enter a word in the search box (e.g., "gato" for Spanish)
3. Click "Look Up" button

**Expected Result:**
- [ ] Loading spinner appears
- [ ] Results appear within 5-10 seconds
- [ ] Word is displayed prominently
- [ ] Audio button appears next to the word
- [ ] Definition in native language is shown
- [ ] AI-generated image is displayed
- [ ] 2 example sentences with translations appear
- [ ] Usage note section is displayed (casual, friendly tone)

**Test Words:**
- Spanish: "gato", "hola", "gracias"
- French: "bonjour", "chat", "merci"
- Japanese: "こんにちは" (konnichiwa)

---

### ✅ 3. Audio Pronunciation

**Test:**
1. Look up a word
2. Click the volume icon button next to the word
3. Click volume buttons on example sentences

**Expected Result:**
- [ ] Button shows loading spinner briefly
- [ ] Audio plays clearly (not robotic)
- [ ] Low latency (< 1 second before audio starts)
- [ ] Audio sounds natural
- [ ] Can click multiple times to replay

**Verify:**
- Check browser console (F12) for errors
- Check Network tab to see audio API calls

---

### ✅ 4. Save to Notebook

**Test:**
1. Look up a word
2. Wait for results to load
3. Click "Save to Notebook" button

**Expected Result:**
- [ ] Button shows "Saving..." state
- [ ] Success message appears (or button returns to normal)
- [ ] Word is saved to database

**Verify in Database:**
```bash
npx prisma studio
```
Navigate to `NotebookEntry` table - you should see the saved entry.

---

### ✅ 5. Notebook Page

**Test:**
1. Click "Notebook" button in header
2. Or navigate to `http://localhost:3000/notebook`

**Expected Result:**
- [ ] All saved words are displayed
- [ ] Each entry shows:
  - [ ] Word with audio button
  - [ ] Image (if available)
  - [ ] Definition
  - [ ] Example sentence with translation
  - [ ] Usage note
  - [ ] Delete button
- [ ] Checkbox to select entries
- [ ] "Generate Story" button is visible

**Test Delete:**
- [ ] Click trash icon on an entry
- [ ] Confirm deletion
- [ ] Entry disappears from list

---

### ✅ 6. Story Generation

**Test:**
1. Go to Notebook page
2. Select 3-5 words using checkboxes
3. Click "Generate Story" button

**Expected Result:**
- [ ] Button shows "Generating..." state
- [ ] Story appears after 10-20 seconds
- [ ] Story is in target language
- [ ] Translation appears below
- [ ] Story uses the selected words naturally
- [ ] Story is engaging and memorable

**Verify:**
- Check that selected word IDs are used
- Story makes sense contextually

---

### ✅ 7. Study Mode (Flashcards)

**Test:**
1. Ensure you have at least 3 words in your notebook
2. Click "Study" button in header
3. Or navigate to `http://localhost:3000/study`

**Expected Result:**
- [ ] Flashcard appears
- [ ] Front shows:
  - [ ] Word in target language
  - [ ] Image (if available)
  - [ ] "Tap to flip" instruction
- [ ] Click/tap the card to flip

**Test Flip Animation:**
- [ ] Smooth 3D flip animation (0.6 seconds)
- [ ] Back shows:
  - [ ] Word with audio button
  - [ ] Definition in native language
  - [ ] Example sentence with translation
- [ ] Can flip back and forth smoothly

**Test Navigation:**
- [ ] "Previous" button works
- [ ] "Next" button works
- [ ] Progress bar updates
- [ ] Card counter shows "Card X of Y"
- [ ] "Shuffle" button randomizes cards

---

### ✅ 8. Mobile Responsiveness

**Test:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Test on different screen sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

**Expected Result:**
- [ ] Layout adapts to screen size
- [ ] Buttons are touch-friendly (min 44x44px)
- [ ] Text is readable without zooming
- [ ] Images scale properly
- [ ] Forms are usable on mobile
- [ ] Flashcards work with touch gestures

---

### ✅ 9. Error Handling

**Test Error Cases:**

1. **Invalid API Key:**
   - Set wrong `OPENAI_API_KEY` in `.env.local`
   - Try to look up a word
   - Expected: Error message displayed

2. **Network Error:**
   - Disconnect internet
   - Try to look up a word
   - Expected: Error message displayed

3. **Empty Notebook:**
   - Delete all notebook entries
   - Go to Study page
   - Expected: Message "No flashcards available"

4. **Empty Search:**
   - Click "Look Up" without entering text
   - Expected: Button disabled, no action

---

## Automated Testing Commands

### Check for TypeScript Errors

```bash
npx tsc --noEmit
```

Expected: No errors.

### Run Linter

```bash
npm run lint
```

Expected: No linting errors (or only warnings).

### Build Production Version

```bash
npm run build
```

Expected: Successful build without errors.

---

## Performance Testing

### Test Lookup Speed

1. Open browser DevTools > Network tab
2. Look up a word
3. Check timings:
   - [ ] Definition API call: < 5 seconds
   - [ ] Image generation: < 10 seconds
   - [ ] Total page load: < 15 seconds

### Test Audio Latency

1. Click audio button
2. Measure time from click to audio start
3. Expected: < 1 second latency

### Test Mobile Performance

1. Use Chrome DevTools mobile emulation
2. Test on 3G network throttling
3. Verify pages load reasonably fast

---

## Common Issues and Solutions

### Issue: "Module not found" errors

**Solution:**
```bash
rm -rf node_modules .next
npm install
```

### Issue: Database connection errors

**Solution:**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running (local)
- Test connection string manually
- Run `npx prisma generate` again

### Issue: OpenAI API errors

**Solution:**
- Verify API key is correct
- Check you have credits in OpenAI account
- Verify access to GPT-4 and DALL-E 3 models
- Check API rate limits

### Issue: Images not loading

**Solution:**
- Check `next.config.js` has correct image domains
- Verify DALL-E 3 API is working
- Check browser console for CORS errors

### Issue: Audio not playing

**Solution:**
- Check browser console for errors
- Verify TTS API is accessible
- Test audio API endpoint directly:
  ```bash
  curl -X POST http://localhost:3000/api/audio \
    -H "Content-Type: application/json" \
    -d '{"text":"hello","language":"en"}' \
    --output test.mp3
  ```

---

## Manual Test Scenarios

### Scenario 1: Complete User Flow

1. ✅ Select languages (English → Spanish)
2. ✅ Look up "hola"
3. ✅ Listen to pronunciation
4. ✅ Save to notebook
5. ✅ Look up 2 more words ("gato", "gracias")
6. ✅ Save both to notebook
7. ✅ Go to notebook page
8. ✅ Select all 3 words
9. ✅ Generate story
10. ✅ Go to study mode
11. ✅ Practice with flashcards
12. ✅ Delete one entry from notebook

### Scenario 2: Multiple Languages

1. ✅ Test with different language pairs:
   - English → French
   - English → Japanese
   - Spanish → English
2. ✅ Verify audio uses correct voice for each language
3. ✅ Verify translations are accurate

### Scenario 3: Edge Cases

1. ✅ Look up very long phrases
2. ✅ Look up special characters (Chinese, Japanese, Arabic)
3. ✅ Look up same word multiple times
4. ✅ Try to save duplicate words
5. ✅ Generate story with 1 word (should work)
6. ✅ Generate story with 10+ words (should work)

---

## Testing Checklist Summary

```
Core Features:
[ ] Language selection works
[ ] Word lookup works
[ ] Results display correctly
[ ] Images generate and display
[ ] Audio plays correctly
[ ] Save to notebook works
[ ] Notebook page displays entries
[ ] Story generation works
[ ] Flashcards work with animation
[ ] Study mode navigation works

UI/UX:
[ ] Mobile responsive
[ ] Loading states shown
[ ] Error messages displayed
[ ] Animations smooth
[ ] Colors bright and fun

Performance:
[ ] Lookup < 15 seconds
[ ] Audio latency < 1 second
[ ] Images load properly
[ ] Page navigation fast

Database:
[ ] Entries save correctly
[ ] Entries delete correctly
[ ] Stories save correctly
[ ] Queries work efficiently
```

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Deploy to production (Vercel recommended for Next.js)
2. ✅ Set up production database
3. ✅ Configure environment variables in production
4. ✅ Set up error monitoring (Sentry)
5. ✅ Set up analytics (Google Analytics, etc.)
6. ✅ Test production deployment
7. ✅ Share with users for feedback

---

## Quick Test Script

Save this as `test-quick.sh`:

```bash
#!/bin/bash

echo "🔍 Testing AI Dictionary..."
echo ""

echo "1. Checking Node.js..."
node --version || exit 1

echo "2. Checking dependencies..."
[ -d "node_modules" ] || npm install

echo "3. Checking TypeScript..."
npx tsc --noEmit || exit 1

echo "4. Checking linter..."
npm run lint || exit 1

echo "5. Checking Prisma..."
npx prisma generate || exit 1

echo ""
echo "✅ All checks passed!"
echo "Run 'npm run dev' to start testing manually."
```

Run with: `chmod +x test-quick.sh && ./test-quick.sh`

