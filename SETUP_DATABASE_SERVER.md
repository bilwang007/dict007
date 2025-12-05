# Database & Server Setup Guide
# 数据库和服务器设置指南

## Quick Setup Options / 快速设置选项

### Option 1: Local Testing (No Database) / 选项 1：本地测试（无数据库）

**Fastest way to test new features:**

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
# Create .env.local:
SILICONFLOW_API_KEY=your-key
UNSPLASH_ACCESS_KEY=your-key

# 3. Start server
npm run dev

# 4. Open browser
# http://localhost:3000
```

**Features work with localStorage:**
- ✅ Batch upload
- ✅ Tagging (individual and batch)
- ✅ First learned date tracking
- ⚠️ Data only in browser (not persistent across devices)

---

### Option 2: Local Database (Development) / 选项 2：本地数据库（开发）

#### Install PostgreSQL / 安装 PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
- Download: https://www.postgresql.org/download/windows/
- Install with default settings

#### Create Database / 创建数据库

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE dictionary;
CREATE USER dictionary_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE dictionary TO dictionary_user;
ALTER USER dictionary_user CREATEDB;
\q
```

#### Install Prisma / 安装 Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

#### Configure Prisma / 配置 Prisma

**Update `prisma/schema.prisma`:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  notebookEntries NotebookEntry[]
  stories         Story[]
  
  @@map("users")
}

model NotebookEntry {
  id                  String   @id @default(cuid())
  userId              String
  word                String
  targetLanguage      String
  nativeLanguage      String
  definition          String
  definitionTarget    String?
  imageUrl            String?
  audioUrl            String?
  exampleSentence1    String
  exampleSentence2    String
  exampleTranslation1 String
  exampleTranslation2 String
  usageNote           String
  tags                String[] @default([])
  firstLearnedDate    DateTime @default(now())
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, word, targetLanguage, nativeLanguage])
  @@index([userId])
  @@index([userId, tags])
  @@map("notebook_entries")
}

model Story {
  id          String   @id @default(cuid())
  userId      String
  content     String
  translation String
  wordsUsed   String[]
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("stories")
}
```

#### Set Environment Variables / 设置环境变量

**Create `.env.local`:**
```env
# Database
DATABASE_URL="postgresql://dictionary_user:your_password@localhost:5432/dictionary"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# AI Services
SILICONFLOW_API_KEY=your-key
AI_MODEL=deepseek-ai/DeepSeek-V3

# Image Service
UNSPLASH_ACCESS_KEY=your-key

# App
NODE_ENV=development
```

#### Run Migrations / 运行迁移

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
# Opens at http://localhost:5555
```

#### Start Server / 启动服务器

```bash
npm run dev
```

---

### Option 3: Vercel (Easiest Production) / 选项 3：Vercel（最简单的生产环境）

#### Step 1: Create Vercel Account / 创建 Vercel 账户

1. Go to https://vercel.com
2. Sign up (GitHub recommended)
3. Verify email

#### Step 2: Create Database / 创建数据库

1. **In Vercel Dashboard:**
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose region
   - Name: `dictionary`
   - Click "Create"

2. **Copy Connection Strings:**
   - `POSTGRES_PRISMA_URL` (for Prisma)
   - `POSTGRES_URL_NON_POOLING` (for migrations)

#### Step 3: Set Environment Variables / 设置环境变量

**In Vercel Dashboard → Settings → Environment Variables:**

```env
POSTGRES_PRISMA_URL=postgres://... (from Vercel)
POSTGRES_URL_NON_POOLING=postgres://... (from Vercel)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-here
SILICONFLOW_API_KEY=your-key
UNSPLASH_ACCESS_KEY=your-key
AI_MODEL=deepseek-ai/DeepSeek-V3
NODE_ENV=production
```

#### Step 4: Deploy / 部署

**Option A: GitHub Integration (Recommended)**
1. Push code to GitHub
2. In Vercel: "Add New Project"
3. Import GitHub repository
4. Vercel auto-deploys

**Option B: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Step 5: Run Migrations / 运行迁移

```bash
# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

**Or add to `package.json`:**
```json
{
  "scripts": {
    "postdeploy": "prisma migrate deploy && prisma generate"
  }
}
```

---

### Option 4: ECS Server (Full Control) / 选项 4：ECS 服务器（完全控制）

#### Complete ECS Setup Script / 完整 ECS 设置脚本

**Save as `setup-ecs.sh` and run on server:**

```bash
#!/bin/bash
# setup-ecs.sh - Complete ECS setup script

set -e  # Exit on error

echo "=== Starting ECS Setup ==="

# 1. Update system
echo "Updating system..."
apt-get update
apt-get upgrade -y

# 2. Install Node.js
echo "Installing Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18
nvm alias default 18

# 3. Install PostgreSQL
echo "Installing PostgreSQL..."
apt-get install postgresql postgresql-contrib -y
systemctl start postgresql
systemctl enable postgresql

# 4. Create database
echo "Creating database..."
sudo -u postgres psql <<EOF
CREATE DATABASE dictionary;
CREATE USER dictionary_user WITH PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE dictionary TO dictionary_user;
ALTER USER dictionary_user CREATEDB;
\q
EOF

# 5. Install Nginx
echo "Installing Nginx..."
apt-get install nginx -y
systemctl start nginx
systemctl enable nginx

# 6. Install PM2
echo "Installing PM2..."
npm install -g pm2

# 7. Install Certbot (for SSL)
echo "Installing Certbot..."
apt-get install certbot python3-certbot-nginx -y

echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Clone your repository to /var/www/dictionary-app"
echo "2. Set up environment variables in .env"
echo "3. Run: npm install && npx prisma migrate deploy"
echo "4. Build: npm run build"
echo "5. Start with PM2: pm2 start ecosystem.config.js"
echo "6. Configure Nginx (see PRD section 4)"
```

**Make executable and run:**
```bash
chmod +x setup-ecs.sh
./setup-ecs.sh
```

---

## Testing New Features / 测试新功能

### Test 1: Batch Upload / 测试 1：批量上传

1. **Create test file `test.txt`:**
   ```
   hello
   world
   beautiful
   ```

2. **Go to Notebook page:**
   - `http://localhost:3000/notebook`

3. **Click "Batch Upload"**

4. **Select languages and upload file**

5. **Verify:**
   - Words appear in notebook
   - Definitions generated
   - Images loaded

### Test 2: Tagging / 测试 2：标签

1. **Select entries** (checkboxes)

2. **Click "Manage Tags"**

3. **Add tag:** Enter "verbs" → Click "Add Tag"

4. **Verify:** Tag appears on all selected entries

5. **Remove tag:** Click X on tag

6. **Verify:** Tag removed from all selected entries

### Test 3: First Learned Date / 测试 3：首次学习日期

1. **Save a new word** from main page

2. **Go to Notebook**

3. **Check:** "First learned: [date]" is shown

4. **Update the entry** (lookup same word, replace)

5. **Verify:** First learned date is preserved

---

## Quick Commands Reference / 快速命令参考

### Database Commands / 数据库命令

```bash
# Connect to database
psql -U dictionary_user -d dictionary -h localhost

# List databases
psql -U postgres -c "\l"

# List tables
psql -U dictionary_user -d dictionary -c "\dt"

# View table structure
psql -U dictionary_user -d dictionary -c "\d notebook_entries"

# Backup database
pg_dump -U dictionary_user -d dictionary > backup.sql

# Restore database
psql -U dictionary_user -d dictionary < backup.sql
```

### Prisma Commands / Prisma 命令

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# View database in browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### PM2 Commands / PM2 命令

```bash
# Start app
pm2 start ecosystem.config.js

# Stop app
pm2 stop dictionary-app

# Restart app
pm2 restart dictionary-app

# View logs
pm2 logs dictionary-app

# View status
pm2 status

# Monitor
pm2 monit
```

### Nginx Commands / Nginx 命令

```bash
# Test config
nginx -t

# Reload config
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View error logs
tail -f /var/log/nginx/error.log

# View access logs
tail -f /var/log/nginx/access.log
```

---

## Environment Variables Checklist / 环境变量清单

### Required for Local Testing / 本地测试必需

```env
SILICONFLOW_API_KEY=your-key
UNSPLASH_ACCESS_KEY=your-key
```

### Required for Database Version / 数据库版本必需

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dictionary

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=random-32-char-string

# AI Services
SILICONFLOW_API_KEY=your-key
AI_MODEL=deepseek-ai/DeepSeek-V3

# Image Service
UNSPLASH_ACCESS_KEY=your-key
```

### Required for Production / 生产环境必需

```env
# Database (Vercel Postgres)
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...

# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=random-32-char-string

# AI Services
SILICONFLOW_API_KEY=your-key
AI_MODEL=deepseek-ai/DeepSeek-V3

# Image Service
UNSPLASH_ACCESS_KEY=your-key

# App
NODE_ENV=production
```

---

## Verification Steps / 验证步骤

### After Local Setup / 本地设置后

```bash
# 1. Check server is running
curl http://localhost:3000/api/health
# Should return: {"status":"ok",...}

# 2. Check database connection (if using database)
npx prisma db pull
# Should connect successfully

# 3. Test batch upload
# Upload test.txt file in notebook page

# 4. Test tagging
# Add tags to entries

# 5. Check browser console
# Should have no errors
```

### After Vercel Deployment / Vercel 部署后

```bash
# 1. Check deployment
# Visit: https://your-app.vercel.app

# 2. Check health endpoint
curl https://your-app.vercel.app/api/health

# 3. Test registration
# Create new account

# 4. Test batch upload
# Upload file in notebook

# 5. Check Vercel logs
# Dashboard → Deployments → View Logs
```

### After ECS Deployment / ECS 部署后

```bash
# 1. Check PM2
pm2 status
# Should show: online

# 2. Check Nginx
systemctl status nginx
# Should show: active (running)

# 3. Check PostgreSQL
systemctl status postgresql
# Should show: active (running)

# 4. Test health endpoint
curl http://YOUR_ECS_IP/api/health

# 5. Test in browser
# Visit: http://YOUR_ECS_IP
```

---

## Common Issues & Solutions / 常见问题和解决方案

### Issue: "Cannot find module 'xlsx'" / 问题：找不到模块 'xlsx'

**Solution:**
```bash
npm install xlsx papaparse @types/papaparse
npm run dev
```

### Issue: Batch upload returns empty results / 问题：批量上传返回空结果

**Solution:**
1. Check file format is supported
2. Check file has content
3. Check API key is valid
4. Check server logs: `pm2 logs dictionary-app`

### Issue: Tags not persisting / 问题：标签不持久

**Solution:**
1. If using localStorage: Check browser storage
2. If using database: Check database connection
3. Verify storage functions are called
4. Check browser console for errors

### Issue: Database connection fails / 问题：数据库连接失败

**Solution:**
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U dictionary_user -d dictionary -h localhost

# Check connection string in .env
cat .env | grep DATABASE_URL

# Restart PostgreSQL
systemctl restart postgresql
```

### Issue: Prisma migration fails / 问题：Prisma 迁移失败

**Solution:**
```bash
# Reset database (WARNING: deletes data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_migration

# For production
npx prisma migrate deploy
```

---

**Ready to test!** Start with local testing (no database), then move to database setup when ready.

