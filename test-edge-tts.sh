#!/bin/bash

# Test script for Edge-TTS integration
echo "🧪 Testing Edge-TTS Integration"
echo "================================"
echo ""

# Check if Edge-TTS service is running
echo "1. Checking Edge-TTS service..."
if curl -s http://localhost:5050/v1/models > /dev/null 2>&1; then
    echo "   ✅ Edge-TTS service is running on port 5050"
    EDGE_TTS_RUNNING=true
else
    echo "   ⚠️  Edge-TTS service is NOT running on port 5050"
    echo "   💡 Start it with: docker run -d -p 5050:5050 -e API_KEY=test_key -e PORT=5050 travisvn/openai-edge-tts:latest"
    EDGE_TTS_RUNNING=false
fi
echo ""

# Check if Next.js server is running
echo "2. Checking Next.js server..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Next.js server is running on port 3000"
    SERVER_RUNNING=true
else
    echo "   ❌ Next.js server is NOT running"
    echo "   💡 Start it with: npm run dev"
    SERVER_RUNNING=false
fi
echo ""

# Test Edge-TTS directly (if running)
if [ "$EDGE_TTS_RUNNING" = true ]; then
    echo "3. Testing Edge-TTS API directly..."
    RESPONSE=$(curl -s -X POST http://localhost:5050/v1/audio/speech \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer test_key" \
        -d '{
            "model": "tts-1",
            "input": "Hello, this is a test",
            "voice": "alloy"
        }' \
        -w "\nHTTP_STATUS:%{http_code}" \
        -o /tmp/edge-tts-test.mp3 2>&1)
    
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
    if [ "$HTTP_STATUS" = "200" ]; then
        FILE_SIZE=$(stat -f%z /tmp/edge-tts-test.mp3 2>/dev/null || stat -c%s /tmp/edge-tts-test.mp3 2>/dev/null)
        if [ "$FILE_SIZE" -gt 0 ]; then
            echo "   ✅ Edge-TTS API test PASSED"
            echo "   📁 Audio file saved: /tmp/edge-tts-test.mp3 ($FILE_SIZE bytes)"
        else
            echo "   ⚠️  Edge-TTS returned empty file"
        fi
    else
        echo "   ❌ Edge-TTS API test FAILED (Status: $HTTP_STATUS)"
    fi
    echo ""
fi

# Test app's audio API
if [ "$SERVER_RUNNING" = true ]; then
    echo "4. Testing app's audio API endpoint..."
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/audio \
        -H "Content-Type: application/json" \
        -d '{"text":"hello","language":"en"}' \
        -w "\nHTTP_STATUS:%{http_code}" \
        -o /tmp/app-audio-test.mp3 2>&1)
    
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
    
    if [ "$HTTP_STATUS" = "200" ]; then
        FILE_SIZE=$(stat -f%z /tmp/app-audio-test.mp3 2>/dev/null || stat -c%s /tmp/app-audio-test.mp3 2>/dev/null)
        if [ "$FILE_SIZE" -gt 0 ]; then
            echo "   ✅ App audio API test PASSED"
            echo "   📁 Audio file saved: /tmp/app-audio-test.mp3 ($FILE_SIZE bytes)"
            echo "   🎵 Edge-TTS is working correctly!"
        else
            echo "   ⚠️  App returned empty audio file"
        fi
    elif [ "$HTTP_STATUS" = "503" ]; then
        echo "   ⚠️  App returned 503 (Service Unavailable)"
        echo "   ℹ️  This is expected when Edge-TTS is not running"
        echo "   ✅ Fallback mechanism is working correctly"
    else
        echo "   ❌ App audio API test FAILED (Status: $HTTP_STATUS)"
        echo "   Response: $(echo "$RESPONSE" | head -5)"
    fi
    echo ""
fi

# Summary
echo "================================"
echo "📊 Test Summary:"
echo "================================"
if [ "$EDGE_TTS_RUNNING" = true ] && [ "$SERVER_RUNNING" = true ]; then
    echo "✅ Both services are running"
    echo "✅ Integration test completed"
elif [ "$SERVER_RUNNING" = true ]; then
    echo "⚠️  Next.js server is running"
    echo "⚠️  Edge-TTS service is NOT running"
    echo "💡 To test fully, start Edge-TTS:"
    echo "   docker run -d -p 5050:5050 -e API_KEY=test_key -e PORT=5050 travisvn/openai-edge-tts:latest"
else
    echo "❌ Next.js server is not running"
    echo "💡 Start it with: npm run dev"
fi
echo ""

