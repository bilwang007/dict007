# Vercel 部署检查清单 / Deployment Checklist

## ✅ 代码准备 / Code Preparation

- [x] TypeScript 类型检查通过
- [x] ESLint 检查通过（仅有警告）
- [x] 构建成功 (`npm run build`)
- [x] Git 仓库已初始化
- [x] 所有更改已提交

## 📋 部署前检查 / Pre-Deployment Checklist

### 1. Git 仓库设置 / Git Repository Setup

**选项 A：连接到现有仓库**
```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

**选项 B：创建新仓库**
1. 在 GitHub/GitLab/Bitbucket 创建新仓库
2. 运行上面的命令（替换 `<your-repo-url>`）

### 2. 环境变量准备 / Environment Variables

确保你已准备好以下环境变量：

#### Supabase (3 个)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**获取方式：** Supabase Dashboard → Settings → API

#### 阿里云盘 (3 个)
- [ ] `ALIYUN_DRIVE_CLIENT_ID`
- [ ] `ALIYUN_DRIVE_CLIENT_SECRET`
- [ ] `ALIYUN_DRIVE_REFRESH_TOKEN`

**获取方式：** 查看 `CONFIGURATION_GUIDE.md` 或访问 https://open.alipan.com/

#### AI 服务 (3 个)
- [ ] `SILICONFLOW_API_KEY`
- [ ] `SILICONFLOW_API_BASE` (默认: `https://api.siliconflow.cn/v1`)
- [ ] `AI_MODEL` (默认: `deepseek-ai/DeepSeek-V3`)

**获取方式：** https://cloud.siliconflow.cn

#### 可选 (1 个)
- [ ] `NEXT_PUBLIC_APP_URL` (部署后自动设置)

**总计：9 个必需环境变量**

### 3. Vercel 部署步骤 / Vercel Deployment Steps

1. **访问 Vercel**
   - 前往 https://vercel.com
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的仓库
   - 点击 "Import"

3. **配置项目设置**
   - Framework Preset: `Next.js` (自动检测)
   - Root Directory: `./` (默认)
   - Build Command: `npm run build` (自动检测)
   - Output Directory: `.next` (自动检测)
   - Install Command: `npm install` (自动检测)

4. **添加环境变量**
   - 在项目设置页面，找到 "Environment Variables"
   - 添加所有 9 个环境变量
   - 确保为所有环境启用（Production, Preview, Development）

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待 2-5 分钟
   - 获取生产 URL: `https://your-project-name.vercel.app`

### 4. 部署后配置 / Post-Deployment Configuration

#### Supabase 认证设置
1. 前往 Supabase Dashboard → Authentication → URL Configuration
2. 更新 Site URL: `https://your-project-name.vercel.app`
3. 添加 Redirect URLs:
   - `https://your-project-name.vercel.app/auth/callback`
   - `https://your-project-name.vercel.app/login`
   - `https://your-project-name.vercel.app/register`
   - `https://your-project-name.vercel.app/reset-password`

#### 更新环境变量（可选）
1. 在 Vercel Dashboard → Settings → Environment Variables
2. 更新 `NEXT_PUBLIC_APP_URL` 为实际 URL
3. Vercel 会自动重新部署

### 5. 测试清单 / Testing Checklist

部署后测试以下功能：

- [ ] 首页加载正常
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 单词查询功能
- [ ] 保存到笔记本
- [ ] 查看笔记本
- [ ] 学习模式（抽认卡）
- [ ] 生成故事功能
- [ ] 图片加载
- [ ] 音频播放

### 6. 故障排除 / Troubleshooting

如果遇到问题，检查：

1. **构建失败**
   - 查看 Vercel 构建日志
   - 确认所有环境变量已设置
   - 检查变量名是否正确（区分大小写）

2. **认证不工作**
   - 确认 Supabase URL 和密钥正确
   - 检查 Supabase 重定向 URL 配置
   - 清除浏览器 cookies 重试

3. **API 调用失败**
   - 检查所有 API 密钥是否正确
   - 查看 Vercel 函数日志
   - 检查 Supabase 项目是否激活

## 📝 快速命令参考 / Quick Command Reference

```bash
# 检查构建
npm run build

# 检查类型
npm run type-check

# 检查代码质量
npm run lint

# Git 提交
git add .
git commit -m "Your message"
git push origin main
```

## 🎉 完成！

部署成功后，你的应用将在 Vercel 上运行！

**生产 URL:** `https://your-project-name.vercel.app`

---

**最后更新:** $(date)

