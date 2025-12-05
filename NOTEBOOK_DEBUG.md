# Notebook Debugging Guide

## Common Issues with Notebook

### Issue 1: Notebook Page Doesn't Load

**Symptoms:** Blank page, error in browser console

**Check:**
- Browser console (F12) for errors
- Server terminal for errors
- URL should be: http://localhost:3000/notebook

### Issue 2: Notebook Shows "Empty" When You Have Saved Words

**Possible Causes:**
1. localStorage not accessible (private browsing mode?)
2. Data stored under different key
3. Browser cache issue

**Fix:**
1. Check browser console (F12):
   ```javascript
   localStorage.getItem('dictionary_notebook_entries')
   ```
   Should return JSON data if words are saved.

2. Check if localStorage is enabled:
   ```javascript
   typeof localStorage
   ```
   Should return 'object', not 'undefined'.

### Issue 3: Save to Notebook Doesn't Work

**Check:**
1. Click "Save to Notebook" on main page
2. Check browser console for errors
3. Verify entry was saved:
   ```javascript
   JSON.parse(localStorage.getItem('dictionary_notebook_entries'))
   ```

### Issue 4: Notebook Page Crashes

**Possible Causes:**
- Image URL issue
- Missing data fields
- Type mismatch

**Check browser console for specific error messages.**

## Quick Debug Steps

1. **Check localStorage:**
   - Open browser console (F12)
   - Run: `localStorage.getItem('dictionary_notebook_entries')`
   - Should see JSON array of saved entries

2. **Check if entries exist:**
   - Run: `JSON.parse(localStorage.getItem('dictionary_notebook_entries'))`
   - Should return array with your saved words

3. **Clear and retry:**
   - If data is corrupted, clear: `localStorage.removeItem('dictionary_notebook_entries')`
   - Save a word again from main page
   - Check notebook page again

4. **Check for errors:**
   - Browser console (F12) → Console tab
   - Look for red error messages
   - Share the error message

## Test Checklist

- [ ] Can you access /notebook page?
- [ ] Do you see "Your notebook is empty" message?
- [ ] Have you saved any words from main page?
- [ ] Check browser console for errors
- [ ] Check localStorage has data

