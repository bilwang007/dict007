# Image Loading Debug Guide

## Issue
Images work when looking up new words, but don't display in Study mode and Notebook.

## Changes Made

1. **Added error handling** to Flashcard and NotebookItem components
2. **Added `unoptimized` prop** to Next.js Image components (for external Unsplash URLs)
3. **Added image loading state** to track when images fail to load
4. **Added console logging** to debug image loading

## How to Debug

### 1. Check Browser Console
Open browser console (F12) and look for:
- `Image loaded successfully: [URL]` - Image is loading
- `Image failed to load: [URL]` - Image failed to load

### 2. Check Saved Image URLs
In browser console, run:
```javascript
// Check saved entries
const entries = JSON.parse(localStorage.getItem('dictionary_notebook_entries') || '[]')
console.log('Saved entries:', entries)
entries.forEach(entry => {
  console.log(`Word: ${entry.word}, ImageURL: ${entry.imageUrl}`)
})
```

### 3. Test Image URLs Directly
If you see an image URL in the console, try opening it directly in a new tab:
```javascript
// Get first entry's image URL
const entries = JSON.parse(localStorage.getItem('dictionary_notebook_entries') || '[]')
if (entries[0]?.imageUrl) {
  window.open(entries[0].imageUrl, '_blank')
}
```

### 4. Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Img"
4. Look for failed image requests (red)
5. Check the error message

## Common Issues

### Issue 1: Image URL is empty or undefined
**Solution:** The image might not have been saved properly. Try:
- Look up a new word
- Save it to notebook
- Check if imageUrl is saved

### Issue 2: Image URL is invalid or expired
**Solution:** Unsplash URLs should be permanent, but if they're not loading:
- Check if URL starts with `https://images.unsplash.com`
- Try opening URL directly in browser
- If it doesn't load, the URL might be invalid

### Issue 3: Next.js Image component blocking
**Solution:** Already fixed with `unoptimized` prop, but if still not working:
- Check `next.config.js` has Unsplash domains
- Try using regular `<img>` tag instead

### Issue 4: CORS or security issues
**Solution:** Check browser console for CORS errors. Unsplash should allow all origins.

## Quick Fix

If images still don't work, you can:
1. Delete old entries from notebook
2. Look up words again (they'll get fresh image URLs)
3. Save them again

## Next Steps

If images still don't load:
1. Share the browser console errors
2. Share what you see in Network tab
3. Share a sample image URL that's not loading

