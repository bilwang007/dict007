# Local Testing Guide - Before Full Setup
# 本地测试指南 - 完整设置前

Test all functions locally before setting up Supabase, 阿里云盘, and Vercel.

---

## Overview / 概述

This guide helps you test the code locally with minimal setup. You can test:
- ✅ Code compilation
- ✅ Component rendering
- ✅ API route structure
- ✅ Type checking
- ✅ Basic functionality (with mocks)

**Note:** Some features require actual service credentials (Supabase, 阿里云盘), but we'll use mocks for testing.

---

## Step 1: Install Dependencies / 步骤 1：安装依赖

### 1.1 Install Packages / 安装包

```bash
cd "/Users/billwang007/projects/dictionary-zara copy"
npm install
```

**Expected time:** 2-5 minutes

**If you see errors:**
- Make sure Node.js 18+ is installed: `node --version`
- Try: `rm -rf node_modules package-lock.json && npm install`

### 1.2 Verify Installation / 验证安装

```bash
# Check Next.js
npx next --version

# Check TypeScript
npx tsc --version
```

---

## Step 2: Create Minimal Environment File / 步骤 2：创建最小环境文件

### 2.1 Create `.env.local` / 创建 `.env.local`

```bash
cp env.local.template .env.local
```

### 2.2 Add Minimal Test Values / 添加最小测试值

For local testing, you can use placeholder values:

```env
# Supabase (Placeholder - will show connection errors but code will compile)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoxOTYwNzY4MDAwfQ.placeholder

# 阿里云盘 (Placeholder - file uploads will fail but code will compile)
ALIYUN_DRIVE_CLIENT_ID=placeholder-client-id
ALIYUN_DRIVE_CLIENT_SECRET=placeholder-client-secret
ALIYUN_DRIVE_REFRESH_TOKEN=placeholder-refresh-token

# AI Services (You need a real key for this to work)
# Get a free key from: https://cloud.siliconflow.cn
SILICONFLOW_API_KEY=your-siliconflow-api-key-here
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1
AI_MODEL=deepseek-ai/DeepSeek-V3

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** 
- Supabase placeholders will cause connection errors, but code will compile
- 阿里云盘 placeholders will cause upload failures, but code will compile
- You need a real SiliconFlow API key to test AI features

---

## Step 3: Test Code Compilation / 步骤 3：测试代码编译

### 3.1 TypeScript Check / TypeScript 检查

```bash
npx tsc --noEmit
```

**Expected:** No errors (or only minor warnings)

**If you see errors:**
- Check that all files are saved
- Verify imports are correct
- Check TypeScript version: `npx tsc --version` (should be 5.3+)

### 3.2 Next.js Build Test / Next.js 构建测试

```bash
npm run build
```

**Expected:** Build completes successfully

**This tests:**
- ✅ All TypeScript types are correct
- ✅ All imports resolve correctly
- ✅ All components compile
- ✅ All API routes are valid
- ✅ No syntax errors

**If build fails:**
- Read the error message
- Fix the specific issue
- Common issues:
  - Missing imports
  - Type errors
  - Syntax errors

---

## Step 4: Test Development Server / 步骤 4：测试开发服务器

### 4.1 Start Dev Server / 启动开发服务器

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### 4.2 Open Browser / 打开浏览器

Go to: http://localhost:3000

**Expected:**
- Page loads (may show errors for missing Supabase)
- Navigation bar appears
- No crashes

---

## Step 5: Test Individual Components / 步骤 5：测试各个组件

### 5.1 Test Pages / 测试页面

#### Test Login Page / 测试登录页面

1. **Go to:** http://localhost:3000/login
2. **Expected:**
   - ✅ Login form appears
   - ✅ Email and password fields visible
   - ✅ "Register" link works
   - ✅ "Forgot password" link works
   - ⚠️ Login won't work (no Supabase connection)

#### Test Register Page / 测试注册页面

1. **Go to:** http://localhost:3000/register
2. **Expected:**
   - ✅ Registration form appears
   - ✅ All fields visible
   - ✅ Password validation works (try weak password)
   - ⚠️ Registration won't work (no Supabase connection)

#### Test Forgot Password Page / 测试忘记密码页面

1. **Go to:** http://localhost:3000/forgot-password
2. **Expected:**
   - ✅ Form appears
   - ✅ Email field visible
   - ⚠️ Submit won't work (no Supabase connection)

#### Test Reset Password Page / 测试重置密码页面

1. **Go to:** http://localhost:3000/reset-password
2. **Expected:**
   - ✅ Form appears
   - ✅ Password fields visible
   - ✅ Validation works
   - ⚠️ Submit won't work (no valid session)

### 5.2 Test Navigation / 测试导航

1. **Go to:** http://localhost:3000
2. **Expected:**
   - ✅ Navigation bar appears
   - ✅ "Login" button visible (when not logged in)
   - ✅ All navigation links work
   - ✅ Responsive design works

### 5.3 Test Error Boundary / 测试错误边界

The error boundary will catch errors automatically. To test:

1. **Check:** `app/error.tsx` exists
2. **Verify:** Error page would show if an error occurs
3. **Note:** Hard to test without causing actual errors

---

## Step 6: Test API Routes Structure / 步骤 6：测试 API 路由结构

### 6.1 Test API Routes Exist / 测试 API 路由存在

Check that all routes are accessible (they'll return errors without proper setup):

```bash
# Test lookup route (will fail without auth and AI key)
curl -X POST http://localhost:3000/api/lookup \
  -H "Content-Type: application/json" \
  -d '{"word":"hello","targetLanguage":"en","nativeLanguage":"zh"}'

# Expected: Error (401 Unauthorized or 500) - but route exists
```

### 6.2 Test Route Structure / 测试路由结构

**Check these routes exist:**
- ✅ `/api/lookup` - POST
- ✅ `/api/notebook` - GET, POST, DELETE
- ✅ `/api/upload` - POST
- ✅ `/api/user/profile` - GET, PUT, DELETE
- ✅ `/api/story` - POST
- ✅ `/api/image` - POST
- ✅ `/api/audio` - POST

**Test with curl or browser:**

```bash
# Test GET routes (will return errors but prove routes exist)
curl http://localhost:3000/api/notebook
curl http://localhost:3000/api/user/profile
```

**Expected:** 
- Routes respond (even with errors)
- Not "404 Not Found"
- Error messages indicate route exists but needs auth

---

## Step 7: Test with Mock Data / 步骤 7：使用模拟数据测试

### 7.1 Create Test Script / 创建测试脚本

Create `test-local.js`:

```javascript
// test-local.js - Quick local tests
const { execSync } = require('child_process')

console.log('🧪 Running local tests...\n')

// Test 1: TypeScript compilation
console.log('1. Testing TypeScript compilation...')
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' })
  console.log('✅ TypeScript: OK\n')
} catch (error) {
  console.log('❌ TypeScript: FAILED\n')
  process.exit(1)
}

// Test 2: Next.js build
console.log('2. Testing Next.js build...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Next.js build: OK\n')
} catch (error) {
  console.log('❌ Next.js build: FAILED\n')
  process.exit(1)
}

console.log('✅ All tests passed!')
console.log('📝 Note: Some features require service setup (Supabase, 阿里云盘)')
console.log('📝 Run "npm run dev" to test the UI')
```

### 7.2 Run Test Script / 运行测试脚本

```bash
node test-local.js
```

**Expected:** All tests pass

---

## Step 8: Test Specific Features / 步骤 8：测试特定功能

### 8.1 Test Rate Limiting / 测试速率限制

Create `test-rate-limit.js`:

```javascript
// test-rate-limit.js
const { rateLimit, getRateLimitKey, RATE_LIMITS } = require('./app/lib/rate-limit.ts')

// Mock request
const mockRequest = {
  headers: {
    get: (name) => {
      if (name === 'x-forwarded-for') return '127.0.0.1'
      return null
    }
  }
}

// Test rate limiting
const key = getRateLimitKey(mockRequest)
console.log('Rate limit key:', key)

for (let i = 0; i < 5; i++) {
  const limit = rateLimit(key, 3, 60000) // 3 requests per minute
  console.log(`Request ${i + 1}:`, limit.allowed ? '✅ Allowed' : '❌ Blocked')
}
```

**Note:** This requires TypeScript compilation. Better to test in browser.

### 8.2 Test Error Boundary / 测试错误边界

The error boundary is automatically active. To verify:

1. **Check file exists:** `app/error.tsx`
2. **Verify it exports default function**
3. **Note:** Will show when actual errors occur

### 8.3 Test Security Headers / 测试安全头

```bash
# After starting dev server
curl -I http://localhost:3000

# Check for security headers in response
# Should see:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# etc.
```

---

## Step 9: Code Quality Checks / 步骤 9：代码质量检查

### 9.1 Linting / 代码检查

```bash
npm run lint
```

**Expected:** No linting errors (or only warnings)

### 9.2 Type Checking / 类型检查

```bash
npx tsc --noEmit --pretty
```

**Expected:** No type errors

### 9.3 Check File Structure / 检查文件结构

Verify all new files exist:

```bash
# Check new files
ls -la app/api/upload/route.ts
ls -la app/api/user/profile/route.ts
ls -la app/lib/rate-limit.ts
ls -la app/error.tsx
ls -la app/forgot-password/page.tsx
ls -la app/reset-password/page.tsx
```

**Expected:** All files exist

---

## Step 10: Test Without Services / 步骤 10：无服务测试

### 10.1 What Works Without Services / 无服务时可用功能

✅ **Works:**
- Code compilation
- Type checking
- Component rendering
- Page navigation
- UI/UX
- Form validation
- Error boundaries
- Security headers

❌ **Doesn't Work:**
- Authentication (needs Supabase)
- Data storage (needs Supabase)
- File uploads (needs 阿里云盘)
- AI features (needs SiliconFlow API key)

### 10.2 Mock Services for Testing / 模拟服务测试

You can create mock implementations for testing:

**Create `app/lib/supabase/mock-client.ts`:**

```typescript
// Mock Supabase client for testing
export function createMockClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Mock error' } }),
      signUp: async () => ({ data: { user: null }, error: { message: 'Mock error' } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ data: [], error: null }) }),
      insert: () => ({ data: null, error: { message: 'Mock error' } }),
    }),
  }
}
```

**Note:** This is for advanced testing. For now, just verify code compiles.

---

## Step 11: Quick Test Checklist / 步骤 11：快速测试清单

Run through this checklist:

- [ ] `npm install` completes without errors
- [ ] `npx tsc --noEmit` shows no errors
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads
- [ ] Navigation bar appears
- [ ] Login page loads: http://localhost:3000/login
- [ ] Register page loads: http://localhost:3000/register
- [ ] Forgot password page loads: http://localhost:3000/forgot-password
- [ ] Reset password page loads: http://localhost:3000/reset-password
- [ ] All API routes exist (return errors, not 404)
- [ ] No console errors (except expected Supabase connection errors)
- [ ] Security headers are present (check with curl -I)

---

## Step 12: Expected Errors (Normal) / 步骤 12：预期错误（正常）

### 12.1 Supabase Connection Errors / Supabase 连接错误

**Expected errors:**
```
Failed to fetch
Supabase connection error
```

**This is normal** - you haven't set up Supabase yet. The code structure is correct.

### 12.2 阿里云盘 Errors / 阿里云盘错误

**Expected errors:**
```
Upload failed
Invalid credentials
```

**This is normal** - you haven't set up 阿里云盘 yet. The code structure is correct.

### 12.3 Authentication Errors / 认证错误

**Expected errors:**
```
Unauthorized
User not authenticated
```

**This is normal** - authentication requires Supabase. The code structure is correct.

---

## Step 13: What to Verify / 步骤 13：要验证的内容

### ✅ Code Quality / 代码质量

- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All imports resolve
- [ ] All components compile
- [ ] All API routes compile

### ✅ UI/UX / 用户界面

- [ ] Pages load correctly
- [ ] Navigation works
- [ ] Forms render
- [ ] Buttons work (even if they show errors)
- [ ] Responsive design works

### ✅ Structure / 结构

- [ ] All new files exist
- [ ] All routes are accessible
- [ ] Error handling is in place
- [ ] Security headers are configured

---

## Step 14: Next Steps After Testing / 步骤 14：测试后的下一步

Once you've verified:

1. ✅ Code compiles
2. ✅ Pages load
3. ✅ No structural errors

**Then proceed to:**
- Follow `STEP_BY_STEP_SETUP.md` for full setup
- Set up Supabase
- Set up 阿里云盘 (optional)
- Configure real environment variables
- Test with real services

---

## Troubleshooting / 故障排除

### Issue: Build Fails / 构建失败

**Check:**
- Node.js version: `node --version` (should be 18+)
- TypeScript version: `npx tsc --version`
- All files are saved
- No syntax errors

**Fix:**
- Update Node.js if needed
- Fix any TypeScript errors shown
- Check imports are correct

### Issue: Dev Server Won't Start / 开发服务器无法启动

**Check:**
- Port 3000 is available
- No other Next.js app running
- Environment variables are set (even if placeholders)

**Fix:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue: Pages Show Errors / 页面显示错误

**Expected:** Supabase connection errors are normal

**Not Expected:** 
- 404 errors (route doesn't exist)
- Syntax errors
- Component errors

**Fix:**
- Check file exists
- Check imports
- Check syntax

---

## Summary / 摘要

**What you can test now:**
- ✅ Code compilation
- ✅ Type checking
- ✅ Component rendering
- ✅ Page structure
- ✅ Navigation
- ✅ Form validation
- ✅ Error boundaries
- ✅ Security headers

**What requires service setup:**
- ❌ Authentication (needs Supabase)
- ❌ Data storage (needs Supabase)
- ❌ File uploads (needs 阿里云盘)
- ❌ AI features (needs API key)

**Next:** Once code tests pass, follow `STEP_BY_STEP_SETUP.md` for full setup.

---

**Ready to test! Run through the checklist above.** ✅

