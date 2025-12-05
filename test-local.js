#!/usr/bin/env node

// Local testing script
// Run: node test-local.js

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Running local tests...\n')

let allPassed = true

// Test 1: Check required files exist
console.log('1. Checking required files exist...')
const requiredFiles = [
  'app/api/upload/route.ts',
  'app/api/user/profile/route.ts',
  'app/lib/rate-limit.ts',
  'app/error.tsx',
  'app/forgot-password/page.tsx',
  'app/reset-password/page.tsx',
  'app/login/page.tsx',
  'app/register/page.tsx',
  'middleware.ts',
  'next.config.js',
  'package.json',
]

let missingFiles = []
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file)
  }
})

if (missingFiles.length > 0) {
  console.log('❌ Missing files:')
  missingFiles.forEach(file => console.log(`   - ${file}`))
  allPassed = false
} else {
  console.log('✅ All required files exist\n')
}

// Test 2: Check environment file
console.log('2. Checking environment file...')
if (!fs.existsSync('.env.local')) {
  console.log('⚠️  .env.local not found')
  console.log('   Run: cp env.local.template .env.local\n')
} else {
  console.log('✅ .env.local exists\n')
}

// Test 3: TypeScript compilation
console.log('3. Testing TypeScript compilation...')
try {
  execSync('npx tsc --noEmit', { 
    stdio: 'pipe',
    cwd: process.cwd()
  })
  console.log('✅ TypeScript: OK\n')
} catch (error) {
  console.log('❌ TypeScript: FAILED')
  console.log('   Run: npx tsc --noEmit --pretty for details\n')
  allPassed = false
}

// Test 4: Check package.json scripts
console.log('4. Checking package.json scripts...')
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredScripts = ['dev', 'build', 'start', 'lint']
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script])
  
  if (missingScripts.length > 0) {
    console.log('❌ Missing scripts:', missingScripts.join(', '))
    allPassed = false
  } else {
    console.log('✅ All required scripts exist\n')
  }
} catch (error) {
  console.log('❌ Error reading package.json\n')
  allPassed = false
}

// Test 5: Check dependencies
console.log('5. Checking dependencies...')
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredDeps = [
    '@supabase/supabase-js',
    '@supabase/ssr',
    'next',
    'react',
    'react-dom'
  ]
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  )
  
  if (missingDeps.length > 0) {
    console.log('⚠️  Missing dependencies:', missingDeps.join(', '))
    console.log('   Run: npm install\n')
  } else {
    console.log('✅ All required dependencies listed\n')
  }
} catch (error) {
  console.log('❌ Error checking dependencies\n')
}

// Summary
console.log('='.repeat(50))
if (allPassed) {
  console.log('✅ All critical tests passed!')
  console.log('\n📝 Next steps:')
  console.log('   1. Set up .env.local (if not done)')
  console.log('   2. Run: npm run build (to test build)')
  console.log('   3. Run: npm run dev (to test dev server)')
  console.log('   4. Follow STEP_BY_STEP_SETUP.md for full setup')
} else {
  console.log('❌ Some tests failed')
  console.log('\n📝 Fix the issues above, then run again')
  process.exit(1)
}
console.log('='.repeat(50))

