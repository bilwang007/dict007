# Quick Start Guide

## ✅ No Database Required! Everything uses localStorage.

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Create `.env.local` file:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Run the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## That's It! 🎉

### What Changed?
- ✅ **No database setup** - Uses browser localStorage
- ✅ **No migrations** - Just run `npm run dev`
- ✅ **No authentication** - Simple and fast
- ✅ **All features work** - Lookup, notebook, stories, flashcards

### How Data Works
- **Notebook entries**: Stored in browser localStorage
- **Stories**: Stored in browser localStorage  
- **Everything persists**: Data stays in your browser until you clear it

### Features
1. **Look up words** - Select languages, enter word/phrase
2. **Save to notebook** - Click "Save to Notebook" button
3. **View notebook** - Click "Notebook" in header
4. **Generate stories** - Select words, click "Generate Story"
5. **Study mode** - Click "Study" for flashcards

## Troubleshooting

**Problem**: "OPENAI_API_KEY is not set"
- Solution: Create `.env.local` with your OpenAI API key

**Problem**: Images not loading
- Solution: Check you have DALL-E 3 access and credits in OpenAI account

**Problem**: Audio not playing
- Solution: Check browser console for errors, verify TTS API access

**Problem**: Notebook entries disappearing
- Solution: Don't clear browser data. Entries are stored in localStorage only on that device/browser.

