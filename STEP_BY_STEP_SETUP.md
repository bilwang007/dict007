# Step-by-Step Setup Guide - AI Dictionary v5.0
# 分步设置指南 - AI 词典 v5.0

Complete step-by-step guide to get your application running from scratch.

---

## Prerequisites / 先决条件

Before starting, make sure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- A code editor (VS Code recommended)

---

## Step 1: Install Dependencies / 步骤 1：安装依赖

### 1.1 Open Terminal / 打开终端

Navigate to your project directory:
```bash
cd "/Users/billwang007/projects/dictionary-zara copy"
```

### 1.2 Install Packages / 安装包

```bash
npm install
```

This will install all required dependencies including:
- Next.js
- Supabase client libraries
- React and TypeScript
- All other dependencies

**Expected time:** 2-5 minutes

**If you see errors:**
- Make sure Node.js 18+ is installed: `node --version`
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again

---

## Step 2: Set Up Supabase / 步骤 2：设置 Supabase

### 2.1 Create Supabase Account / 创建 Supabase 账户

1. **Go to:** https://supabase.com
2. **Click:** "Start your project" or "Sign up"
3. **Choose sign-up method:**
   - GitHub (recommended)
   - Email and password
4. **Verify your email** if required

### 2.2 Create New Project / 创建新项目

1. **Click:** "New Project" button
2. **Fill in details:**
   - **Name:** `ai-dictionary` (or your preferred name)
   - **Database Password:** 
     - Click "Generate a strong password"
     - **SAVE THIS PASSWORD SECURELY!** You'll need it later
   - **Region:** Choose closest to your users
     - Recommended: `Southeast Asia (Singapore)` for Asia
     - Or: `West US (N. California)` for US
   - **Pricing Plan:** Select **Free** tier
3. **Click:** "Create new project"
4. **Wait:** 2-3 minutes for project to be provisioned

### 2.3 Get API Keys / 获取 API 密钥

1. **In your project dashboard**, go to:
   - **Settings** (gear icon in left sidebar)
   - **API** (under Project Settings)

2. **Copy these values:**
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` 
     - ⚠️ **Keep this secret!** Never expose it in client-side code

3. **Save these** - you'll add them to `.env.local` in Step 4

### 2.4 Configure Authentication / 配置认证

1. **Go to:** **Authentication** → **Settings**
2. **Verify settings:**
   - ✅ **Email** provider should be enabled
   - **Enable email confirmations:** Optional (recommended for production)
   - **Enable secure email change:** Recommended

3. **Go to:** **URL Configuration**
   - **Site URL:** `http://localhost:3000` (for development)
   - **Redirect URLs:** Add:
     - `http://localhost:3000/**`
     - `http://localhost:3000/api/auth/callback/**`

### 2.5 Create Database Tables / 创建数据库表

1. **Go to:** **SQL Editor** (in left sidebar)
2. **Click:** "New query"
3. **Copy the entire SQL script** from `CONFIGURATION_GUIDE.md` Section 1.5
   - Or see below for the complete script
4. **Paste** into the SQL editor
5. **Click:** "Run" button (or press Cmd/Ctrl + Enter)
6. **Verify:** You should see "Success. No rows returned"

**Complete SQL Script:**

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferred_languages JSONB DEFAULT '[]'::jsonb,
  learning_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notebook_entries table
CREATE TABLE IF NOT EXISTS notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  definition TEXT NOT NULL,
  definition_target TEXT,
  image_url TEXT,
  audio_url TEXT,
  example_sentence_1 TEXT NOT NULL,
  example_sentence_2 TEXT NOT NULL,
  example_translation_1 TEXT NOT NULL,
  example_translation_2 TEXT NOT NULL,
  usage_note TEXT,
  tags TEXT[] DEFAULT '{}',
  first_learned_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, word, target_language, native_language)
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  translation TEXT NOT NULL,
  words_used UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notebook_entries_user_id ON notebook_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_tags ON notebook_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notebook_entries_created_at ON notebook_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for notebook_entries
DROP POLICY IF EXISTS "Users can view own entries" ON notebook_entries;
CREATE POLICY "Users can view own entries"
  ON notebook_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own entries" ON notebook_entries;
CREATE POLICY "Users can insert own entries"
  ON notebook_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own entries" ON notebook_entries;
CREATE POLICY "Users can update own entries"
  ON notebook_entries FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own entries" ON notebook_entries;
CREATE POLICY "Users can delete own entries"
  ON notebook_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for stories
DROP POLICY IF EXISTS "Users can view own stories" ON stories;
CREATE POLICY "Users can view own stories"
  ON stories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
CREATE POLICY "Users can insert own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

7. **Verify tables created:**
   - Go to **Table Editor** (in left sidebar)
   - You should see: `user_profiles`, `notebook_entries`, `stories`

**✅ Supabase setup complete!**

---

## Step 3: Set Up 阿里云盘 / 步骤 3：设置阿里云盘

### 3.1 Register Developer Account / 注册开发者账户

1. **Go to:** https://open.alipan.com/
   - Or search for "阿里云盘开放平台" in Chinese
2. **Click:** "开发者入驻" or "Developer Registration"
3. **Fill in registration form:**
   - Company/Individual information
   - Contact details
   - Use case: "Language learning dictionary application"
4. **Submit** and wait for approval (usually 1-3 business days)

**Note:** If you don't have approval yet, you can skip this step and continue with other setup. File uploads won't work until 阿里云盘 is configured.

### 3.2 Create Application / 创建应用

1. **After approval**, log in to developer console
2. **Click:** "创建应用" or "Create Application"
3. **Fill in:**
   - **应用名称:** `AI Dictionary`
   - **应用类型:** Web应用 (Web Application)
   - **应用描述:** Language learning dictionary application
   - **回调地址:** `http://localhost:3000/api/auth/callback/aliyun`
4. **Submit** application
5. **After creation**, you'll get:
   - **Client ID** (应用ID)
   - **Client Secret** (应用密钥)

### 3.3 Get Refresh Token / 获取刷新令牌

**Option A: OAuth Flow (Recommended for production)**
- Implement OAuth redirect flow
- User authorizes your app
- Receive access token and refresh token

**Option B: Manual Token (For development/testing)**
- Use 阿里云盘 API tools
- Generate refresh token manually
- Store in environment variables

**For now, you can:**
- Leave these values empty in `.env.local`
- File uploads will fail, but other features will work
- Configure later when you have the tokens

**✅ 阿里云盘 setup complete! (or skipped for now)**

---

## Step 4: Configure Environment Variables / 步骤 4：配置环境变量

### 4.1 Create Environment File / 创建环境文件

1. **In your project root**, create `.env.local`:
   ```bash
   cp env.local.template .env.local
   ```

2. **Open** `.env.local` in your editor

### 4.2 Add Supabase Variables / 添加 Supabase 变量

Replace the placeholders with your actual values from Step 2.3:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:**
- Replace `xxxxx` with your actual project ID
- Copy the full keys (they're long)
- No quotes needed around values

### 4.3 Add 阿里云盘 Variables / 添加阿里云盘变量

If you have 阿里云盘 credentials from Step 3:

```env
# 阿里云盘
ALIYUN_DRIVE_CLIENT_ID=your-client-id-here
ALIYUN_DRIVE_CLIENT_SECRET=your-client-secret-here
ALIYUN_DRIVE_REFRESH_TOKEN=your-refresh-token-here
```

**If you don't have these yet:**
- Leave them empty or use placeholder values
- File uploads won't work until configured

### 4.4 Add AI Service Variables / 添加 AI 服务变量

Add your SiliconFlow API key:

```env
# AI Services
SILICONFLOW_API_KEY=your-siliconflow-api-key-here
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1
AI_MODEL=deepseek-ai/DeepSeek-V3
```

**To get SiliconFlow API key:**
1. Go to: https://cloud.siliconflow.cn
2. Sign up or log in
3. Get your API key from dashboard
4. Add to `.env.local`

### 4.5 Add App URL / 添加应用 URL

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**✅ Environment variables configured!**

---

## Step 5: Test Local Development / 步骤 5：测试本地开发

### 5.1 Start Development Server / 启动开发服务器

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- ready started server on 0.0.0.0:3000
```

### 5.2 Open Browser / 打开浏览器

Go to: http://localhost:3000

### 5.3 Test Authentication / 测试认证

1. **Click:** "Login" button (top right)
2. **Click:** "Don't have an account? Register"
3. **Fill in registration form:**
   - Email: `test@example.com` (use a real email for testing)
   - Password: `Test1234!` (meets requirements)
   - Confirm password: `Test1234!`
4. **Click:** "Register"
5. **Check email** for verification (if enabled)
6. **Go back** and login

### 5.4 Test Features / 测试功能

1. **Word Lookup:**
   - Select languages
   - Enter a word
   - Click lookup
   - Verify definition appears

2. **Save to Notebook:**
   - After lookup, click "Save to Notebook"
   - Verify entry is saved

3. **View Notebook:**
   - Click "Notebook" in navigation
   - Verify saved entries appear

4. **Study Mode:**
   - Click "Study" in navigation
   - Verify flashcards work

### 5.5 Check for Errors / 检查错误

**In browser console (F12):**
- Look for any red errors
- Common issues:
  - Missing environment variables
  - Supabase connection errors
  - API key errors

**In terminal:**
- Look for server errors
- Common issues:
  - Port 3000 already in use
  - Missing dependencies

**✅ Local development working!**

---

## Step 6: Deploy to Vercel / 步骤 6：部署到 Vercel

### 6.1 Push Code to Git / 推送代码到 Git

1. **Initialize Git** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AI Dictionary v5.0"
   ```

2. **Create GitHub repository:**
   - Go to: https://github.com/new
   - Create new repository
   - Don't initialize with README

3. **Push code:**
   ```bash
   git remote add origin https://github.com/yourusername/ai-dictionary.git
   git branch -M main
   git push -u origin main
   ```

### 6.2 Create Vercel Account / 创建 Vercel 账户

1. **Go to:** https://vercel.com
2. **Click:** "Sign Up"
3. **Sign up with:** GitHub (recommended)

### 6.3 Deploy Project / 部署项目

1. **In Vercel dashboard**, click "Add New..." → "Project"
2. **Import** your Git repository:
   - Select your Git provider
   - Select your repository
   - Click "Import"
3. **Configure project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)
4. **DO NOT click "Deploy" yet!**

### 6.4 Add Environment Variables / 添加环境变量

1. **In project settings**, go to **Environment Variables**
2. **Add all variables** from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ALIYUN_DRIVE_CLIENT_ID` (if you have it)
   - `ALIYUN_DRIVE_CLIENT_SECRET` (if you have it)
   - `ALIYUN_DRIVE_REFRESH_TOKEN` (if you have it)
   - `SILICONFLOW_API_KEY`
   - `SILICONFLOW_API_BASE`
   - `AI_MODEL`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL after deployment)

3. **For each variable**, select environments:
   - ✅ **Production**
   - ✅ **Preview** (optional)
   - ✅ **Development** (optional)

4. **Click:** "Save"

### 6.5 Update Supabase Redirect URLs / 更新 Supabase 重定向 URL

1. **Go back to Supabase dashboard**
2. **Go to:** Authentication → URL Configuration
3. **Add your Vercel URLs:**
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:**
     - `https://your-app.vercel.app/**`
     - `https://your-app-*.vercel.app/**` (for preview deployments)

### 6.6 Deploy / 部署

1. **Go back to Vercel**
2. **Click:** "Deploy" button
3. **Wait:** 2-5 minutes for build to complete
4. **Once deployed**, you'll get:
   - Production URL: `https://your-app.vercel.app`
   - Automatic SSL certificate
   - Global CDN

### 6.7 Update App URL / 更新应用 URL

1. **In Vercel**, go to Environment Variables
2. **Update** `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
3. **Redeploy** (or it will update on next deployment)

**✅ Deployment complete!**

---

## Step 7: Final Testing / 步骤 7：最终测试

### 7.1 Test Production Deployment / 测试生产部署

1. **Visit** your Vercel URL
2. **Test all features:**
   - Registration
   - Login
   - Word lookup
   - Save to notebook
   - Study mode
   - Logout

### 7.2 Verify Security / 验证安全

1. **Check HTTPS:** URL should start with `https://`
2. **Test protected routes:** Try accessing `/notebook` without login
3. **Verify redirects:** Should redirect to login

### 7.3 Monitor / 监控

1. **Vercel Dashboard:**
   - Check deployment status
   - View logs
   - Monitor performance

2. **Supabase Dashboard:**
   - Check database usage
   - View authentication logs
   - Monitor API usage

**✅ Everything working!**

---

## Troubleshooting / 故障排除

### Common Issues / 常见问题

#### Issue: "Failed to connect to Supabase"
**Solution:**
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Verify Supabase project is active

#### Issue: "Unauthorized" errors
**Solution:**
- Check user is logged in
- Verify Supabase redirect URLs are configured
- Check RLS policies are set up correctly

#### Issue: "Rate limit exceeded"
**Solution:**
- Wait a minute and try again
- This is normal - rate limiting is working

#### Issue: File upload fails
**Solution:**
- Check 阿里云盘 credentials are configured
- Verify refresh token is valid
- Check API permissions

#### Issue: Build fails on Vercel
**Solution:**
- Check all environment variables are set
- Verify Node.js version (should be 18+)
- Check build logs for specific errors

---

## Next Steps / 下一步

After setup is complete:

1. ✅ **Customize:** Update branding, colors, text
2. ✅ **Test:** Thoroughly test all features
3. ✅ **Monitor:** Set up error tracking (optional)
4. ✅ **Optimize:** Review performance metrics
5. ✅ **Scale:** Upgrade services when needed

---

## Support / 支持

If you encounter issues:

1. **Check:** `CONFIGURATION_GUIDE.md` Section 8 (Troubleshooting)
2. **Review:** Error messages in browser console and terminal
3. **Check:** Service dashboards (Supabase, Vercel) for errors
4. **Documentation:**
   - Supabase: https://supabase.com/docs
   - Vercel: https://vercel.com/docs
   - Next.js: https://nextjs.org/docs

---

**Setup Complete! 🎉**

Your AI Dictionary v5.0 is now ready to use!

