#!/bin/bash

# AI Dictionary - Quick Setup and Run Script
# This script helps you set up and run the app

echo "🚀 AI Dictionary - Setup and Run Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Node.js
echo "Step 1: Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found!"
    echo ""
    echo "Please install Node.js first:"
    echo "  - Visit: https://nodejs.org/"
    echo "  - Or install via Homebrew: brew install node"
    exit 1
fi

# Step 2: Check npm
echo ""
echo "Step 2: Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found!"
    echo "npm usually comes with Node.js. Please reinstall Node.js."
    exit 1
fi

# Step 3: Check .env.local
echo ""
echo "Step 3: Checking environment file..."
if [ -f ".env.local" ]; then
    if grep -q "OPENAI_API_KEY=your-api-key-here" .env.local; then
        echo -e "${YELLOW}⚠${NC} .env.local exists but needs your API key"
        echo ""
        echo "Please edit .env.local and replace 'your-api-key-here' with your actual OpenAI API key"
        echo "Get your API key from: https://platform.openai.com/api-keys"
        echo ""
        read -p "Press Enter after you've updated .env.local, or Ctrl+C to cancel..."
    else
        echo -e "${GREEN}✓${NC} .env.local file exists and looks configured"
    fi
else
    echo -e "${RED}✗${NC} .env.local not found"
    echo "Creating .env.local template..."
    cat > .env.local << 'EOF'
OPENAI_API_KEY=your-api-key-here
EOF
    echo -e "${YELLOW}⚠${NC} Created .env.local template"
    echo "Please edit .env.local and replace 'your-api-key-here' with your actual OpenAI API key"
    echo ""
    read -p "Press Enter after you've updated .env.local, or Ctrl+C to cancel..."
fi

# Step 4: Install dependencies
echo ""
echo "Step 4: Installing dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
    echo "Skipping npm install (already installed)"
    echo "To reinstall, delete node_modules and run this script again"
else
    echo "Running npm install..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Dependencies installed successfully"
    else
        echo -e "${RED}✗${NC} Failed to install dependencies"
        exit 1
    fi
fi

# Step 5: Start the server
echo ""
echo "Step 5: Starting development server..."
echo ""
echo -e "${GREEN}✓${NC} Setup complete!"
echo ""
echo "Starting the development server..."
echo "The app will be available at: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "Press ${YELLOW}Ctrl+C${NC} to stop the server when you're done"
echo ""
echo "========================================"
echo ""

# Start the dev server
npm run dev

