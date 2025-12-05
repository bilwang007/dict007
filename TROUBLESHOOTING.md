# Troubleshooting Guide

## Error: "Failed to lookup word"

### Possible Causes:

1. **Server needs restart** - Environment variables are only loaded when server starts
2. **API key not read** - Server might not be reading .env.local properly
3. **OpenAI API error** - API key might be invalid or have no credits
4. **Network issue** - Can't reach OpenAI API

### Solutions:

#### Solution 1: Restart the Server

The server needs to be restarted after adding/changing the API key in `.env.local`.

**Steps:**
1. Stop the server (press `Ctrl+C` in the terminal where `npm run dev` is running)
2. Start it again:
   ```bash
   npm run dev
   ```

#### Solution 2: Verify API Key

Check that `.env.local` has the correct format:
```bash
cat .env.local | grep OPENAI_API_KEY
```

Should show:
```
OPENAI_API_KEY=sk-proj-... (your actual key)
```

**NOT:**
```
OPENAI_API_KEY=your-api-key-here
```

#### Solution 3: Check Browser Console

1. Open browser (http://localhost:3000)
2. Press `F12` to open Developer Tools
3. Go to "Console" tab
4. Try looking up a word again
5. Check for any error messages

#### Solution 4: Check Server Logs

In the terminal where `npm run dev` is running, look for error messages when you try to lookup a word.

Common errors:
- "OPENAI_API_KEY is not set" - Server needs restart
- "Invalid API key" - Check your API key
- "Insufficient credits" - Add credits to OpenAI account

#### Solution 5: Test API Key Directly

Test if your API key works:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

Should return a list of models (not an error).

### Quick Fix Steps:

1. **Verify .env.local:**
   ```bash
   cat .env.local | grep OPENAI_API_KEY
   ```

2. **Restart server:**
   - Press `Ctrl+C` in terminal
   - Run `npm run dev` again

3. **Clear browser cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or clear browser cache

4. **Check OpenAI account:**
   - Go to https://platform.openai.com/
   - Check you have credits
   - Verify API key is active

### Still Not Working?

Check:
- ✅ Is the server running? (Visit http://localhost:3000)
- ✅ Is the API key correct? (Starts with `sk-`)
- ✅ Did you restart the server after adding the key?
- ✅ Do you have credits in your OpenAI account?
- ✅ Check browser console (F12) for errors
- ✅ Check server terminal for error messages

