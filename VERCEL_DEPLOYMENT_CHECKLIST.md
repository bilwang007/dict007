# Vercel Deployment Quick Checklist
# Vercel 部署快速检查清单

## Pre-Deployment / 部署前

### Code Preparation / 代码准备
- [ ] All code committed to Git
- [ ] Code pushed to remote repository
- [ ] Local build succeeds: `npm run build`
- [ ] TypeScript check passes: `npm run type-check`
- [ ] Linter passes: `npm run lint`
- [ ] All features tested locally

### Service Accounts / 服务账户
- [ ] **Supabase Project** created
  - [ ] Project URL obtained
  - [ ] Anon key obtained
  - [ ] Service role key obtained
  - [ ] Database tables created
  - [ ] RLS policies configured

- [ ] **阿里云盘** configured
  - [ ] Client ID obtained
  - [ ] Client Secret obtained
  - [ ] Refresh Token obtained

- [ ] **SiliconFlow API** configured
  - [ ] API key obtained
  - [ ] API base URL confirmed
  - [ ] Model name confirmed

---

## Deployment Steps / 部署步骤

### Step 1: Vercel Account / Vercel 账户
- [ ] Created Vercel account
- [ ] Connected Git repository

### Step 2: Import Project / 导入项目
- [ ] Project imported to Vercel
- [ ] Framework auto-detected (Next.js)
- [ ] Build settings verified

### Step 3: Environment Variables / 环境变量
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added
- [ ] `ALIYUN_DRIVE_CLIENT_ID` added
- [ ] `ALIYUN_DRIVE_CLIENT_SECRET` added
- [ ] `ALIYUN_DRIVE_REFRESH_TOKEN` added
- [ ] `SILICONFLOW_API_KEY` added
- [ ] `SILICONFLOW_API_BASE` added
- [ ] `AI_MODEL` added
- [ ] All variables set for Production, Preview, Development

### Step 4: Deploy / 部署
- [ ] Deployment started
- [ ] Build completed successfully
- [ ] Production URL received
- [ ] No critical errors in logs

### Step 5: Post-Deployment / 部署后
- [ ] Supabase Auth URLs updated
  - [ ] Site URL updated
  - [ ] Redirect URLs added
- [ ] `NEXT_PUBLIC_APP_URL` updated (optional)

---

## Testing / 测试

### Basic Functionality / 基本功能
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Language selectors work

### Authentication / 认证
- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Password reset works (if configured)

### Core Features / 核心功能
- [ ] Word lookup works
- [ ] Definitions display correctly
- [ ] Images load (if available)
- [ ] Audio plays (if available)
- [ ] Save to notebook works
- [ ] View notebook works
- [ ] Delete notebook entry works
- [ ] Story generation works
- [ ] Study mode (flashcards) works

### Error Handling / 错误处理
- [ ] No critical errors in Vercel logs
- [ ] No critical errors in browser console
- [ ] API errors handled gracefully
- [ ] Database errors handled gracefully

---

## Optional Configuration / 可选配置

### Custom Domain / 自定义域名
- [ ] Domain added to Vercel
- [ ] DNS records configured
- [ ] SSL certificate provisioned
- [ ] Domain verified and working

### Monitoring / 监控
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (optional)
- [ ] Uptime monitoring set up (optional)

---

## Environment Variables Reference / 环境变量参考

### Required Variables / 必需变量
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# 阿里云盘
ALIYUN_DRIVE_CLIENT_ID=xxx
ALIYUN_DRIVE_CLIENT_SECRET=xxx
ALIYUN_DRIVE_REFRESH_TOKEN=xxx

# AI Services
SILICONFLOW_API_KEY=sk-xxx
SILICONFLOW_API_BASE=https://api.siliconflow.cn/v1
AI_MODEL=deepseek-ai/DeepSeek-V3
```

### Optional Variables / 可选变量
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
EDGE_TTS_API_URL=http://your-edge-tts-server:5050
EDGE_TTS_API_KEY=your_api_key_here
```

---

## Quick Commands / 快速命令

### Local Testing / 本地测试
```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Start dev server
npm run dev
```

### Git Commands / Git 命令
```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main
```

### Vercel CLI (Optional) / Vercel CLI（可选）
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Pull environment variables
vercel env pull .env.local
```

---

## Troubleshooting Quick Reference / 故障排除快速参考

### Build Fails / 构建失败
1. Check Vercel build logs
2. Run `npm run build` locally
3. Fix TypeScript/linting errors
4. Commit and push fixes

### Environment Variables Not Working / 环境变量不工作
1. Verify all variables in Vercel Dashboard
2. Check variable names (case-sensitive)
3. Ensure Production environment selected
4. Redeploy after changes

### Authentication Issues / 认证问题
1. Update Supabase Auth redirect URLs
2. Verify Supabase URL and keys
3. Check middleware configuration
4. Clear browser cookies

### Database Connection Issues / 数据库连接问题
1. Verify Supabase URL and keys
2. Check Supabase project is active
3. Verify RLS policies
4. Check Supabase logs

---

## Success Criteria / 成功标准

### Deployment Success / 部署成功
- ✅ Application accessible at production URL
- ✅ All environment variables configured
- ✅ No critical errors in logs
- ✅ Build completes successfully

### Functionality Success / 功能成功
- ✅ All core features working
- ✅ Authentication flow working
- ✅ Database operations working
- ✅ API endpoints responding

### Performance Success / 性能成功
- ✅ Page load time < 2 seconds
- ✅ API response time < 3 seconds
- ✅ No timeout errors
- ✅ Images load correctly

---

## Support Resources / 支持资源

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Project PRD:** `PRD_VERCEL_DEPLOYMENT.md`
- **Detailed Guide:** `VERCEL_DEPLOYMENT_GUIDE.md`

---

**Last Updated:** 2024  
**Version:** 1.0

