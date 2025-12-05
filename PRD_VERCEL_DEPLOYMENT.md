# Product Requirements Document (PRD) - Vercel Deployment
# 产品需求文档 - Vercel 部署

## Document Information / 文档信息

**Version:** 6.0  
**Last Updated:** 2024  
**Deployment Target:** Vercel (Production)  
**Document Type:** Deployment PRD + Step-by-Step Guide  
**Status:** Ready for Deployment

---

## 1. Executive Summary / 执行摘要

### English
This document outlines the complete deployment strategy for the AI Dictionary application to Vercel. The application is a full-stack Next.js application with:
- **Frontend:** Next.js 14+ (App Router) with TypeScript
- **Backend:** Serverless API Routes on Vercel
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **File Storage:** 阿里云盘 (Alibaba Cloud Drive)
- **AI Services:** SiliconFlow API

**Deployment Goals:**
- ✅ Zero-downtime deployment
- ✅ Automatic CI/CD from Git
- ✅ Global CDN distribution
- ✅ Serverless auto-scaling
- ✅ Production-ready security
- ✅ Environment variable management
- ✅ Monitoring and analytics

### 中文
本文档概述了将 AI 词典应用程序部署到 Vercel 的完整策略。该应用程序是一个全栈 Next.js 应用程序，包含：
- **前端：** Next.js 14+（App Router）与 TypeScript
- **后端：** Vercel 上的无服务器 API 路由
- **数据库：** Supabase PostgreSQL
- **认证：** Supabase Auth
- **文件存储：** 阿里云盘
- **AI 服务：** SiliconFlow API

**部署目标：**
- ✅ 零停机部署
- ✅ 从 Git 自动 CI/CD
- ✅ 全球 CDN 分发
- ✅ 无服务器自动扩展
- ✅ 生产就绪的安全性
- ✅ 环境变量管理
- ✅ 监控和分析

---

## 2. Pre-Deployment Checklist / 部署前检查清单

### 2.1 Code Readiness / 代码准备

#### English
- [ ] All features tested locally
- [ ] Build succeeds without errors (`npm run build`)
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] All environment variables documented
- [ ] Database migrations ready
- [ ] API endpoints tested
- [ ] Authentication flow verified
- [ ] File upload/download working
- [ ] Error handling implemented

#### 中文
- [ ] 所有功能已在本地测试
- [ ] 构建成功无错误（`npm run build`）
- [ ] TypeScript 编译通过（`npm run type-check`）
- [ ] 无 linting 错误（`npm run lint`）
- [ ] 所有环境变量已记录
- [ ] 数据库迁移已准备
- [ ] API 端点已测试
- [ ] 认证流程已验证
- [ ] 文件上传/下载正常工作
- [ ] 错误处理已实现

### 2.2 Service Accounts & API Keys / 服务账户和 API 密钥

#### English
- [ ] **Supabase Project:** Created and configured
  - [ ] Project URL obtained
  - [ ] Anon key obtained
  - [ ] Service role key obtained
  - [ ] Database tables created
  - [ ] RLS policies configured
  - [ ] Auth providers configured

- [ ] **阿里云盘 (Alibaba Cloud Drive):** Configured
  - [ ] Client ID obtained
  - [ ] Client Secret obtained
  - [ ] Refresh Token obtained
  - [ ] API access tested

- [ ] **SiliconFlow API:** Configured
  - [ ] API key obtained
  - [ ] API base URL confirmed
  - [ ] Model name confirmed
  - [ ] API access tested

- [ ] **Edge-TTS (Optional):** Configured
  - [ ] API URL configured
  - [ ] API key set (if required)

#### 中文
- [ ] **Supabase 项目：** 已创建和配置
  - [ ] 已获取项目 URL
  - [ ] 已获取 Anon 密钥
  - [ ] 已获取服务角色密钥
  - [ ] 数据库表已创建
  - [ ] RLS 策略已配置
  - [ ] 认证提供商已配置

- [ ] **阿里云盘：** 已配置
  - [ ] 已获取客户端 ID
  - [ ] 已获取客户端密钥
  - [ ] 已获取刷新令牌
  - [ ] API 访问已测试

- [ ] **SiliconFlow API：** 已配置
  - [ ] 已获取 API 密钥
  - [ ] API 基础 URL 已确认
  - [ ] 模型名称已确认
  - [ ] API 访问已测试

- [ ] **Edge-TTS（可选）：** 已配置
  - [ ] API URL 已配置
  - [ ] API 密钥已设置（如需要）

### 2.3 Database Setup / 数据库设置

#### English
- [ ] All tables created using `SETUP_ALL_TABLES_SAFE.sql`
- [ ] RLS policies enabled and tested
- [ ] Indexes created for performance
- [ ] Foreign key constraints verified
- [ ] Test data inserted (optional)
- [ ] Backup strategy planned

#### 中文
- [ ] 使用 `SETUP_ALL_TABLES_SAFE.sql` 创建所有表
- [ ] RLS 策略已启用并测试
- [ ] 已创建性能索引
- [ ] 外键约束已验证
- [ ] 已插入测试数据（可选）
- [ ] 备份策略已规划

---

## 3. Vercel Deployment Architecture / Vercel 部署架构

### 3.1 Platform Overview / 平台概述

#### English
**Vercel** is a cloud platform for frontend frameworks and static sites, built to integrate with your headless content, commerce, or database.

**Key Features:**
- **Automatic Deployments:** Deploy on every Git push
- **Preview Deployments:** Automatic preview URLs for pull requests
- **Global CDN:** Edge network for fast content delivery
- **Serverless Functions:** Auto-scaling API routes
- **Environment Variables:** Secure secret management
- **Analytics:** Built-in performance monitoring
- **SSL Certificates:** Automatic HTTPS

#### 中文
**Vercel** 是一个面向前端框架和静态站点的云平台，旨在与您的无头内容、商务或数据库集成。

**主要功能：**
- **自动部署：** 每次 Git 推送时部署
- **预览部署：** 拉取请求的自动预览 URL
- **全球 CDN：** 用于快速内容交付的边缘网络
- **无服务器函数：** 自动扩展的 API 路由
- **环境变量：** 安全的密钥管理
- **分析：** 内置性能监控
- **SSL 证书：** 自动 HTTPS

### 3.2 Deployment Flow / 部署流程

```
┌─────────────────────────────────────────────────────────┐
│                    Git Repository                        │
│              (GitHub / GitLab / Bitbucket)               │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ Push to main branch
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  Vercel Platform                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  1. Detect Next.js project                      │  │
│  │  2. Install dependencies (npm install)           │  │
│  │  3. Build project (npm run build)              │  │
│  │  4. Deploy to Edge Network                      │  │
│  │  5. Create production URL                        │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│   Supabase   │ │  阿里云盘    │ │  AI Services │
│  PostgreSQL  │ │ (File Store)│ │ (SiliconFlow)│
│  + Auth      │ │              │ │             │
└──────────────┘ └──────────────┘ └─────────────┘
```

### 3.3 File Structure for Deployment / 部署文件结构

#### Required Files / 必需文件
```
/
├── package.json              # Dependencies and scripts
├── next.config.js           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── middleware.ts            # Next.js middleware (auth)
├── .env.local               # Local environment (NOT committed)
├── .gitignore               # Git ignore rules
└── app/                     # Next.js App Router
    ├── layout.tsx
    ├── page.tsx
    ├── api/                 # API routes (serverless)
    ├── components/          # React components
    └── lib/                  # Utilities
```

#### Optional Files / 可选文件
```
/
├── vercel.json              # Vercel-specific configuration
├── .vercelignore            # Files to exclude from deployment
└── README.md                # Project documentation
```

---

## 4. Environment Variables / 环境变量

### 4.1 Required Variables / 必需变量

#### English
All environment variables must be set in Vercel Dashboard before deployment.

#### 中文
所有环境变量必须在部署前在 Vercel 仪表板中设置。

#### Supabase Configuration / Supabase 配置
```env
# Public variables (accessible in browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-only variables (not exposed to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**How to get:**
1. Go to Supabase Dashboard → Project Settings → API
2. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

#### 阿里云盘 Configuration / 阿里云盘 配置
```env
ALIYUN_DRIVE_CLIENT_ID=your-client-id-here
ALIYUN_DRIVE_CLIENT_SECRET=your-client-secret-here
ALIYUN_DRIVE_REFRESH_TOKEN=your-refresh-token-here
```

**How to get:**
1. Register at https://open.alipan.com/
2. Create an application
3. Get Client ID, Client Secret, and Refresh Token
4. See `CONFIGURATION_GUIDE.md` for detailed steps

#### AI Services Configuration / AI 服务配置
```env
SILICONFLOW_API_KEY=your-siliconflow-api-key-here
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1
AI_MODEL=deepseek-ai/DeepSeek-V3
```

**How to get:**
1. Sign up at https://cloud.siliconflow.cn
2. Create API key
3. Copy API key → `SILICONFLOW_API_KEY`
4. API base URL is usually: `https://api.siliconflow.cn/v1`
5. Model name: `deepseek-ai/DeepSeek-V3` (or your preferred model)

#### Edge-TTS Configuration (Optional) / Edge-TTS 配置（可选）
```env
EDGE_TTS_API_URL=http://your-edge-tts-server:5050
EDGE_TTS_API_KEY=your_api_key_here
```

**Note:** If using Edge-TTS, you need to deploy it separately or use a hosted service.

### 4.2 Optional Variables / 可选变量

```env
# App URL (auto-detected by Vercel, but can be overridden)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4.3 Environment Variable Security / 环境变量安全

#### English
- ✅ **Never commit** `.env.local` to Git
- ✅ Use Vercel Dashboard for production secrets
- ✅ Use different values for development and production
- ✅ Rotate keys regularly
- ✅ Use `NEXT_PUBLIC_` prefix only for public variables
- ✅ Service role keys should NEVER be public

#### 中文
- ✅ **永远不要**将 `.env.local` 提交到 Git
- ✅ 使用 Vercel 仪表板管理生产环境密钥
- ✅ 开发和生产环境使用不同的值
- ✅ 定期轮换密钥
- ✅ 仅对公共变量使用 `NEXT_PUBLIC_` 前缀
- ✅ 服务角色密钥永远不应该是公开的

---

## 5. Deployment Steps / 部署步骤

### Step 1: Prepare Repository / 准备仓库

#### English
1. **Ensure code is committed:**
   ```bash
   git status
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. **Push to remote:**
   ```bash
   git push origin main
   ```

3. **Verify build works locally:**
   ```bash
   npm run build
   ```

#### 中文
1. **确保代码已提交：**
   ```bash
   git status
   git add .
   git commit -m "准备 Vercel 部署"
   ```

2. **推送到远程：**
   ```bash
   git push origin main
   ```

3. **验证本地构建：**
   ```bash
   npm run build
   ```

### Step 2: Create Vercel Account / 创建 Vercel 账户

#### English
1. Go to https://vercel.com
2. Sign up with GitHub, GitLab, or Bitbucket
3. Authorize Vercel to access your repositories

#### 中文
1. 访问 https://vercel.com
2. 使用 GitHub、GitLab 或 Bitbucket 注册
3. 授权 Vercel 访问您的仓库

### Step 3: Import Project / 导入项目

#### English
1. Click "Add New Project" in Vercel Dashboard
2. Select your Git repository
3. Vercel will auto-detect Next.js
4. Configure project settings:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

#### 中文
1. 在 Vercel 仪表板中点击"添加新项目"
2. 选择您的 Git 仓库
3. Vercel 将自动检测 Next.js
4. 配置项目设置：
   - **框架预设：** Next.js（自动检测）
   - **根目录：** `./`（默认）
   - **构建命令：** `npm run build`（自动检测）
   - **输出目录：** `.next`（自动检测）
   - **安装命令：** `npm install`（自动检测）

### Step 4: Configure Environment Variables / 配置环境变量

#### English
1. In project settings, go to "Environment Variables"
2. Add each variable from Section 4.1:
   - Click "Add New"
   - Enter variable name
   - Enter variable value
   - Select environments (Production, Preview, Development)
   - Click "Save"

**Important:** Add variables for all three environments (Production, Preview, Development) unless specified otherwise.

#### 中文
1. 在项目设置中，转到"环境变量"
2. 从第 4.1 节添加每个变量：
   - 点击"添加新变量"
   - 输入变量名
   - 输入变量值
   - 选择环境（生产、预览、开发）
   - 点击"保存"

**重要：** 除非另有说明，否则为所有三个环境（生产、预览、开发）添加变量。

### Step 5: Deploy / 部署

#### English
1. Click "Deploy" button
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build your project
   - Deploy to Edge Network
3. Wait for deployment to complete (2-5 minutes)
4. You'll get a production URL: `https://your-app.vercel.app`

#### 中文
1. 点击"部署"按钮
2. Vercel 将：
   - 克隆您的仓库
   - 安装依赖
   - 构建您的项目
   - 部署到边缘网络
3. 等待部署完成（2-5 分钟）
4. 您将获得生产 URL：`https://your-app.vercel.app`

### Step 6: Verify Deployment / 验证部署

#### English
1. **Check deployment status:**
   - Go to Vercel Dashboard → Deployments
   - Verify status is "Ready"

2. **Test the application:**
   - Visit production URL
   - Test login/registration
   - Test word lookup
   - Test notebook save
   - Test study mode

3. **Check logs:**
   - Go to Vercel Dashboard → Deployments → [Your Deployment] → Logs
   - Look for any errors or warnings

4. **Test API endpoints:**
   - Test `/api/lookup`
   - Test `/api/notebook`
   - Test authentication endpoints

#### 中文
1. **检查部署状态：**
   - 转到 Vercel 仪表板 → 部署
   - 验证状态为"就绪"

2. **测试应用程序：**
   - 访问生产 URL
   - 测试登录/注册
   - 测试单词查询
   - 测试笔记本保存
   - 测试学习模式

3. **检查日志：**
   - 转到 Vercel 仪表板 → 部署 → [您的部署] → 日志
   - 查找任何错误或警告

4. **测试 API 端点：**
   - 测试 `/api/lookup`
   - 测试 `/api/notebook`
   - 测试认证端点

### Step 7: Configure Custom Domain (Optional) / 配置自定义域名（可选）

#### English
1. Go to Vercel Dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 24 hours)
6. SSL certificate will be automatically provisioned

#### 中文
1. 转到 Vercel 仪表板 → 设置 → 域名
2. 点击"添加域名"
3. 输入您的域名
4. 按照 DNS 配置说明操作
5. 等待 DNS 传播（最多 24 小时）
6. SSL 证书将自动配置

---

## 6. Post-Deployment Configuration / 部署后配置

### 6.1 Supabase Configuration / Supabase 配置

#### English
1. **Update Supabase Auth Settings:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL": `https://your-app.vercel.app`
   - Add redirect URLs:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/login`
     - `https://your-app.vercel.app/register`

2. **Verify RLS Policies:**
   - Ensure all tables have RLS enabled
   - Test policies with production user

#### 中文
1. **更新 Supabase 认证设置：**
   - 转到 Supabase 仪表板 → 认证 → URL 配置
   - 将您的 Vercel URL 添加到"站点 URL"：`https://your-app.vercel.app`
   - 添加重定向 URL：
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/login`
     - `https://your-app.vercel.app/register`

2. **验证 RLS 策略：**
   - 确保所有表都启用了 RLS
   - 使用生产用户测试策略

### 6.2 Monitoring Setup / 监控设置

#### English
1. **Vercel Analytics:**
   - Enable in Vercel Dashboard → Analytics
   - Monitor performance metrics
   - Track errors and warnings

2. **Supabase Monitoring:**
   - Monitor database performance
   - Check query analytics
   - Monitor API usage

3. **Error Tracking (Optional):**
   - Set up Sentry or similar service
   - Configure error alerts

#### 中文
1. **Vercel 分析：**
   - 在 Vercel 仪表板 → 分析中启用
   - 监控性能指标
   - 跟踪错误和警告

2. **Supabase 监控：**
   - 监控数据库性能
   - 检查查询分析
   - 监控 API 使用情况

3. **错误跟踪（可选）：**
   - 设置 Sentry 或类似服务
   - 配置错误警报

---

## 7. Continuous Deployment / 持续部署

### 7.1 Automatic Deployments / 自动部署

#### English
Once configured, Vercel will automatically:
- Deploy on every push to `main` branch (production)
- Create preview deployments for pull requests
- Rebuild on environment variable changes
- Roll back on deployment failures

#### 中文
配置后，Vercel 将自动：
- 每次推送到 `main` 分支时部署（生产）
- 为拉取请求创建预览部署
- 在环境变量更改时重建
- 在部署失败时回滚

### 7.2 Deployment Workflow / 部署工作流

#### English
```
Developer pushes to feature branch
    ↓
Create Pull Request
    ↓
Vercel creates Preview Deployment
    ↓
Test Preview URL
    ↓
Merge to main branch
    ↓
Vercel creates Production Deployment
    ↓
Application live on production URL
```

#### 中文
```
开发人员推送到功能分支
    ↓
创建拉取请求
    ↓
Vercel 创建预览部署
    ↓
测试预览 URL
    ↓
合并到 main 分支
    ↓
Vercel 创建生产部署
    ↓
应用程序在生产 URL 上运行
```

---

## 8. Troubleshooting / 故障排除

### 8.1 Common Issues / 常见问题

#### Build Failures / 构建失败

**English:**
- **Issue:** Build fails with TypeScript errors
- **Solution:** Run `npm run type-check` locally and fix errors
- **Issue:** Build fails with missing dependencies
- **Solution:** Ensure all dependencies are in `package.json`

**中文:**
- **问题：** 构建因 TypeScript 错误而失败
- **解决方案：** 在本地运行 `npm run type-check` 并修复错误
- **问题：** 构建因缺少依赖项而失败
- **解决方案：** 确保所有依赖项都在 `package.json` 中

#### Environment Variable Issues / 环境变量问题

**English:**
- **Issue:** API calls fail with "API key not found"
- **Solution:** Verify all environment variables are set in Vercel Dashboard
- **Issue:** Variables work locally but not in production
- **Solution:** Ensure variables are added for "Production" environment

**中文:**
- **问题：** API 调用失败，显示"未找到 API 密钥"
- **解决方案：** 验证所有环境变量是否在 Vercel 仪表板中设置
- **问题：** 变量在本地工作但在生产中不工作
- **解决方案：** 确保为"生产"环境添加了变量

#### Database Connection Issues / 数据库连接问题

**English:**
- **Issue:** Cannot connect to Supabase
- **Solution:** Verify Supabase URL and keys are correct
- **Issue:** RLS policies blocking access
- **Solution:** Check RLS policies in Supabase Dashboard

**中文:**
- **问题：** 无法连接到 Supabase
- **解决方案：** 验证 Supabase URL 和密钥是否正确
- **问题：** RLS 策略阻止访问
- **解决方案：** 在 Supabase 仪表板中检查 RLS 策略

#### Authentication Issues / 认证问题

**English:**
- **Issue:** Login redirects fail
- **Solution:** Update Supabase Auth redirect URLs
- **Issue:** Session not persisting
- **Solution:** Check middleware configuration and cookie settings

**中文:**
- **问题：** 登录重定向失败
- **解决方案：** 更新 Supabase 认证重定向 URL
- **问题：** 会话不持久
- **解决方案：** 检查中间件配置和 cookie 设置

### 8.2 Debugging Tips / 调试技巧

#### English
1. **Check Vercel Logs:**
   - Go to Deployments → [Your Deployment] → Logs
   - Look for error messages

2. **Check Function Logs:**
   - Go to Deployments → [Your Deployment] → Functions
   - Click on specific function to see logs

3. **Test API Routes Locally:**
   - Use `npm run dev`
   - Test endpoints with Postman or curl

4. **Verify Environment Variables:**
   - Use Vercel CLI: `vercel env pull`
   - Compare with local `.env.local`

#### 中文
1. **检查 Vercel 日志：**
   - 转到部署 → [您的部署] → 日志
   - 查找错误消息

2. **检查函数日志：**
   - 转到部署 → [您的部署] → 函数
   - 点击特定函数查看日志

3. **在本地测试 API 路由：**
   - 使用 `npm run dev`
   - 使用 Postman 或 curl 测试端点

4. **验证环境变量：**
   - 使用 Vercel CLI：`vercel env pull`
   - 与本地 `.env.local` 比较

---

## 9. Performance Optimization / 性能优化

### 9.1 Vercel Optimizations / Vercel 优化

#### English
- **Automatic Image Optimization:** Next.js Image component
- **Edge Caching:** Static assets cached globally
- **Serverless Functions:** Auto-scaling based on demand
- **CDN Distribution:** Global edge network

#### 中文
- **自动图片优化：** Next.js Image 组件
- **边缘缓存：** 静态资源全局缓存
- **无服务器函数：** 根据需求自动扩展
- **CDN 分发：** 全球边缘网络

### 9.2 Application Optimizations / 应用程序优化

#### English
- **Code Splitting:** Automatic with Next.js
- **Lazy Loading:** Components loaded on demand
- **Caching:** Client-side and server-side caching
- **Database Indexing:** Optimized queries

#### 中文
- **代码分割：** Next.js 自动处理
- **懒加载：** 按需加载组件
- **缓存：** 客户端和服务器端缓存
- **数据库索引：** 优化的查询

---

## 10. Security Considerations / 安全考虑

### 10.1 Vercel Security / Vercel 安全

#### English
- ✅ **HTTPS:** Automatic SSL certificates
- ✅ **DDoS Protection:** Built-in protection
- ✅ **Environment Variables:** Encrypted at rest
- ✅ **Function Isolation:** Each function runs in isolated environment

#### 中文
- ✅ **HTTPS：** 自动 SSL 证书
- ✅ **DDoS 保护：** 内置保护
- ✅ **环境变量：** 静态加密
- ✅ **函数隔离：** 每个函数在隔离环境中运行

### 10.2 Application Security / 应用程序安全

#### English
- ✅ **Authentication:** Supabase Auth with secure sessions
- ✅ **RLS Policies:** Database-level security
- ✅ **Input Validation:** All inputs validated
- ✅ **Rate Limiting:** API rate limiting implemented
- ✅ **CORS:** Properly configured
- ✅ **XSS Protection:** React automatic escaping

#### 中文
- ✅ **认证：** 带安全会话的 Supabase 认证
- ✅ **RLS 策略：** 数据库级安全
- ✅ **输入验证：** 所有输入已验证
- ✅ **速率限制：** 已实现 API 速率限制
- ✅ **CORS：** 正确配置
- ✅ **XSS 保护：** React 自动转义

---

## 11. Cost Estimation / 成本估算

### 11.1 Vercel Pricing / Vercel 定价

#### English
**Free Tier (Hobby):**
- 100GB bandwidth/month
- Unlimited serverless function invocations
- Automatic SSL
- Preview deployments
- **Cost:** $0/month

**Pro Tier:**
- 1TB bandwidth/month
- Advanced analytics
- Team collaboration
- **Cost:** $20/month per user

#### 中文
**免费层（Hobby）：**
- 100GB 带宽/月
- 无限制的无服务器函数调用
- 自动 SSL
- 预览部署
- **成本：** $0/月

**专业层：**
- 1TB 带宽/月
- 高级分析
- 团队协作
- **成本：** $20/月/用户

### 11.2 Total Monthly Cost / 总月成本

#### English
**Free Tier Setup:**
- Vercel: $0
- Supabase: $0 (free tier)
- 阿里云盘: $0 (free tier)
- SiliconFlow: Pay per use
- **Total:** $0 + API usage costs

#### 中文
**免费层设置：**
- Vercel: $0
- Supabase: $0（免费层）
- 阿里云盘: $0（免费层）
- SiliconFlow: 按使用付费
- **总计：** $0 + API 使用成本

---

## 12. Success Metrics / 成功指标

### 12.1 Deployment Success / 部署成功

#### English
- ✅ Application accessible at production URL
- ✅ All features working correctly
- ✅ Authentication flow working
- ✅ Database connections successful
- ✅ API endpoints responding
- ✅ No critical errors in logs
- ✅ Performance metrics acceptable

#### 中文
- ✅ 应用程序可在生产 URL 访问
- ✅ 所有功能正常工作
- ✅ 认证流程正常工作
- ✅ 数据库连接成功
- ✅ API 端点响应
- ✅ 日志中无关键错误
- ✅ 性能指标可接受

### 12.2 Monitoring Metrics / 监控指标

#### English
- **Uptime:** > 99.9%
- **Response Time:** < 2 seconds (p95)
- **Error Rate:** < 0.1%
- **Build Time:** < 5 minutes
- **Deployment Frequency:** As needed

#### 中文
- **正常运行时间：** > 99.9%
- **响应时间：** < 2 秒（p95）
- **错误率：** < 0.1%
- **构建时间：** < 5 分钟
- **部署频率：** 根据需要

---

## 13. Next Steps After Deployment / 部署后的下一步

### 13.1 Immediate Actions / 立即行动

#### English
1. **Test all features** in production environment
2. **Monitor logs** for first 24 hours
3. **Set up alerts** for errors and performance issues
4. **Update documentation** with production URLs
5. **Notify users** (if applicable)

#### 中文
1. **测试所有功能**在生产环境中
2. **监控日志**前 24 小时
3. **设置警报**用于错误和性能问题
4. **更新文档**包含生产 URL
5. **通知用户**（如适用）

### 13.2 Ongoing Maintenance / 持续维护

#### English
1. **Regular Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Update environment variables as needed

2. **Performance Monitoring:**
   - Review analytics weekly
   - Optimize slow queries
   - Monitor API usage

3. **Backup Strategy:**
   - Regular database backups
   - Document recovery procedures

#### 中文
1. **定期更新：**
   - 保持依赖项更新
   - 监控安全公告
   - 根据需要更新环境变量

2. **性能监控：**
   - 每周审查分析
   - 优化慢查询
   - 监控 API 使用情况

3. **备份策略：**
   - 定期数据库备份
   - 记录恢复程序

---

## 14. Document Version History / 文档版本历史

| Version | Date | Changes |
|---------|------|---------|
| 6.0 | 2024 | Initial Vercel deployment PRD |

---

**Document Status:** Active / 文档状态：活跃  
**Last Updated:** 2024 / 最后更新：2024  
**Next Review:** After first deployment / 下次审查：首次部署后

