# 快速部署步骤 / Quick Deployment Steps

## 🚀 完整流程概览

### 阶段 1: Git 仓库设置 (5 分钟)

1. **创建 GitHub 仓库**
   - 访问：https://github.com/new
   - 仓库名：`dictionary-zara` (或你喜欢的名字)
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize with README"
   - 点击 "Create repository"

2. **连接本地仓库**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### 阶段 2: Vercel 部署 (10 分钟)

1. **登录 Vercel**
   - 访问：https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的仓库
   - 点击 "Import"

3. **配置项目**
   - Framework: Next.js (自动检测)
   - 其他设置保持默认
   - **先不要点击 Deploy！**

4. **添加环境变量**
   - 在 "Environment Variables" 部分
   - 添加所有 9 个变量（见 ENV_VARIABLES_TEMPLATE.md）
   - 确保为所有环境启用（Production, Preview, Development）

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待 2-5 分钟

### 阶段 3: 部署后配置 (5 分钟)

1. **获取生产 URL**
   - 部署完成后，你会看到：`https://your-project-name.vercel.app`

2. **配置 Supabase**
   - 访问 Supabase Dashboard
   - Authentication → URL Configuration
   - 更新 Site URL 为你的 Vercel URL
   - 添加 Redirect URLs

3. **测试应用**
   - 访问你的 Vercel URL
   - 测试注册、登录、查询等功能

---

## ⏱️ 总时间：约 20 分钟

## 📋 检查清单

- [ ] Git 仓库已创建并连接
- [ ] 代码已推送到远程仓库
- [ ] Vercel 账号已登录
- [ ] 项目已导入到 Vercel
- [ ] 所有 9 个环境变量已添加
- [ ] 部署已完成
- [ ] Supabase 认证 URL 已配置
- [ ] 应用测试通过

---

## 🆘 需要帮助？

如果遇到问题，查看：
- `VERCEL_DEPLOYMENT_GUIDE.md` - 详细部署指南
- `DEPLOYMENT_CHECKLIST.md` - 完整检查清单
- `TROUBLESHOOTING.md` - 故障排除指南

