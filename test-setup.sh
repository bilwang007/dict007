#!/bin/bash

echo "🚀 AI Dictionary - Quick Setup Test"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
echo ""
echo "2. Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found. Please install npm"
    exit 1
fi

# Check dependencies
echo ""
echo "3. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found. Running npm install..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Dependencies installed"
    else
        echo -e "${RED}✗${NC} Failed to install dependencies"
        exit 1
    fi
fi

# Check .env.local
echo ""
echo "4. Checking environment variables..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local file exists"
    
    # Check for required variables
    if grep -q "OPENAI_API_KEY" .env.local && ! grep -q "OPENAI_API_KEY=your" .env.local; then
        echo -e "${GREEN}✓${NC} OPENAI_API_KEY is set"
    else
        echo -e "${YELLOW}⚠${NC} OPENAI_API_KEY not set or using placeholder"
    fi
    
    if grep -q "DATABASE_URL" .env.local && ! grep -q "DATABASE_URL=your" .env.local; then
        echo -e "${GREEN}✓${NC} DATABASE_URL is set"
    else
        echo -e "${YELLOW}⚠${NC} DATABASE_URL not set or using placeholder"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env.local not found"
    echo "   Please create .env.local with:"
    echo "   OPENAI_API_KEY=your_key_here"
    echo "   DATABASE_URL=your_database_url_here"
fi

# Check Prisma
echo ""
echo "5. Checking Prisma setup..."
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} Prisma schema exists"
    
    # Try to generate Prisma client
    echo "   Generating Prisma client..."
    npx prisma generate > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Prisma client generated"
    else
        echo -e "${YELLOW}⚠${NC} Could not generate Prisma client"
        echo "   Make sure DATABASE_URL is correct in .env.local"
    fi
else
    echo -e "${RED}✗${NC} Prisma schema not found"
    exit 1
fi

# Check TypeScript
echo ""
echo "6. Checking TypeScript..."
npx tsc --noEmit > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} TypeScript checks passed"
else
    echo -e "${YELLOW}⚠${NC} TypeScript errors found (run 'npx tsc --noEmit' for details)"
fi

# Summary
echo ""
echo "===================================="
echo "Summary:"
echo ""

if [ -f ".env.local" ] && grep -q "OPENAI_API_KEY" .env.local && grep -q "DATABASE_URL" .env.local; then
    echo -e "${GREEN}✅ Ready to start!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run database migrations:"
    echo "   ${YELLOW}npx prisma migrate dev --name init${NC}"
    echo ""
    echo "2. Start development server:"
    echo "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo "3. Open browser to: ${YELLOW}http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠ Setup incomplete${NC}"
    echo ""
    echo "Please:"
    echo "1. Create .env.local with OPENAI_API_KEY and DATABASE_URL"
    echo "2. Run: ${YELLOW}npx prisma migrate dev --name init${NC}"
    echo "3. Run: ${YELLOW}npm run dev${NC}"
fi

