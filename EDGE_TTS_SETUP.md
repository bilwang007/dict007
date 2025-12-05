# Edge-TTS Setup Guide

## ✅ TTS Replaced with Edge-TTS

The TTS implementation has been updated to use **Edge-TTS** (OpenAI-compatible free TTS service).

## 🚀 Quick Start

### Step 1: Start Edge-TTS Service

Run the Docker container:

```bash
docker run -d -p 5050:5050 \
  -e API_KEY=your_api_key_here \
  -e PORT=5050 \
  --name edge-tts \
  travisvn/openai-edge-tts:latest
```

**Note:** The API key can be any string - it's not validated.

### Step 2: Configure Environment Variables

Add to your `.env.local`:

```env
# Edge-TTS Configuration
EDGE_TTS_API_URL=http://localhost:5050
EDGE_TTS_API_KEY=your_api_key_here
```

### Step 3: Restart Your Server

```bash
npm run dev
```

## ✅ What Changed

### Code Changes
- **File:** `app/lib/ai.ts`
- **Function:** `generateAudio()`
- **Old:** Used SiliconFlow `fnlp/MOSS-TTSD-v0.5`
- **New:** Uses Edge-TTS API (OpenAI-compatible endpoint)

### Environment Variables
- **Removed:** `AUDIO_MODEL`
- **Added:** `EDGE_TTS_API_URL` and `EDGE_TTS_API_KEY`

## 🧪 Testing

### Test 1: Verify Edge-TTS Service is Running

```bash
curl http://localhost:5050/v1/models
```

Should return a list of available models.

### Test 2: Test Audio Generation

```bash
curl -X POST http://localhost:5050/v1/audio/speech \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_key_here" \
  -d '{
    "model": "tts-1",
    "input": "Hello, this is a test",
    "voice": "alloy"
  }' \
  --output test-audio.mp3
```

### Test 3: Test Your App's Audio API

```bash
curl -X POST http://localhost:3000/api/audio \
  -H "Content-Type: application/json" \
  -d '{"text":"hello","language":"en"}' \
  -o test-audio.mp3
```

## 🎙️ Available Voices

Edge-TTS supports OpenAI voice mappings:
- `alloy` - Neutral voice
- `echo` - Male voice
- `fable` - British English
- `onyx` - Deep male voice
- `nova` - Female voice
- `shimmer` - Soft female voice

You can also use Edge-TTS specific voices directly:
- `en-US-AriaNeural` - English (US) female
- `es-ES-ElviraNeural` - Spanish (Spain) female
- `zh-CN-XiaoxiaoNeural` - Chinese (Simplified) female
- `ja-JP-KeitaNeural` - Japanese male
- And many more...

## 📋 Production Deployment

### Option 1: Same Server
Run Edge-TTS on the same server as your app:
```bash
docker run -d -p 5050:5050 \
  -e API_KEY=your_production_key \
  -e PORT=5050 \
  --restart unless-stopped \
  --name edge-tts \
  travisvn/openai-edge-tts:latest
```

Update `.env.local`:
```env
EDGE_TTS_API_URL=http://localhost:5050
```

### Option 2: Separate Server
If Edge-TTS runs on a different server:
```env
EDGE_TTS_API_URL=http://your-tts-server.com:5050
```

### Option 3: Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  edge-tts:
    image: travisvn/openai-edge-tts:latest
    ports:
      - "5050:5050"
    environment:
      - API_KEY=your_api_key_here
      - PORT=5050
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

## 🔧 Troubleshooting

### Issue: Connection Refused
**Error:** `ECONNREFUSED` or `fetch failed`

**Solution:**
1. Check if Edge-TTS container is running:
   ```bash
   docker ps | grep edge-tts
   ```
2. Check if port 5050 is accessible:
   ```bash
   curl http://localhost:5050/v1/models
   ```
3. Restart the container:
   ```bash
   docker restart edge-tts
   ```

### Issue: 401 Unauthorized
**Error:** `401 Unauthorized`

**Solution:**
- Make sure `EDGE_TTS_API_KEY` in `.env.local` matches the `API_KEY` used when starting the container
- The API key can be any string, but they must match

### Issue: Empty Audio Buffer
**Error:** Audio API returns empty buffer

**Solution:**
1. Check Edge-TTS logs:
   ```bash
   docker logs edge-tts
   ```
2. Test Edge-TTS directly (see Test 2 above)
3. Check if the text is valid (not empty, not too long)

### Issue: Wrong Voice
**Error:** Voice doesn't sound right for the language

**Solution:**
- Update the `voiceMap` in `app/lib/ai.ts` to use Edge-TTS specific voices
- For example, for Chinese:
  ```typescript
  zh: 'zh-CN-XiaoxiaoNeural', // Instead of 'alloy'
  ```

## 📚 Additional Resources

- **Edge-TTS GitHub:** https://github.com/travisvn/openai-edge-tts
- **Docker Hub:** https://hub.docker.com/r/travisvn/openai-edge-tts
- **List all voices:** `curl http://localhost:5050/v1/voices/all`

## ✅ Benefits

- ✅ **Free** - Uses Microsoft Edge's free TTS service
- ✅ **OpenAI-Compatible** - Easy integration
- ✅ **Multiple Languages** - Supports many languages
- ✅ **High Quality** - Neural voices
- ✅ **Self-Hosted** - Full control over the service

## 🎯 Next Steps

1. ✅ Start Edge-TTS Docker container
2. ✅ Add environment variables to `.env.local`
3. ✅ Restart your Next.js server
4. ✅ Test the audio functionality in your app

Enjoy free, high-quality text-to-speech! 🎉

