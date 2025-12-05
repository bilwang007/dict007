# ⚠️ Important: Add Your OpenAI API Key

Before starting the server, you need to add your OpenAI API key to `.env.local`.

## Current Status
The `.env.local` file exists but has a placeholder:
```
OPENAI_API_KEY=your-api-key-here
```

## What You Need To Do

### 1. Get Your OpenAI API Key
- Go to: https://platform.openai.com/api-keys
- Sign in or create an account
- Click "Create new secret key"
- Copy the key (it starts with `sk-`)

### 2. Edit .env.local File

**Option A: Using nano (terminal editor)**
```bash
nano .env.local
```
- Use arrow keys to navigate
- Replace `your-api-key-here` with your actual key: `sk-...`
- Press `Ctrl+X` to exit
- Press `Y` to confirm save
- Press `Enter` to confirm filename

**Option B: Using VS Code**
```bash
code .env.local
```
- Replace `your-api-key-here` with your actual key
- Save (Cmd+S or Ctrl+S)

**Option C: Using TextEdit (macOS)**
```bash
open -e .env.local
```
- Replace `your-api-key-here` with your actual key
- Save (Cmd+S)

**Option D: Using any text editor**
- Open `.env.local` in your preferred editor
- Replace `your-api-key-here` with: `sk-your-actual-api-key-here`
- Save the file

### 3. Verify the Change

After editing, verify it looks like:
```
OPENAI_API_KEY=sk-proj-abc123xyz...
```

**Important:** The key should start with `sk-` and should NOT have quotes around it.

## After Adding Your Key

Once you've added your API key, come back and we'll start the development server!

