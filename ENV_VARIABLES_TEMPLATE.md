# 环境变量准备清单 / Environment Variables Checklist

请准备以下环境变量的值。你可以从相应的服务获取它们。

## 📋 需要准备的环境变量

### 1. Supabase (3 个变量)

**获取位置：** Supabase Dashboard → Your Project → Settings → API

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - 值：`https://your-project.supabase.co`
  - 位置：Project URL

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - 值：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (长字符串)
  - 位置：anon public key

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - 值：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (长字符串)
  - 位置：service_role key (⚠️ 保密！)

---

### 2. 阿里云盘 (3 个变量)

**获取位置：** https://open.alipan.com/ 或查看 `CONFIGURATION_GUIDE.md`

- [ ] `ALIYUN_DRIVE_CLIENT_ID`
  - 值：你的客户端 ID

- [ ] `ALIYUN_DRIVE_CLIENT_SECRET`
  - 值：你的客户端密钥

- [ ] `ALIYUN_DRIVE_REFRESH_TOKEN`
  - 值：你的刷新令牌

---

### 3. AI 服务 - SiliconFlow (3 个变量)

**获取位置：** https://cloud.siliconflow.cn

- [ ] `SILICONFLOW_API_KEY`
  - 值：你的 API 密钥
  - 获取：登录后创建 API Key

- [ ] `SILICONFLOW_API_BASE`
  - 值：`https://api.siliconflow.cn/v1` (固定值)

- [ ] `AI_MODEL`
  - 值：`deepseek-ai/DeepSeek-V3` (默认，或你选择的其他模型)

---

### 4. 可选变量 (1 个)

- [ ] `NEXT_PUBLIC_APP_URL`
  - 值：部署后自动设置（可以先留空）
  - 格式：`https://your-project-name.vercel.app`

---

## 📝 快速检查

确保你有：
- ✅ 3 个 Supabase 变量
- ✅ 3 个阿里云盘变量  
- ✅ 3 个 AI 服务变量
- ⚠️ 1 个可选变量（可稍后设置）

**总计：9 个必需变量 + 1 个可选变量**

---

## 💡 提示

1. **保存这些值**：建议保存在安全的地方（密码管理器）
2. **不要提交到 Git**：这些是敏感信息，不要提交到代码仓库
3. **Vercel 设置**：我们会在 Vercel Dashboard 中添加这些变量

---

准备好后，告诉我你的 Git 仓库 URL，我们就可以继续了！

