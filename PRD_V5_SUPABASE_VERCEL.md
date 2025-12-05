# Product Requirements Document (PRD) - Version 5.0
# 产品需求文档 - 版本 5.0

## AI Dictionary - Cloud-Native Language Learning Application
## AI 词典 - 云原生语言学习应用

---

## Document Information / 文档信息

**Version:** 5.0  
**Last Updated:** 2024  
**Deployment Target:** Vercel (Serverless)  
**Database:** Supabase (PostgreSQL)  
**File Storage:** 阿里云盘 (Alibaba Cloud Drive)  
**Authentication:** Supabase Auth (Email/Password + OAuth)  
**Status:** Complete Product Requirements Document with Cloud Architecture  
**Document Type:** PRD (Product Requirements Document) + Technical Deployment Guide

---

## 1. Product Overview / 产品概述

### English
**Product Name:** AI Dictionary  
**Version:** 5.0  
**Deployment:** Vercel with Supabase + 阿里云盘

AI Dictionary is an intelligent, AI-powered language learning tool that helps users learn new languages through interactive definitions, visual aids, audio pronunciation, and study tools. This version includes:

- ✅ **Full User Authentication:** Registration, login, password reset, email verification
- ✅ **Cloud Database:** Supabase PostgreSQL for persistent, multi-user data storage
- ✅ **Cloud File Storage:** 阿里云盘 integration for images and large attachments
- ✅ **Serverless Deployment:** Vercel for automatic scaling and global CDN
- ✅ **Security Controls:** Rate limiting, input validation, CSRF protection, secure sessions
- ✅ **Multi-device Sync:** Access your learning data from any device

**Key Changes from v4.0:**
- ✅ Migrated from localStorage to Supabase database
- ✅ Added full authentication system with Supabase Auth
- ✅ Integrated 阿里云盘 for file storage (images, audio, attachments)
- ✅ Optimized for Vercel serverless deployment
- ✅ Enhanced security with Row Level Security (RLS) policies
- ✅ Production-ready with free tier services

### 中文
**产品名称:** AI 词典  
**版本:** 5.0  
**部署:** Vercel + Supabase + 阿里云盘

AI 词典是一款智能的、AI 驱动的语言学习工具，通过交互式定义、视觉辅助、音频发音和学习工具帮助用户学习新语言。此版本包括：

- ✅ **完整用户认证：** 注册、登录、密码重置、邮箱验证
- ✅ **云数据库：** Supabase PostgreSQL 用于持久化、多用户数据存储
- ✅ **云文件存储：** 阿里云盘集成用于图片和大文件附件
- ✅ **无服务器部署：** Vercel 用于自动扩展和全球 CDN
- ✅ **安全控制：** 速率限制、输入验证、CSRF 保护、安全会话
- ✅ **多设备同步：** 从任何设备访问您的学习数据

**与 v4.0 的主要变化:**
- ✅ 从 localStorage 迁移到 Supabase 数据库
- ✅ 添加了完整的 Supabase Auth 认证系统
- ✅ 集成阿里云盘用于文件存储（图片、音频、附件）
- ✅ 针对 Vercel 无服务器部署优化
- ✅ 使用行级安全（RLS）策略增强安全性
- ✅ 使用免费服务层实现生产就绪

---

## 2. Architecture Overview / 架构概述

### 2.1 Technology Stack / 技术栈

#### Frontend / 前端
- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State Management:** React Hooks + Server Components

#### Backend / 后端
- **Runtime:** Node.js 18+ (Vercel Serverless Functions)
- **API:** Next.js API Routes (Serverless)
- **Database:** Supabase PostgreSQL (managed)
- **ORM:** Supabase Client (PostgREST)
- **Authentication:** Supabase Auth

#### Storage / 存储
- **Database:** Supabase PostgreSQL (500MB free tier)
- **File Storage:** 阿里云盘 (Alibaba Cloud Drive)
  - Images: Word illustrations, flashcards
  - Audio: Pronunciation files
  - Attachments: Large files, documents

#### AI Services / AI 服务
- **Primary:** SiliconFlow API (OpenAI-compatible)
- **Alternative:** OpenAI API, Anthropic Claude, Google Gemini
- **Image Search:** Unsplash API
- **Audio:** Browser Web Speech API with API fallback

#### Deployment / 部署
- **Platform:** Vercel (Serverless)
- **CDN:** Vercel Edge Network (global)
- **SSL:** Automatic (Vercel managed)
- **Domain:** Custom domain support
- **CI/CD:** Automatic from Git

### 2.2 System Architecture / 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  (Next.js App - React Components, Client-side Logic)        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  (Global CDN, Serverless Functions, API Routes)            │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│   Supabase   │ │  阿里云盘    │ │  AI Services │
│  PostgreSQL  │ │ (File Store)│ │ (SiliconFlow)│
│  + Auth      │ │              │ │             │
└──────────────┘ └──────────────┘ └─────────────┘
```

### 2.3 Data Flow / 数据流

#### Word Lookup Flow / 单词查询流程
1. User enters word → Client sends request to `/api/lookup`
2. Vercel Serverless Function processes request
3. AI Service (SiliconFlow) generates definition
4. Image URL fetched from 阿里云盘 or generated
5. Response returned to client
6. Result saved to Supabase (if user saves to notebook)

#### Authentication Flow / 认证流程
1. User registers/logs in → Supabase Auth handles authentication
2. JWT token stored in httpOnly cookie (secure)
3. All API requests include auth token
4. Supabase RLS policies enforce user data isolation
5. Session managed by Supabase Auth

#### File Upload Flow / 文件上传流程
1. User uploads file → Client sends to `/api/upload`
2. Serverless function validates file
3. File uploaded to 阿里云盘 via API
4. File URL returned and stored in Supabase
5. Client displays file using returned URL

---

## 3. Core Features / 核心功能

### 3.1 User Authentication / 用户认证

#### English
- **Registration:**
  - Email and password registration
  - Email verification (optional but recommended)
  - Password strength requirements (min 8 chars, mixed case, numbers)
  - Terms of service acceptance
  
- **Login:**
  - Email/password authentication
  - "Remember me" functionality
  - Forgot password flow
  - Account lockout after failed attempts (security)
  
- **Session Management:**
  - Secure JWT tokens (httpOnly cookies)
  - Automatic token refresh
  - Session timeout (configurable)
  - Multi-device support
  
- **Password Security:**
  - Bcrypt hashing (handled by Supabase)
  - Password reset via email
  - Password change functionality
  
- **User Profile:**
  - Basic user information (email, name, avatar)
  - Learning preferences
  - Account settings
  
- **Logout:**
  - Secure session termination
  - Token invalidation
  
- **Protected Routes:**
  - All features require authentication
  - Automatic redirect to login if not authenticated
  - Public pages: Landing, Login, Register

#### 中文
- **注册:**
  - 邮箱和密码注册
  - 邮箱验证（可选但推荐）
  - 密码强度要求（最少 8 个字符，大小写混合，数字）
  - 接受服务条款
  
- **登录:**
  - 邮箱/密码认证
  - "记住我"功能
  - 忘记密码流程
  - 失败尝试后账户锁定（安全）
  
- **会话管理:**
  - 安全 JWT 令牌（httpOnly cookies）
  - 自动令牌刷新
  - 会话超时（可配置）
  - 多设备支持
  
- **密码安全:**
  - Bcrypt 哈希（由 Supabase 处理）
  - 通过邮箱重置密码
  - 密码更改功能
  
- **用户资料:**
  - 基本用户信息（邮箱、姓名、头像）
  - 学习偏好
  - 账户设置
  
- **登出:**
  - 安全会话终止
  - 令牌失效
  
- **受保护路由:**
  - 所有功能需要认证
  - 如果未认证则自动重定向到登录
  - 公开页面：首页、登录、注册

### 3.2 Word Lookup / 单词查询

#### English
- **Multi-language Support:** 10 languages (English, Spanish, Chinese, Hindi, Arabic, Portuguese, Bengali, Russian, Japanese, French)
- **Input Types:** Words, phrases, or sentences
- **Dual Language Definitions:**
  - Primary definition in target language
  - Secondary definition/translation in native language
- **Visual Learning:** 
  - Images stored in 阿里云盘
  - AI-generated or Unsplash-sourced images
  - Fast CDN delivery via Vercel Edge
- **Audio Pronunciation:** Browser TTS with API fallback
- **Example Sentences:** 2 example sentences with translations
- **Usage Notes:** Cultural context, tone, synonyms, common confusions
- **Caching:** 
  - Client-side cache (24 hours)
  - Server-side cache (Vercel Edge Cache)
- **User-specific:** All lookups tracked per user in Supabase

#### 中文
- **多语言支持:** 10 种语言（英语、西班牙语、中文、印地语、阿拉伯语、葡萄牙语、孟加拉语、俄语、日语、法语）
- **输入类型:** 单词、短语或句子
- **双语定义:**
  - 目标语言的主要定义
  - 母语的翻译/解释
- **视觉学习:**
  - 图片存储在阿里云盘
  - AI 生成或 Unsplash 来源的图片
  - 通过 Vercel Edge 快速 CDN 交付
- **音频发音:** 浏览器 TTS，带 API 备用方案
- **例句:** 2 个带翻译的例句
- **使用说明:** 文化背景、语调、同义词、常见混淆
- **缓存:**
  - 客户端缓存（24 小时）
  - 服务器端缓存（Vercel Edge Cache）
- **用户特定:** 所有查询在 Supabase 中按用户跟踪

### 3.3 Notebook / 笔记本

#### English
- **Save Entries:** Save any lookup result to personal notebook (stored in Supabase)
- **Entry Management:**
  - View all saved words (user-specific)
  - Delete entries
  - Replace existing entries with updated definitions
  - Edit entries (tags, notes)
- **Smart Detection:** Automatically detects if word is already saved
- **Replace Prompt:** Asks user to replace when looking up saved words
- **Story Generation:** Generate stories using selected words
  - Story in target language
  - Translation in native language (toggleable)
  - Select All / Deselect All functionality
  - Stories saved to Supabase
- **Tags & Organization:**
  - Add tags to entries
  - Filter by tags
  - Bulk tag operations
- **Search & Filter:**
  - Search by word
  - Filter by language pair
  - Filter by tags
  - Sort by date, word, language
- **Data Persistence:** All data stored in Supabase, synced across devices

#### 中文
- **保存条目:** 将任何查询结果保存到个人笔记本（存储在 Supabase）
- **条目管理:**
  - 查看所有已保存的单词（用户特定）
  - 删除条目
  - 用更新的定义替换现有条目
  - 编辑条目（标签、备注）
- **智能检测:** 自动检测单词是否已保存
- **替换提示:** 查询已保存单词时询问是否替换
- **故事生成:** 使用选定的单词生成故事
  - 目标语言的故事
  - 母语翻译（可切换）
  - 全选/取消全选功能
  - 故事保存到 Supabase
- **标签和组织:**
  - 为条目添加标签
  - 按标签筛选
  - 批量标签操作
- **搜索和筛选:**
  - 按单词搜索
  - 按语言对筛选
  - 按标签筛选
  - 按日期、单词、语言排序
- **数据持久性:** 所有数据存储在 Supabase，跨设备同步

### 3.4 Study Mode / 学习模式

#### English
- **Flashcards:** Interactive flashcards with flip animation
- **Card Front:** Word in target language + image (from 阿里云盘)
- **Card Back:** Word + definition in native language + example sentence
- **Translation Toggle:** One-click toggle to show/hide example sentence translation
- **Navigation:** Previous/Next buttons and shuffle functionality
- **Progress Indicator:** Shows current card position
- **Audio Integration:** Play pronunciation without flipping card
- **Study Statistics:** Track study sessions in Supabase
- **Spaced Repetition:** (Future) Algorithm-based review scheduling

#### 中文
- **抽认卡:** 带翻转动画的交互式抽认卡
- **卡片正面:** 目标语言单词 + 图片（来自阿里云盘）
- **卡片背面:** 单词 + 母语定义 + 例句
- **翻译切换:** 一键切换显示/隐藏例句翻译
- **导航:** 上一张/下一张按钮和随机播放功能
- **进度指示器:** 显示当前卡片位置
- **音频集成:** 播放发音而不翻转卡片
- **学习统计:** 在 Supabase 中跟踪学习会话
- **间隔重复:** （未来）基于算法的复习计划

---

## 4. Database Schema / 数据库架构

### 4.1 Supabase Tables / Supabase 表

#### Users Table (Managed by Supabase Auth)
```sql
-- Automatically managed by Supabase Auth
-- Additional user metadata can be stored in user_profiles table
```

#### User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferred_languages JSONB DEFAULT '[]'::jsonb,
  learning_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Notebook Entries Table
```sql
CREATE TABLE notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  definition TEXT NOT NULL,
  definition_target TEXT,
  image_url TEXT, -- URL from 阿里云盘
  audio_url TEXT, -- URL from 阿里云盘
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

-- Indexes
CREATE INDEX idx_notebook_entries_user_id ON notebook_entries(user_id);
CREATE INDEX idx_notebook_entries_tags ON notebook_entries USING GIN(tags);
CREATE INDEX idx_notebook_entries_created_at ON notebook_entries(created_at DESC);

-- Enable RLS
ALTER TABLE notebook_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own entries
CREATE POLICY "Users can view own entries"
  ON notebook_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON notebook_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON notebook_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON notebook_entries FOR DELETE
  USING (auth.uid() = user_id);
```

#### Stories Table
```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- Story in target language
  translation TEXT NOT NULL, -- Translation in native language
  words_used UUID[] DEFAULT '{}', -- Array of notebook entry IDs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own stories
CREATE POLICY "Users can view own stories"
  ON stories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);
```

#### Learning Progress Table (Future Enhancement)
```sql
CREATE TABLE learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES notebook_entries(id) ON DELETE CASCADE,
  mastery_level INTEGER DEFAULT 0, -- 0=new, 1=learning, 2=mastered
  review_count INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_id)
);

-- Indexes
CREATE INDEX idx_learning_progress_user_id ON learning_progress(user_id);
CREATE INDEX idx_learning_progress_next_review ON learning_progress(next_review_at);

-- Enable RLS
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own progress
CREATE POLICY "Users can manage own progress"
  ON learning_progress
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## 5. Security Requirements / 安全要求

### 5.1 Authentication Security / 认证安全

#### English
- **Password Requirements:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - Special characters recommended
  
- **Session Security:**
  - JWT tokens with expiration (1 hour default)
  - Automatic token refresh
  - httpOnly cookies (prevents XSS)
  - Secure flag (HTTPS only)
  - SameSite attribute (CSRF protection)
  
- **Account Protection:**
  - Rate limiting on login attempts (5 attempts per 15 minutes)
  - Account lockout after failed attempts
  - Email verification (optional but recommended)
  - Password reset via secure email link
  
- **API Security:**
  - All API routes require authentication (except public endpoints)
  - Rate limiting per user (100 requests per minute)
  - Input validation and sanitization
  - SQL injection prevention (parameterized queries via Supabase)
  - XSS prevention (React automatic escaping)

#### 中文
- **密码要求:**
  - 最少 8 个字符
  - 至少一个大写字母
  - 至少一个小写字母
  - 至少一个数字
  - 推荐使用特殊字符
  
- **会话安全:**
  - 带过期时间的 JWT 令牌（默认 1 小时）
  - 自动令牌刷新
  - httpOnly cookies（防止 XSS）
  - Secure 标志（仅 HTTPS）
  - SameSite 属性（CSRF 保护）
  
- **账户保护:**
  - 登录尝试速率限制（15 分钟内 5 次尝试）
  - 失败尝试后账户锁定
  - 邮箱验证（可选但推荐）
  - 通过安全邮箱链接重置密码
  
- **API 安全:**
  - 所有 API 路由需要认证（除公共端点外）
  - 每用户速率限制（每分钟 100 个请求）
  - 输入验证和清理
  - SQL 注入预防（通过 Supabase 参数化查询）
  - XSS 预防（React 自动转义）

### 5.2 Data Security / 数据安全

#### English
- **Row Level Security (RLS):**
  - All tables have RLS enabled
  - Users can only access their own data
  - Policies enforced at database level
  
- **Data Encryption:**
  - Data in transit: HTTPS/TLS
  - Data at rest: Supabase managed encryption
  - Passwords: Bcrypt hashed (Supabase)
  
- **File Storage Security:**
  - 阿里云盘 access tokens stored securely
  - File upload validation (type, size)
  - Private file access (signed URLs if needed)
  
- **Privacy:**
  - No user data shared with third parties
  - GDPR compliance considerations
  - User data deletion on account deletion

#### 中文
- **行级安全（RLS）:**
  - 所有表都启用了 RLS
  - 用户只能访问自己的数据
  - 在数据库级别强制执行策略
  
- **数据加密:**
  - 传输中的数据：HTTPS/TLS
  - 静态数据：Supabase 管理的加密
  - 密码：Bcrypt 哈希（Supabase）
  
- **文件存储安全:**
  - 阿里云盘访问令牌安全存储
  - 文件上传验证（类型、大小）
  - 私有文件访问（如需要，使用签名 URL）
  
- **隐私:**
  - 不与第三方共享用户数据
  - GDPR 合规性考虑
  - 删除账户时删除用户数据

---

## 6. Performance Requirements / 性能要求

### 6.1 Response Times / 响应时间

#### English
- **Word Lookup:** < 3 seconds (definition), image loads asynchronously
- **Page Load:** < 2 seconds (first load), < 500ms (cached)
- **API Response:** < 1 second (cached), < 3 seconds (uncached)
- **File Upload:** < 5 seconds (for images < 5MB)
- **Database Queries:** < 100ms (indexed queries)

#### 中文
- **单词查询:** < 3 秒（定义），图片异步加载
- **页面加载:** < 2 秒（首次加载），< 500ms（缓存）
- **API 响应:** < 1 秒（缓存），< 3 秒（未缓存）
- **文件上传:** < 5 秒（图片 < 5MB）
- **数据库查询:** < 100ms（索引查询）

### 6.2 Scalability / 可扩展性

#### English
- **Concurrent Users:** Support 1000+ concurrent users (Vercel serverless)
- **Database:** Supabase free tier (500MB), can scale to paid tier
- **File Storage:** 阿里云盘 free tier, can scale as needed
- **CDN:** Vercel Edge Network (global, automatic)
- **Auto-scaling:** Vercel handles automatically

#### 中文
- **并发用户:** 支持 1000+ 并发用户（Vercel 无服务器）
- **数据库:** Supabase 免费层（500MB），可扩展到付费层
- **文件存储:** 阿里云盘免费层，可根据需要扩展
- **CDN:** Vercel Edge 网络（全球，自动）
- **自动扩展:** Vercel 自动处理

---

## 7. Deployment Architecture / 部署架构

### 7.1 Vercel Deployment / Vercel 部署

#### English
- **Platform:** Vercel (Serverless)
- **Framework:** Next.js 14+ (detected automatically)
- **Build Command:** `npm run build` (automatic)
- **Output Directory:** `.next` (automatic)
- **Install Command:** `npm install` (automatic)
- **Node Version:** 18.x (configured in `package.json`)

#### Features:
- Automatic deployments from Git (GitHub, GitLab, Bitbucket)
- Preview deployments for pull requests
- Production deployments for main branch
- Automatic SSL certificates
- Global CDN (Edge Network)
- Serverless functions (auto-scaling)
- Environment variables management
- Analytics and monitoring

#### 中文
- **平台:** Vercel（无服务器）
- **框架:** Next.js 14+（自动检测）
- **构建命令:** `npm run build`（自动）
- **输出目录:** `.next`（自动）
- **安装命令:** `npm install`（自动）
- **Node 版本:** 18.x（在 `package.json` 中配置）

#### 功能:
- 从 Git 自动部署（GitHub、GitLab、Bitbucket）
- 拉取请求的预览部署
- 主分支的生产部署
- 自动 SSL 证书
- 全球 CDN（Edge 网络）
- 无服务器函数（自动扩展）
- 环境变量管理
- 分析和监控

### 7.2 Environment Variables / 环境变量

#### Required Variables / 必需变量
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 阿里云盘 (Alibaba Cloud Drive)
ALIYUN_DRIVE_CLIENT_ID=your-client-id
ALIYUN_DRIVE_CLIENT_SECRET=your-client-secret
ALIYUN_DRIVE_REFRESH_TOKEN=your-refresh-token

# AI Services
SILICONFLOW_API_KEY=your-siliconflow-api-key
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1
AI_MODEL=deepseek-ai/DeepSeek-V3

# Optional
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 8. Configuration Guide / 配置指南

### 8.1 Supabase Setup / Supabase 设置

See detailed guide in `CONFIGURATION_GUIDE.md` section 1.

### 8.2 阿里云盘 Setup / 阿里云盘 设置

See detailed guide in `CONFIGURATION_GUIDE.md` section 2.

### 8.3 Vercel Setup / Vercel 设置

See detailed guide in `CONFIGURATION_GUIDE.md` section 3.

---

## 9. Migration from v4.0 / 从 v4.0 迁移

### 9.1 Data Migration / 数据迁移

#### English
If users have existing data in localStorage:
1. Provide migration tool in UI (one-time)
2. User exports localStorage data
3. User imports data after login
4. Data saved to Supabase

#### 中文
如果用户在 localStorage 中有现有数据：
1. 在 UI 中提供迁移工具（一次性）
2. 用户导出 localStorage 数据
3. 用户登录后导入数据
4. 数据保存到 Supabase

---

## 10. Testing Strategy / 测试策略

### 10.1 Test Types / 测试类型

#### English
- **Unit Tests:** Component logic, utility functions
- **Integration Tests:** API routes, database operations
- **E2E Tests:** User flows (login, lookup, save, study)
- **Security Tests:** Authentication, RLS policies, input validation
- **Performance Tests:** Response times, load testing

#### 中文
- **单元测试:** 组件逻辑、工具函数
- **集成测试:** API 路由、数据库操作
- **E2E 测试:** 用户流程（登录、查询、保存、学习）
- **安全测试:** 认证、RLS 策略、输入验证
- **性能测试:** 响应时间、负载测试

---

## 11. Monitoring & Analytics / 监控和分析

### 11.1 Monitoring / 监控

#### English
- **Vercel Analytics:** Automatic performance monitoring
- **Supabase Dashboard:** Database performance, query analytics
- **Error Tracking:** Vercel error logs, Sentry (optional)
- **Uptime Monitoring:** Vercel status page

#### 中文
- **Vercel Analytics:** 自动性能监控
- **Supabase Dashboard:** 数据库性能、查询分析
- **错误跟踪:** Vercel 错误日志、Sentry（可选）
- **正常运行时间监控:** Vercel 状态页面

---

## 12. Cost Estimation / 成本估算

### 12.1 Free Tier Limits / 免费层限制

#### English
- **Vercel:** 
  - 100GB bandwidth/month
  - Unlimited serverless function invocations
  - Automatic SSL
  
- **Supabase:**
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
  - 2GB bandwidth/month
  
- **阿里云盘:**
  - Free tier (check current limits)
  - API rate limits apply

#### Total Monthly Cost: $0 (within free tier limits)

#### 中文
- **Vercel:**
  - 100GB 带宽/月
  - 无限制的无服务器函数调用
  - 自动 SSL
  
- **Supabase:**
  - 500MB 数据库
  - 1GB 文件存储
  - 50,000 月活跃用户
  - 2GB 带宽/月
  
- **阿里云盘:**
  - 免费层（检查当前限制）
  - 适用 API 速率限制

#### 总月成本：$0（在免费层限制内）

---

## 13. Future Enhancements / 未来增强功能

### English
1. **Spaced Repetition:** Algorithm-based review scheduling
2. **Progress Tracking:** Detailed statistics and analytics
3. **Social Features:** Share words and stories with friends
4. **Mobile App:** React Native or PWA
5. **Offline Mode:** Service worker for offline access
6. **Voice Input:** Speech-to-text for lookups
7. **Quiz Mode:** Multiple choice and fill-in-the-blank exercises
8. **More Languages:** Expand beyond 10 languages
9. **AI Tutoring:** Personalized learning recommendations
10. **Export/Import:** Backup and restore data

### 中文
1. **间隔重复:** 基于算法的复习计划
2. **进度跟踪:** 详细的统计和分析
3. **社交功能:** 与朋友分享单词和故事
4. **移动应用:** React Native 或 PWA
5. **离线模式:** 用于离线访问的服务工作者
6. **语音输入:** 语音转文字查询
7. **测验模式:** 多项选择和填空练习
8. **更多语言:** 扩展到 10 种以上语言
9. **AI 辅导:** 个性化学习推荐
10. **导出/导入:** 备份和恢复数据

---

## 14. Recent Improvements & Fixes / 最近的改进和修复

### Database Setup Improvements / 数据库设置改进

#### Comprehensive Safe Setup Script / 全面的安全设置脚本
- ✅ **Created `SETUP_ALL_TABLES_SAFE.sql`** - Single script to safely set up all 7 required tables
- ✅ **Idempotent Design** - Can be run multiple times without errors
- ✅ **Defensive Checks** - Verifies table and column existence before any operation
- ✅ **Handles Existing Tables** - Gracefully handles tables with different schemas

**Tables Created:**
1. `user_profiles` - User accounts and roles
2. `word_definitions` - Shared dictionary for all users
3. `notebook_entries` - Personal word notebooks per user
4. `stories` - Generated stories for learning
5. `word_comments` - User comments on words (private)
6. `user_definition_edits` - User-edited definitions (deprecated)
7. `word_definition_proposals` - Proposals for admin review

#### Safety Features / 安全特性
- ✅ All index creations check for column existence
- ✅ All RLS policies verify table and column existence before creation
- ✅ Unique indexes verify all referenced columns exist
- ✅ Prevents "column does not exist" errors
- ✅ Handles schema mismatches gracefully

### Authentication & Session Fixes / 认证和会话修复

#### Login Redirect Improvements / 登录重定向改进
- ✅ Updated `@supabase/ssr` package from 0.1.0 to 0.8.0
- ✅ Fixed redirect logic to wait for session establishment
- ✅ Improved middleware session reading with `getSession()`
- ✅ Added detailed cookie logging for debugging

#### Admin Access Fixes / 管理员访问修复
- ✅ Fixed admin button visibility issues
- ✅ Added timeout to profile queries (3-5 seconds)
- ✅ Fixed RLS infinite recursion in user_profiles
- ✅ Optimized profile query performance

### Feature Improvements / 功能改进

#### Comment Feature / 评论功能
- ✅ Created `word_comments` table with proper schema
- ✅ Fixed comment save logic with find-then-update-or-insert pattern
- ✅ Handle empty comments by deleting records
- ✅ Added fallback for unique constraint conflicts

#### Definition Regeneration / 定义重新生成
- ✅ Added `skipImage` and `skipAudio` parameters for faster regeneration
- ✅ Preserves existing imageUrl if new result doesn't have one
- ✅ Significantly improved regeneration speed

#### UI/UX Fixes / 用户界面修复
- ✅ Fixed missing component imports (`Link`, `Save` icon)
- ✅ Fixed duplicate definition display in notebook
- ✅ Improved error handling and user feedback

### Documentation Improvements / 文档改进

- ✅ Created `DATABASE_SETUP_GUIDE.md` - Comprehensive setup instructions
- ✅ Created `SETUP_ALL_TABLES_SAFE.sql` - All-in-one safe setup script
- ✅ Updated `PRD_WEAKNESSES_ANALYSIS.md` with problems and solutions
- ✅ Added troubleshooting guides for common issues

### Technical Debt Addressed / 已解决的技术债务

1. ✅ **Database Setup** - Consolidated into single safe script
2. ✅ **Error Handling** - Fixed ReferenceError issues
3. ✅ **Query Performance** - Added timeouts to prevent hanging
4. ✅ **Dependencies** - Updated Supabase SSR package
5. ✅ **Schema Consistency** - Handles mismatches gracefully

---

## 15. Document Version History / 文档版本历史

| Version | Date | Changes |
|---------|------|---------|
| 5.1 | 2024 | Database setup improvements, safety checks, bug fixes |
| 5.0 | 2024 | Complete rewrite for Supabase + Vercel + 阿里云盘 architecture |
| 4.1 | 2024 | ECS deployment with authentication |
| 4.0 | 2024 | Added authentication and database |
| 2.0 | 2024 | Initial PRD with localStorage |

---

**Document Status:** Active / 文档状态：活跃  
**Last Reviewed:** 2024 / 最后审查：2024  
**Next Review:** After v5.1 deployment / 下次审查：v5.1 部署后

