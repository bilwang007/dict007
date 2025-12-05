# Step-by-Step Vercel Deployment Guide
# Vercel 部署分步指南

## Quick Start / 快速开始

This guide will walk you through deploying your AI Dictionary application to Vercel in **15-30 minutes**.

本指南将引导您在 **15-30 分钟**内将 AI 词典应用程序部署到 Vercel。

---

## Prerequisites / 先决条件

### English
Before starting, ensure you have:
- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ All code committed and pushed
- ✅ Local build succeeds (`npm run build`)
- ✅ Supabase project created and configured
- ✅ All API keys ready (Supabase, 阿里云盘, SiliconFlow)

### 中文
开始之前，请确保您有：
- ✅ Git 仓库（GitHub、GitLab 或 Bitbucket）
- ✅ 所有代码已提交并推送
- ✅ 本地构建成功（`npm run build`）
- ✅ Supabase 项目已创建和配置
- ✅ 所有 API 密钥已准备（Supabase、阿里云盘、SiliconFlow）

---

## Step 1: Prepare Your Code / 准备您的代码

### 1.1 Verify Local Build / 验证本地构建

#### English
```bash
# Navigate to project directory
cd "dictionary-zara copy"

# Install dependencies (if not already done)
npm install

# Run type check
npm run type-check

# Run linter
npm run lint

# Build the project
npm run build
```

**Expected Result:** Build completes without errors.

If you see errors, fix them before proceeding.

#### 中文
```bash
# 导航到项目目录
cd "dictionary-zara copy"

# 安装依赖（如果尚未完成）
npm install

# 运行类型检查
npm run type-check

# 运行 linter
npm run lint

# 构建项目
npm run build
```

**预期结果：** 构建完成，无错误。

如果看到错误，请先修复再继续。

### 1.2 Commit and Push Code / 提交并推送代码

#### English
```bash
# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Push to remote repository
git push origin main
```

#### 中文
```bash
# 检查 git 状态
git status

# 添加所有更改
git add .

# 提交更改
git commit -m "准备 Vercel 部署"

# 推送到远程仓库
git push origin main
```

---

## Step 2: Create Vercel Account / 创建 Vercel 账户

### 2.1 Sign Up / 注册

#### English
1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose one of the following:
   - **GitHub** (Recommended)
   - **GitLab**
   - **Bitbucket**
   - **Email** (less convenient for auto-deployments)

4. Authorize Vercel to access your Git repositories
5. Complete the sign-up process

#### 中文
1. 访问 **https://vercel.com**
2. 点击 **"注册"**
3. 选择以下之一：
   - **GitHub**（推荐）
   - **GitLab**
   - **Bitbucket**
   - **邮箱**（自动部署不太方便）

4. 授权 Vercel 访问您的 Git 仓库
5. 完成注册过程

### 2.2 Verify Account / 验证账户

#### English
- You should see the Vercel Dashboard
- Your Git repositories should be visible (if connected)
- You're ready to import a project

#### 中文
- 您应该看到 Vercel 仪表板
- 您的 Git 仓库应该可见（如果已连接）
- 您已准备好导入项目

---

## Step 3: Import Project to Vercel / 将项目导入 Vercel

### 3.1 Start Import / 开始导入

#### English
1. In Vercel Dashboard, click **"Add New..."** button
2. Select **"Project"**
3. You'll see a list of your Git repositories
4. Find and click on your **"dictionary-zara copy"** repository
5. Click **"Import"**

#### 中文
1. 在 Vercel 仪表板中，点击 **"添加新..."** 按钮
2. 选择 **"项目"**
3. 您将看到 Git 仓库列表
4. 找到并点击您的 **"dictionary-zara copy"** 仓库
5. 点击 **"导入"**

### 3.2 Configure Project Settings / 配置项目设置

#### English
Vercel will auto-detect Next.js. Verify these settings:

**Framework Preset:** `Next.js` (auto-detected)  
**Root Directory:** `./` (default)  
**Build Command:** `npm run build` (auto-detected)  
**Output Directory:** `.next` (auto-detected)  
**Install Command:** `npm install` (auto-detected)  
**Node.js Version:** `18.x` (check `package.json`)

**Important:** Don't click "Deploy" yet! We need to set environment variables first.

#### 中文
Vercel 将自动检测 Next.js。验证这些设置：

**框架预设：** `Next.js`（自动检测）  
**根目录：** `./`（默认）  
**构建命令：** `npm run build`（自动检测）  
**输出目录：** `.next`（自动检测）  
**安装命令：** `npm install`（自动检测）  
**Node.js 版本：** `18.x`（检查 `package.json`）

**重要：** 先不要点击"部署"！我们需要先设置环境变量。

---

## Step 4: Configure Environment Variables / 配置环境变量

### 4.1 Access Environment Variables / 访问环境变量

#### English
1. In the project import screen, scroll down to **"Environment Variables"** section
2. Or click **"Environment Variables"** in the left sidebar after import

#### 中文
1. 在项目导入屏幕中，向下滚动到 **"环境变量"** 部分
2. 或在导入后点击左侧边栏中的 **"环境变量"**

### 4.2 Add Supabase Variables / 添加 Supabase 变量

#### English
Add these three variables:

**Variable 1:**
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://your-project.supabase.co` (from Supabase Dashboard)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**Variable 2:**
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Your anon key from Supabase
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**Variable 3:**
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Your service role key from Supabase (keep secret!)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**How to get these values:**
1. Go to Supabase Dashboard → Your Project → Settings → API
2. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

#### 中文
添加这三个变量：

**变量 1：**
- **键：** `NEXT_PUBLIC_SUPABASE_URL`
- **值：** `https://your-project.supabase.co`（来自 Supabase 仪表板）
- **环境：** ✅ 生产，✅ 预览，✅ 开发

**变量 2：**
- **键：** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **值：** 来自 Supabase 的 anon 密钥
- **环境：** ✅ 生产，✅ 预览，✅ 开发

**变量 3：**
- **键：** `SUPABASE_SERVICE_ROLE_KEY`
- **值：** 来自 Supabase 的服务角色密钥（保密！）
- **环境：** ✅ 生产，✅ 预览，✅ 开发

**如何获取这些值：**
1. 转到 Supabase 仪表板 → 您的项目 → 设置 → API
2. 复制"项目 URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. 复制"anon public"密钥 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 复制"service_role"密钥 → `SUPABASE_SERVICE_ROLE_KEY`

### 4.3 Add 阿里云盘 Variables / 添加阿里云盘变量

#### English
Add these three variables:

**Variable 1:**
- **Key:** `ALIYUN_DRIVE_CLIENT_ID`
- **Value:** Your 阿里云盘 Client ID
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**Variable 2:**
- **Key:** `ALIYUN_DRIVE_CLIENT_SECRET`
- **Value:** Your 阿里云盘 Client Secret
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**Variable 3:**
- **Key:** `ALIYUN_DRIVE_REFRESH_TOKEN`
- **Value:** Your 阿里云盘 Refresh Token
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**How to get these values:**
- See `CONFIGURATION_GUIDE.md` for detailed instructions
- Or visit https://open.alipan.com/

#### 中文
添加这三个变量：

**变量 1：**
- **键：** `ALIYUN_DRIVE_CLIENT_ID`
- **值：** 您的阿里云盘客户端 ID
- **环境：** ✅ 生产，✅ 预览，✅ 开发

**变量 2：**
- **键：** `ALIYUN_DRIVE_CLIENT_SECRET`
- **值：** 您的阿里云盘客户端密钥
- **环境：** ✅ 生产，✅ 预览，✅ 开发

**变量 3：**
- **键：** `ALIYUN_DRIVE_REFRESH_TOKEN`
- **值：** 您的阿里云盘刷新令牌
- **环境：** ✅ 生产，✅ 预览，✅ 开发

**如何获取这些值：**
- 查看 `CONFIGURATION_GUIDE.md` 了解详细说明
- 或访问 https://open.alipan.com/

### 4.4 Add AI Service Variables / 添加 AI 服务变量

#### English
Add these three variables:

**Variable 1:**
- **Key:** `SILICONFLOW_API_KEY`
- **Value:** Your SiliconFlow API key
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**Variable 2:**
- **Key:** `SILICONFLOW_API_BASE`
- **Value:** `https://api.siliconflow.cn/v1`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**Variable 3:**
- **Key:** `AI_MODEL`
- **Value:** `deepseek-ai/DeepSeek-V3` (or your preferred model)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**How to get API key:**
1. Sign up at https://cloud.siliconflow.cn
2. Create an API key
3. Copy the key

#### 中文
添加这三个变量：

**变量 1：**
- **键：** `SILICONFLOW_API_KEY`
- **值：** 您的 SiliconFlow API 密钥
- **环境：** ✅ 生产，✅ 预览，✅ 开发

**变量 2：**
- **键：** `SILICONFLOW_API_BASE`
- **值：** `https://api.siliconflow.cn/v1`
- **环境：** ✅ 生产，✅ 预览，✅ 开发

**变量 3：**
- **键：** `AI_MODEL`
- **值：** `deepseek-ai/DeepSeek-V3`（或您首选的模型）
- **环境：** ✅ 生产，✅ 预览，✅ 开发

**如何获取 API 密钥：**
1. 在 https://cloud.siliconflow.cn 注册
2. 创建 API 密钥
3. 复制密钥

### 4.5 Add Optional Variables / 添加可选变量

#### English
**Variable (Optional):**
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** Leave empty (Vercel will auto-detect)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**Note:** You can add this after deployment with your actual URL.

#### 中文
**变量（可选）：**
- **键：** `NEXT_PUBLIC_APP_URL`
- **值：** 留空（Vercel 将自动检测）
- **环境：** ✅ 生产，✅ 预览，✅ 开发

**注意：** 您可以在部署后使用实际 URL 添加此变量。

### 4.6 Verify All Variables / 验证所有变量

#### English
You should have **9 environment variables** total:
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `ALIYUN_DRIVE_CLIENT_ID`
5. `ALIYUN_DRIVE_CLIENT_SECRET`
6. `ALIYUN_DRIVE_REFRESH_TOKEN`
7. `SILICONFLOW_API_KEY`
8. `SILICONFLOW_API_BASE`
9. `AI_MODEL`

#### 中文
您应该有 **9 个环境变量**总计：
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `ALIYUN_DRIVE_CLIENT_ID`
5. `ALIYUN_DRIVE_CLIENT_SECRET`
6. `ALIYUN_DRIVE_REFRESH_TOKEN`
7. `SILICONFLOW_API_KEY`
8. `SILICONFLOW_API_BASE`
9. `AI_MODEL`

---

## Step 5: Deploy / 部署

### 5.1 Start Deployment / 开始部署

#### English
1. Scroll to the bottom of the project import screen
2. Click **"Deploy"** button
3. Vercel will start the deployment process

**What happens:**
- Vercel clones your repository
- Installs dependencies (`npm install`)
- Builds your project (`npm run build`)
- Deploys to Vercel Edge Network
- Creates a production URL

**Time:** 2-5 minutes

#### 中文
1. 滚动到项目导入屏幕底部
2. 点击 **"部署"** 按钮
3. Vercel 将开始部署过程

**会发生什么：**
- Vercel 克隆您的仓库
- 安装依赖（`npm install`）
- 构建您的项目（`npm run build`）
- 部署到 Vercel 边缘网络
- 创建生产 URL

**时间：** 2-5 分钟

### 5.2 Monitor Deployment / 监控部署

#### English
1. You'll see a deployment log in real-time
2. Watch for:
   - ✅ "Installing dependencies..."
   - ✅ "Building..."
   - ✅ "Deploying..."
   - ✅ "Ready"

3. If you see errors:
   - Check the error message
   - Fix the issue
   - Redeploy

#### 中文
1. 您将看到实时部署日志
2. 注意：
   - ✅ "正在安装依赖..."
   - ✅ "正在构建..."
   - ✅ "正在部署..."
   - ✅ "就绪"

3. 如果看到错误：
   - 检查错误消息
   - 修复问题
   - 重新部署

### 5.3 Get Production URL / 获取生产 URL

#### English
Once deployment completes:
1. You'll see **"Congratulations! Your project has been deployed."**
2. Your production URL will be: `https://your-project-name.vercel.app`
3. Click the URL to open your application

#### 中文
部署完成后：
1. 您将看到 **"恭喜！您的项目已部署。"**
2. 您的生产 URL 将是：`https://your-project-name.vercel.app`
3. 点击 URL 打开您的应用程序

---

## Step 6: Post-Deployment Configuration / 部署后配置

### 6.1 Update Supabase Auth Settings / 更新 Supabase 认证设置

#### English
1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **URL Configuration**

2. Update **"Site URL":**
   - Change to: `https://your-project-name.vercel.app`

3. Add **Redirect URLs:**
   - `https://your-project-name.vercel.app/auth/callback`
   - `https://your-project-name.vercel.app/login`
   - `https://your-project-name.vercel.app/register`
   - `https://your-project-name.vercel.app/reset-password`

4. Click **"Save"**

#### 中文
1. 转到 **Supabase 仪表板** → 您的项目 → **认证** → **URL 配置**

2. 更新 **"站点 URL"：**
   - 更改为：`https://your-project-name.vercel.app`

3. 添加 **重定向 URL：**
   - `https://your-project-name.vercel.app/auth/callback`
   - `https://your-project-name.vercel.app/login`
   - `https://your-project-name.vercel.app/register`
   - `https://your-project-name.vercel.app/reset-password`

4. 点击 **"保存"**

### 6.2 Update NEXT_PUBLIC_APP_URL (Optional) / 更新 NEXT_PUBLIC_APP_URL（可选）

#### English
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Update value to: `https://your-project-name.vercel.app`
4. Click **"Save"**
5. **Redeploy** the project (Vercel will auto-redeploy on env var changes)

#### 中文
1. 转到 Vercel 仪表板 → 您的项目 → **设置** → **环境变量**
2. 找到 `NEXT_PUBLIC_APP_URL`
3. 更新值为：`https://your-project-name.vercel.app`
4. 点击 **"保存"**
5. **重新部署**项目（Vercel 会在环境变量更改时自动重新部署）

---

## Step 7: Test Your Deployment / 测试您的部署

### 7.1 Basic Functionality Tests / 基本功能测试

#### English
Test these features:

1. **Homepage:**
   - ✅ Page loads correctly
   - ✅ Navigation visible
   - ✅ Language selectors work

2. **Authentication:**
   - ✅ Registration works
   - ✅ Login works
   - ✅ Logout works
   - ✅ Password reset works (if configured)

3. **Word Lookup:**
   - ✅ Enter a word and search
   - ✅ Definition appears
   - ✅ Image loads (if available)
   - ✅ Audio plays (if available)

4. **Notebook:**
   - ✅ Save word to notebook
   - ✅ View notebook entries
   - ✅ Delete entries
   - ✅ Generate story

5. **Study Mode:**
   - ✅ Flashcards display
   - ✅ Flip animation works
   - ✅ Navigation works

#### 中文
测试这些功能：

1. **首页：**
   - ✅ 页面正确加载
   - ✅ 导航可见
   - ✅ 语言选择器工作

2. **认证：**
   - ✅ 注册工作
   - ✅ 登录工作
   - ✅ 登出工作
   - ✅ 密码重置工作（如果已配置）

3. **单词查询：**
   - ✅ 输入单词并搜索
   - ✅ 定义出现
   - ✅ 图片加载（如果可用）
   - ✅ 音频播放（如果可用）

4. **笔记本：**
   - ✅ 保存单词到笔记本
   - ✅ 查看笔记本条目
   - ✅ 删除条目
   - ✅ 生成故事

5. **学习模式：**
   - ✅ 抽认卡显示
   - ✅ 翻转动画工作
   - ✅ 导航工作

### 7.2 Check Logs / 检查日志

#### English
1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click on your latest deployment
3. Click **"Logs"** tab
4. Look for:
   - ✅ No critical errors
   - ✅ API calls succeeding
   - ✅ Database connections working

#### 中文
1. 转到 Vercel 仪表板 → 您的项目 → **部署**
2. 点击您的最新部署
3. 点击 **"日志"** 标签
4. 查找：
   - ✅ 无关键错误
   - ✅ API 调用成功
   - ✅ 数据库连接工作

---

## Step 8: Set Up Custom Domain (Optional) / 设置自定义域名（可选）

### 8.1 Add Domain / 添加域名

#### English
1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain name (e.g., `dictionary.example.com`)
4. Click **"Add"**

#### 中文
1. 转到 Vercel 仪表板 → 您的项目 → **设置** → **域名**
2. 点击 **"添加域名"**
3. 输入您的域名（例如，`dictionary.example.com`）
4. 点击 **"添加"**

### 8.2 Configure DNS / 配置 DNS

#### English
1. Vercel will show DNS configuration instructions
2. Add the provided DNS records to your domain registrar
3. Common records:
   - **CNAME:** `www` → `cname.vercel-dns.com`
   - **A Record:** `@` → Vercel IP address

4. Wait for DNS propagation (5 minutes to 24 hours)
5. Vercel will automatically provision SSL certificate

#### 中文
1. Vercel 将显示 DNS 配置说明
2. 将提供的 DNS 记录添加到您的域名注册商
3. 常见记录：
   - **CNAME：** `www` → `cname.vercel-dns.com`
   - **A 记录：** `@` → Vercel IP 地址

4. 等待 DNS 传播（5 分钟到 24 小时）
5. Vercel 将自动配置 SSL 证书

---

## Troubleshooting / 故障排除

### Common Issues / 常见问题

#### Issue 1: Build Fails / 构建失败

**English:**
- **Symptom:** Deployment fails during build
- **Solution:**
  1. Check build logs in Vercel Dashboard
  2. Run `npm run build` locally to reproduce
  3. Fix TypeScript/linting errors
  4. Commit and push fixes
  5. Vercel will auto-redeploy

**中文:**
- **症状：** 部署在构建期间失败
- **解决方案：**
  1. 在 Vercel 仪表板中检查构建日志
  2. 在本地运行 `npm run build` 以重现
  3. 修复 TypeScript/linting 错误
  4. 提交并推送修复
  5. Vercel 将自动重新部署

#### Issue 2: Environment Variables Not Working / 环境变量不工作

**English:**
- **Symptom:** API calls fail with "API key not found"
- **Solution:**
  1. Verify all variables are set in Vercel Dashboard
  2. Check variable names (case-sensitive!)
  3. Ensure variables are added for "Production" environment
  4. Redeploy after adding variables

**中文:**
- **症状：** API 调用失败，显示"未找到 API 密钥"
- **解决方案：**
  1. 验证所有变量是否在 Vercel 仪表板中设置
  2. 检查变量名（区分大小写！）
  3. 确保为"生产"环境添加了变量
  4. 添加变量后重新部署

#### Issue 3: Authentication Not Working / 认证不工作

**English:**
- **Symptom:** Login redirects fail or sessions don't persist
- **Solution:**
  1. Update Supabase Auth redirect URLs (Step 6.1)
  2. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
  3. Check middleware configuration
  4. Clear browser cookies and try again

**中文:**
- **症状：** 登录重定向失败或会话不持久
- **解决方案：**
  1. 更新 Supabase 认证重定向 URL（步骤 6.1）
  2. 验证 `NEXT_PUBLIC_SUPABASE_URL` 是否正确
  3. 检查中间件配置
  4. 清除浏览器 cookie 并重试

#### Issue 4: Database Connection Fails / 数据库连接失败

**English:**
- **Symptom:** "Cannot connect to database" errors
- **Solution:**
  1. Verify Supabase URL and keys are correct
  2. Check Supabase project is active
  3. Verify RLS policies allow access
  4. Check Supabase logs for errors

**中文:**
- **症状：** "无法连接到数据库"错误
- **解决方案：**
  1. 验证 Supabase URL 和密钥是否正确
  2. 检查 Supabase 项目是否处于活动状态
  3. 验证 RLS 策略是否允许访问
  4. 检查 Supabase 日志中的错误

---

## Success Checklist / 成功检查清单

### English
- [ ] Deployment completed successfully
- [ ] Production URL accessible
- [ ] All environment variables set
- [ ] Supabase Auth URLs configured
- [ ] Homepage loads correctly
- [ ] Registration works
- [ ] Login works
- [ ] Word lookup works
- [ ] Notebook save works
- [ ] Study mode works
- [ ] No critical errors in logs
- [ ] Custom domain configured (if applicable)

### 中文
- [ ] 部署成功完成
- [ ] 生产 URL 可访问
- [ ] 所有环境变量已设置
- [ ] Supabase 认证 URL 已配置
- [ ] 首页正确加载
- [ ] 注册工作
- [ ] 登录工作
- [ ] 单词查询工作
- [ ] 笔记本保存工作
- [ ] 学习模式工作
- [ ] 日志中无关键错误
- [ ] 自定义域名已配置（如适用）

---

## Next Steps / 下一步

### English
1. **Monitor Performance:**
   - Check Vercel Analytics
   - Monitor error rates
   - Track response times

2. **Set Up Alerts:**
   - Configure error notifications
   - Set up uptime monitoring

3. **Optimize:**
   - Review performance metrics
   - Optimize slow queries
   - Improve caching

4. **Scale:**
   - Monitor usage
   - Upgrade plans if needed
   - Add more features

### 中文
1. **监控性能：**
   - 检查 Vercel 分析
   - 监控错误率
   - 跟踪响应时间

2. **设置警报：**
   - 配置错误通知
   - 设置正常运行时间监控

3. **优化：**
   - 审查性能指标
   - 优化慢查询
   - 改进缓存

4. **扩展：**
   - 监控使用情况
   - 如需要升级计划
   - 添加更多功能

---

## Support / 支持

### English
If you encounter issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check Supabase documentation: https://supabase.com/docs
3. Review project logs in Vercel Dashboard
4. Check GitHub issues (if applicable)

### 中文
如果遇到问题：
1. 查看 Vercel 文档：https://vercel.com/docs
2. 查看 Supabase 文档：https://supabase.com/docs
3. 在 Vercel 仪表板中查看项目日志
4. 检查 GitHub issues（如适用）

---

**Congratulations! Your application is now live on Vercel! 🎉**

**恭喜！您的应用程序现在已在 Vercel 上运行！🎉**

