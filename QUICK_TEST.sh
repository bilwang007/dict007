#!/bin/bash
# Quick Test Script - Test new features locally
# 快速测试脚本 - 本地测试新功能

echo "=== AI Dictionary - Quick Test ==="
echo "=== AI 词典 - 快速测试 ==="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << EOF
# SiliconFlow Configuration
SILICONFLOW_API_KEY=your-siliconflow-api-key-here
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1

# Model Configuration
AI_MODEL=deepseek-ai/DeepSeek-V3
IMAGE_MODEL=Qwen/Qwen2-VL-72B-Instruct
AUDIO_MODEL=MOSS

# Image Service
UNSPLASH_ACCESS_KEY=your-unsplash-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "📝 Created .env.local template. Please add your API keys!"
    echo "   Edit .env.local and add your API keys, then run this script again."
    exit 1
fi

# Create test files
echo "📝 Creating test files..."
cat > test-words.txt << EOF
hello
world
beautiful
amazing
wonderful
EOF

cat > test-words.csv << EOF
word
hello
world
beautiful
amazing
wonderful
EOF

echo "✅ Test files created:"
echo "   - test-words.txt"
echo "   - test-words.csv"

# Start development server
echo ""
echo "🚀 Starting development server..."
echo "   Open http://localhost:3000 in your browser"
echo ""
echo "📋 Testing Checklist:"
echo "   1. Go to Notebook page"
echo "   2. Test Batch Upload (upload test-words.txt)"
echo "   3. Test Tagging (add tags to entries)"
echo "   4. Test Batch Tagging (select multiple, add tag)"
echo "   5. Check First Learned Date (save new word)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

