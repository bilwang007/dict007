#!/usr/bin/env node

/**
 * System Tests for Dictionary Application
 * Tests database schema, API endpoints, and core functionality
 */

const { createClient } = require('@supabase/supabase-js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(name) {
  log(`\n🧪 Testing: ${name}`, 'blue');
}

function logPass(message) {
  log(`  ✅ PASS: ${message}`, 'green');
}

function logFail(message) {
  log(`  ❌ FAIL: ${message}`, 'red');
}

function logWarn(message) {
  log(`  ⚠️  WARN: ${message}`, 'yellow');
}

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function recordTest(name, passed, message, isWarning = false) {
  results.tests.push({ name, passed, message, isWarning });
  if (isWarning) {
    results.warnings++;
    logWarn(message);
  } else if (passed) {
    results.passed++;
    logPass(message);
  } else {
    results.failed++;
    logFail(message);
  }
}

// Initialize Supabase client
let supabase = null;
let isAuthenticated = false;

async function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    logWarn('Supabase credentials not found. Some tests will be skipped.');
    logWarn('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    return false;
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  
  // Try to get session
  const { data: { session } } = await supabase.auth.getSession();
  isAuthenticated = !!session;
  
  if (!isAuthenticated) {
    logWarn('Not authenticated. Some tests will be skipped.');
    logWarn('Please log in to test authenticated features.');
  }
  
  return true;
}

// ============================================================================
// DATABASE SCHEMA TESTS
// ============================================================================

async function testDatabaseSchema() {
  logSection('DATABASE SCHEMA TESTS');
  
  if (!supabase) {
    recordTest('Database Connection', false, 'Supabase not initialized', true);
    return;
  }
  
  // Test 1: Check if notebook_entries table exists
  logTest('Table Existence');
  try {
    const { data, error } = await supabase
      .from('notebook_entries')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      recordTest('notebook_entries table exists', false, 'Table does not exist. Run migration first.');
    } else {
      recordTest('notebook_entries table exists', true, 'Table exists');
    }
  } catch (err) {
    recordTest('notebook_entries table exists', false, `Error: ${err.message}`);
  }
  
  // Test 2: Check meaning_index column
  logTest('meaning_index Column');
  try {
    // Try to query meaning_index column
    const { data, error } = await supabase
      .from('notebook_entries')
      .select('meaning_index')
      .limit(1);
    
    if (error && (error.code === '42703' || error.message?.includes('meaning_index'))) {
      recordTest('meaning_index column exists', false, 'Column missing. Run add-meaning-index-to-notebook.sql');
    } else {
      recordTest('meaning_index column exists', true, 'Column exists');
    }
  } catch (err) {
    recordTest('meaning_index column exists', false, `Error: ${err.message}`);
  }
  
  // Test 3: Check unique constraint
  logTest('Unique Constraint');
  try {
    // This will fail if constraint doesn't exist, but we can't test it directly
    // We'll test by trying to insert duplicate (if authenticated)
    if (isAuthenticated) {
      const testWord = `test_${Date.now()}`;
      const testData = {
        word: testWord,
        target_language: 'en',
        native_language: 'zh',
        definition: 'test definition',
        meaning_index: null,
      };
      
      // Insert first entry
      const { error: insert1Error } = await supabase
        .from('notebook_entries')
        .insert(testData);
      
      if (insert1Error) {
        recordTest('Unique constraint works', false, `Insert failed: ${insert1Error.message}`);
      } else {
        // Try to insert duplicate (should fail)
        const { error: insert2Error } = await supabase
          .from('notebook_entries')
          .insert(testData);
        
        if (insert2Error && insert2Error.code === '23505') {
          recordTest('Unique constraint works', true, 'Constraint prevents duplicates');
          
          // Cleanup
          await supabase
            .from('notebook_entries')
            .delete()
            .eq('word', testWord);
        } else {
          recordTest('Unique constraint works', false, 'Constraint may not be working');
        }
      }
    } else {
      recordTest('Unique constraint works', null, 'Skipped (not authenticated)', true);
    }
  } catch (err) {
    recordTest('Unique constraint works', false, `Error: ${err.message}`);
  }
  
  // Test 4: Check indexes
  logTest('Database Indexes');
  recordTest('Indexes exist', null, 'Cannot verify indexes via API (requires direct DB access)', true);
  logWarn('Run DATABASE_SCHEMA_VERIFICATION.sql to verify indexes');
}

// ============================================================================
// API ENDPOINT TESTS
// ============================================================================

async function testAPIEndpoints() {
  logSection('API ENDPOINT TESTS');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Test 1: Health check (if endpoint exists)
  logTest('API Health');
  try {
    // Most Next.js apps don't have /health, so we'll test /api/lookup with invalid request
    const response = await fetch(`${baseUrl}/api/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    
    if (response.status === 400) {
      recordTest('API endpoint accessible', true, 'Endpoint responds (400 expected for invalid request)');
    } else if (response.status === 401) {
      recordTest('API endpoint accessible', true, 'Endpoint responds (401 - auth required)');
    } else {
      recordTest('API endpoint accessible', response.ok, `Status: ${response.status}`);
    }
  } catch (err) {
    recordTest('API endpoint accessible', false, `Cannot connect: ${err.message}`);
    logWarn('Make sure dev server is running: npm run dev');
  }
  
  // Test 2: Lookup endpoint structure
  logTest('Lookup API Structure');
  try {
    const response = await fetch(`${baseUrl}/api/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: 'test',
        targetLanguage: 'en',
        nativeLanguage: 'zh',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      const hasWord = 'word' in data;
      const hasDefinition = 'definition' in data || 'definitionTarget' in data;
      const hasMeanings = 'meanings' in data;
      
      recordTest('Lookup API response structure', hasWord && hasDefinition, 
        hasWord && hasDefinition ? 'Response has required fields' : 'Missing required fields');
      
      if (hasMeanings) {
        recordTest('Lookup API supports multiple meanings', true, 'meanings array present');
      }
    } else {
      recordTest('Lookup API response structure', false, `Status: ${response.status}`);
    }
  } catch (err) {
    recordTest('Lookup API response structure', false, `Error: ${err.message}`);
  }
  
  // Test 3: Image endpoint
  logTest('Image API');
  try {
    const response = await fetch(`${baseUrl}/api/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: 'test',
        definition: 'test definition',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      recordTest('Image API works', 'imageUrl' in data, 'Image endpoint responds');
    } else {
      recordTest('Image API works', false, `Status: ${response.status}`);
    }
  } catch (err) {
    recordTest('Image API works', false, `Error: ${err.message}`);
  }
}

// ============================================================================
// CODE STRUCTURE TESTS
// ============================================================================

async function testCodeStructure() {
  logSection('CODE STRUCTURE TESTS');
  
  const fs = require('fs');
  const path = require('path');
  
  // Test 1: Check required files exist
  logTest('Required Files');
  const requiredFiles = [
    'app/lib/types.ts',
    'app/lib/storage-supabase.ts',
    'app/api/lookup/route.ts',
    'app/api/image/route.ts',
    'app/components/ResultCard.tsx',
    'app/components/NotebookItem.tsx',
    'migrate_to_complete_schema.sql',
    'notebook_entries_complete_schema.sql',
  ];
  
  for (const file of requiredFiles) {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    recordTest(`File exists: ${file}`, exists, exists ? 'Found' : 'Missing');
  }
  
  // Test 2: Check for meaning_index usage in code
  logTest('Code References meaning_index');
  try {
    const storageFile = fs.readFileSync('app/lib/storage-supabase.ts', 'utf8');
    const lookupFile = fs.readFileSync('app/api/lookup/route.ts', 'utf8');
    
    const storageHasMeaning = storageFile.includes('meaning_index') || storageFile.includes('meaningIndex');
    const lookupHasMeaning = lookupFile.includes('meaning_index') || lookupFile.includes('meaningIndex');
    
    recordTest('storage-supabase.ts uses meaning_index', storageHasMeaning, 
      storageHasMeaning ? 'Found references' : 'No references found');
    recordTest('lookup/route.ts uses meaning_index', lookupHasMeaning,
      lookupHasMeaning ? 'Found references' : 'No references found');
  } catch (err) {
    recordTest('Code references meaning_index', false, `Error reading files: ${err.message}`);
  }
  
  // Test 3: Check for workarounds (should not exist)
  logTest('No Code Workarounds');
  try {
    const storageFile = fs.readFileSync('app/lib/storage-supabase.ts', 'utf8');
    const hasWorkaround = storageFile.includes('fallback') || 
                         storageFile.includes('workaround') ||
                         storageFile.includes('gracefully if column');
    
    recordTest('No workarounds in code', !hasWorkaround,
      hasWorkaround ? 'Workarounds found (should use proper schema)' : 'No workarounds (good!)');
  } catch (err) {
    recordTest('No workarounds in code', null, `Error: ${err.message}`, true);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runTests() {
  log('\n🚀 Starting System Tests...\n', 'cyan');
  log('Testing database schema, API endpoints, and code structure\n', 'yellow');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  // Initialize Supabase
  await initSupabase();
  
  // Run tests
  await testDatabaseSchema();
  await testAPIEndpoints();
  await testCodeStructure();
  
  // Print summary
  logSection('TEST SUMMARY');
  log(`Total Tests: ${results.tests.length}`, 'cyan');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`⚠️  Warnings: ${results.warnings}`, 'yellow');
  
  console.log('\n' + '='.repeat(60));
  
  if (results.failed === 0) {
    log('\n🎉 All critical tests passed!', 'green');
    log('\n📋 Next Step: Run UAT (User Acceptance Testing)', 'cyan');
    log('   See: UAT_TEST_PLAN.md', 'cyan');
  } else {
    log('\n⚠️  Some tests failed. Please fix issues before UAT.', 'yellow');
    log('\n📋 Fix database schema issues first:', 'yellow');
    log('   1. Run: add-meaning-index-to-notebook.sql in Supabase SQL Editor', 'yellow');
    log('   2. See: DATABASE_MIGRATION_GUIDE.md for instructions', 'yellow');
  }
  
  console.log('\n');
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  log(`\n💥 Test runner crashed: ${err.message}`, 'red');
  console.error(err);
  process.exit(1);
});

