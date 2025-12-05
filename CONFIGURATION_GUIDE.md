# Configuration Guide - AI Dictionary v5.0
# 配置指南 - AI 词典 v5.0

Complete step-by-step guide to configure Supabase, 阿里云盘, and Vercel for deployment.

---

## Table of Contents / 目录

1. [Supabase Setup](#1-supabase-setup--supabase-设置)
2. [阿里云盘 Setup](#2-阿里云盘-setup--阿里云盘-设置)
3. [Vercel Setup](#3-vercel-setup--vercel-设置)
4. [Local Development Setup](#4-local-development-setup--本地开发设置)
5. [Environment Variables](#5-environment-variables--环境变量)
6. [Database Migration](#6-database-migration--数据库迁移)
7. [Testing the Setup](#7-testing-the-setup--测试设置)
8. [Troubleshooting](#8-troubleshooting--故障排除)

---

## 1. Supabase Setup / Supabase 设置

### Step 1: Create Supabase Account / 创建 Supabase 账户

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with:
   - GitHub account (recommended), or
   - Email and password
4. Verify your email if required

### Step 2: Create New Project / 创建新项目

1. Click **"New Project"** button
2. Fill in project details:
   - **Name:** `ai-dictionary` (or your preferred name)
   - **Database Password:** Generate a strong password (save it securely!)
   - **Region:** Choose closest to your users (e.g., `Southeast Asia (Singapore)`)
   - **Pricing Plan:** Select **Free** tier
3. Click **"Create new project"**
4. Wait 2-3 minutes for project to be provisioned

### Step 3: Get API Keys / 获取 API 密钥

1. In your project dashboard, go to **Settings** → **API**
2. Find the following values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ Keep secret!)

3. Copy these values - you'll need them for environment variables

### Step 4: Configure Authentication / 配置认证

1. Go to **Authentication** → **Settings**
2. Enable **Email** provider (should be enabled by default)
3. Configure email settings:
   - **Enable email confirmations:** Optional (recommended for production)
   - **Enable email change confirmations:** Optional
   - **Enable secure email change:** Recommended
4. (Optional) Configure OAuth providers if needed:
   - Google, GitHub, etc.
5. Go to **URL Configuration**:
   - **Site URL:** `http://localhost:3000` (for development)
   - **Redirect URLs:** Add your production URL later

### Step 5: Create Database Tables / 创建数据库表

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy and paste the following SQL:

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

4. Click **"Run"** to execute the SQL
5. Verify tables are created:
   - Go to **Table Editor**
   - You should see: `user_profiles`, `notebook_entries`, `stories`

### Step 6: Verify RLS Policies / 验证 RLS 策略

1. Go to **Authentication** → **Policies**
2. Verify policies are created for all tables
3. Test policies (optional):
   - Create a test user
   - Try to access another user's data (should fail)

---

## 2. 阿里云盘 Setup / 阿里云盘 设置

### Step 1: Register 阿里云盘 Developer Account / 注册阿里云盘开发者账户

1. Go to [阿里云盘开放平台](https://open.alipan.com/) or search for "阿里云盘开放平台"
2. Click **"开发者入驻"** or **"Developer Registration"**
3. Fill in registration form:
   - Company/Individual information
   - Contact details
   - Use case description
4. Submit and wait for approval (usually 1-3 business days)

### Step 2: Create Application / 创建应用

1. After approval, log in to developer console
2. Click **"创建应用"** or **"Create Application"**
3. Fill in application details:
   - **应用名称:** `AI Dictionary` (or your preferred name)
   - **应用类型:** Web应用 (Web Application)
   - **应用描述:** Language learning dictionary application
   - **回调地址:** `http://localhost:3000/api/auth/callback/aliyun` (for development)
4. Submit application
5. After creation, you'll get:
   - **Client ID** (应用ID)
   - **Client Secret** (应用密钥)

### Step 3: Get Refresh Token / 获取刷新令牌

阿里云盘 uses OAuth 2.0 with refresh tokens. You need to:

1. **Option A: Use OAuth Flow (Recommended for production)**
   - Implement OAuth redirect flow
   - User authorizes your app
   - Receive access token and refresh token
   - Store refresh token securely

2. **Option B: Manual Token Generation (For development/testing)**
   - Use 阿里云盘 API tools or scripts
   - Generate refresh token manually
   - Store in environment variables

**Note:** The refresh token is long-lived and allows your app to access 阿里云盘 on behalf of the user.

### Step 4: Configure API Permissions / 配置 API 权限

1. In your application settings, enable required permissions:
   - **文件上传** (File Upload)
   - **文件读取** (File Read)
   - **文件管理** (File Management)
2. Save settings

### Step 5: Test API Connection / 测试 API 连接

You can test the connection using curl or Postman:

```bash
# Get access token using refresh token
curl -X POST "https://openapi.alipan.com/oauth/access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "refresh_token",
    "refresh_token": "YOUR_REFRESH_TOKEN",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
  }'
```

### Step 6: Create Storage Folder Structure / 创建存储文件夹结构

In 阿里云盘, create folders for organization:
- `/ai-dictionary/images/` - For word images
- `/ai-dictionary/audio/` - For audio files
- `/ai-dictionary/attachments/` - For other files

**Note:** You can create these programmatically via API after authentication.

---

## 3. Vercel Setup / Vercel 设置

### Step 1: Create Vercel Account / 创建 Vercel 账户

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with:
   - GitHub account (recommended), or
   - GitLab, Bitbucket, or Email
4. Complete email verification if required

### Step 2: Install Vercel CLI (Optional) / 安装 Vercel CLI（可选）

For local development and testing:

```bash
npm install -g vercel
```

Or use npx:
```bash
npx vercel
```

### Step 3: Prepare Your Repository / 准备仓库

1. Push your code to GitHub/GitLab/Bitbucket
2. Ensure your repository is public or grant Vercel access
3. Make sure you have:
   - `package.json` with build scripts
   - `.gitignore` (Vercel will ignore `.env.local`)
   - `next.config.js` (if custom configuration needed)

### Step 4: Deploy to Vercel / 部署到 Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository:
   - Select your Git provider (GitHub, etc.)
   - Select your repository
   - Click **"Import"**
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)
5. **DO NOT** click "Deploy" yet - we need to set environment variables first

#### Option B: Deploy via CLI

```bash
# In your project directory
vercel login
vercel
```

Follow the prompts to link your project.

### Step 5: Configure Environment Variables / 配置环境变量

1. In Vercel project settings, go to **Settings** → **Environment Variables**
2. Add the following variables:

#### Required Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 阿里云盘
ALIYUN_DRIVE_CLIENT_ID=your-client-id
ALIYUN_DRIVE_CLIENT_SECRET=your-client-secret
ALIYUN_DRIVE_REFRESH_TOKEN=your-refresh-token

# AI Services
SILICONFLOW_API_KEY=your-siliconflow-api-key
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1
AI_MODEL=deepseek-ai/DeepSeek-V3
```

#### Optional Variables:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Email (if using custom SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
```

3. For each variable, select environments:
   - **Production:** ✅
   - **Preview:** ✅ (optional, for PR previews)
   - **Development:** ✅ (optional, for local dev)

4. Click **"Save"**

### Step 6: Update Supabase Redirect URLs / 更新 Supabase 重定向 URL

1. Go back to Supabase dashboard
2. Go to **Authentication** → **URL Configuration**
3. Add your Vercel URLs:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** 
     - `https://your-app.vercel.app/**`
     - `https://your-app-*.vercel.app/**` (for preview deployments)

### Step 7: Deploy / 部署

1. Go back to Vercel project
2. Click **"Deploy"** button
3. Wait for build to complete (usually 2-5 minutes)
4. Once deployed, you'll get:
   - Production URL: `https://your-app.vercel.app`
   - Automatic SSL certificate
   - Global CDN

### Step 8: Configure Custom Domain (Optional) / 配置自定义域名（可选）

1. In Vercel project, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `dictionary.example.com`)
3. Follow DNS configuration instructions:
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation (usually < 1 hour)
4. Vercel will automatically provision SSL certificate

---

## 4. Local Development Setup / 本地开发设置

### Step 1: Install Dependencies / 安装依赖

```bash
npm install
```

### Step 2: Install Supabase Client / 安装 Supabase 客户端

```bash
npm install @supabase/supabase-js
```

### Step 3: Create Environment File / 创建环境文件

Create `.env.local` in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 阿里云盘
ALIYUN_DRIVE_CLIENT_ID=your-client-id
ALIYUN_DRIVE_CLIENT_SECRET=your-client-secret
ALIYUN_DRIVE_REFRESH_TOKEN=your-refresh-token

# AI Services
SILICONFLOW_API_KEY=your-siliconflow-api-key
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1
AI_MODEL=deepseek-ai/DeepSeek-V3

# Local Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Run Development Server / 运行开发服务器

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 5. Environment Variables / 环境变量

### Complete Environment Variables List / 完整环境变量列表

#### Required / 必需

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | `eyJhbGci...` |
| `ALIYUN_DRIVE_CLIENT_ID` | 阿里云盘 client ID | `xxxxx` |
| `ALIYUN_DRIVE_CLIENT_SECRET` | 阿里云盘 client secret | `xxxxx` |
| `ALIYUN_DRIVE_REFRESH_TOKEN` | 阿里云盘 refresh token | `xxxxx` |
| `SILICONFLOW_API_KEY` | SiliconFlow API key | `sk-xxxxx` |

#### Optional / 可选

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | App URL for callbacks | `http://localhost:3000` |
| `SILICONFLOW_API_BASE` | SiliconFlow API base URL | `https://api.siliconflow.cn/v1` |
| `AI_MODEL` | AI model name | `deepseek-ai/DeepSeek-V3` |

### Security Notes / 安全注意事项

⚠️ **Never commit `.env.local` to Git!**

- Add `.env.local` to `.gitignore`
- Use Vercel environment variables for production
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `ALIYUN_DRIVE_CLIENT_SECRET` secret
- Rotate keys regularly

---

## 6. Database Migration / 数据库迁移

### Migrating from localStorage / 从 localStorage 迁移

If you have existing users with localStorage data:

1. **Create Migration API Endpoint:**
   - `/api/migrate` - Accepts localStorage data
   - Validates user authentication
   - Imports data to Supabase

2. **User Flow:**
   - User logs in
   - System detects localStorage data
   - Prompts user to migrate
   - User clicks "Migrate Data"
   - Data imported to Supabase
   - localStorage cleared

3. **Implementation:**
   - See migration code in `app/api/migrate/route.ts` (to be created)

---

## 7. Testing the Setup / 测试设置

### Test Checklist / 测试清单

#### Authentication / 认证
- [ ] User can register with email/password
- [ ] User can login
- [ ] User can logout
- [ ] Protected routes redirect to login
- [ ] User session persists across page reloads

#### Database / 数据库
- [ ] User profile created on registration
- [ ] Notebook entries save to Supabase
- [ ] Stories save to Supabase
- [ ] RLS policies prevent cross-user data access
- [ ] Data persists after logout/login

#### File Storage / 文件存储
- [ ] Images upload to 阿里云盘
- [ ] Image URLs stored in database
- [ ] Images display correctly
- [ ] Audio files upload (if implemented)

#### API / API
- [ ] Word lookup works
- [ ] Image generation works
- [ ] Story generation works
- [ ] Rate limiting works (if implemented)

#### Deployment / 部署
- [ ] Vercel deployment succeeds
- [ ] Environment variables loaded correctly
- [ ] Production URL accessible
- [ ] SSL certificate active

---

## 8. Troubleshooting / 故障排除

### Common Issues / 常见问题

#### Issue: Supabase Connection Error
**Symptoms:** "Failed to connect to Supabase"

**Solutions:**
1. Check `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Verify Supabase project is active
4. Check network connectivity
5. Check browser console for CORS errors

#### Issue: Authentication Not Working
**Symptoms:** Can't login or register

**Solutions:**
1. Check Supabase Auth settings
2. Verify redirect URLs in Supabase
3. Check email confirmation settings
4. Verify environment variables
5. Check browser console for errors

#### Issue: RLS Policy Errors
**Symptoms:** "new row violates row-level security policy"

**Solutions:**
1. Verify user is authenticated (`auth.uid()` is not null)
2. Check RLS policies are enabled
3. Verify policy conditions match your use case
4. Test policies in Supabase SQL editor

#### Issue: 阿里云盘 Upload Fails
**Symptoms:** File upload errors

**Solutions:**
1. Verify refresh token is valid
2. Check API rate limits
3. Verify file size limits
4. Check API permissions
5. Verify client ID and secret

#### Issue: Vercel Build Fails
**Symptoms:** Deployment fails

**Solutions:**
1. Check build logs in Vercel dashboard
2. Verify all dependencies in `package.json`
3. Check Node.js version compatibility
4. Verify environment variables are set
5. Check for TypeScript errors locally first

#### Issue: Environment Variables Not Loading
**Symptoms:** Variables undefined in production

**Solutions:**
1. Verify variables are set in Vercel dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables
4. Use `NEXT_PUBLIC_` prefix for client-side variables
5. Check Vercel build logs

---

## 9. Next Steps / 下一步

After completing setup:

1. ✅ Test all features locally
2. ✅ Deploy to Vercel
3. ✅ Test production deployment
4. ✅ Monitor error logs
5. ✅ Set up analytics (optional)
6. ✅ Configure custom domain (optional)
7. ✅ Set up monitoring alerts (optional)

---

## 10. Support & Resources / 支持和资源

### Documentation / 文档

- **Supabase:** [https://supabase.com/docs](https://supabase.com/docs)
- **Vercel:** [https://vercel.com/docs](https://vercel.com/docs)
- **阿里云盘 API:** [阿里云盘开放平台文档](https://open.alipan.com/docs)
- **Next.js:** [https://nextjs.org/docs](https://nextjs.org/docs)

### Community / 社区

- **Supabase Discord:** [https://discord.supabase.com](https://discord.supabase.com)
- **Vercel Discord:** [https://vercel.com/discord](https://vercel.com/discord)
- **Next.js Discord:** [https://nextjs.org/discord](https://nextjs.org/discord)

---

**Last Updated:** 2024  
**Version:** 5.0

