# Testing Guide - New Features
# 测试指南 - 新功能

## Quick Start Testing / 快速开始测试

### Prerequisites / 先决条件

1. **Node.js 18+ installed**
2. **Dependencies installed:** `npm install`
3. **Environment variables set:** `.env.local` with API keys
4. **Development server running:** `npm run dev`

---

## Testing New Features / 测试新功能

### 1. Test Batch Upload / 测试批量上传

#### Step 1: Create Test Files / 创建测试文件

**Create `test-words.txt`:**
```
hello
world
beautiful
amazing
wonderful
```

**Create `test-words.csv`:**
```csv
word
hello
world
beautiful
amazing
wonderful
```

**Create `test-words.md`:**
```markdown
# My Vocabulary List

- hello
- world
- beautiful
- amazing
- wonderful

These are words I want to learn.
```

#### Step 2: Test Batch Upload / 测试批量上传

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Navigate to Notebook page:**
   - Go to `http://localhost:3000/notebook`
   - Or click "Notebook" in navigation

3. **Open Batch Upload section:**
   - Click "Batch Upload" button
   - Select target language (e.g., English)
   - Select native language (e.g., Chinese)

4. **Upload a file:**
   - Click "Choose File"
   - Select `test-words.txt` (or CSV/Markdown)
   - Wait for processing (shows progress)

5. **Verify results:**
   - Check that words appear in notebook
   - Verify definitions are generated
   - Check that images are loaded

**Expected Result:**
- All words from file are processed
- Definitions generated for each word
- Words saved to notebook
- Success message shows count

---

### 2. Test Tagging System / 测试标签系统

#### Test Individual Tagging / 测试单个标签

1. **Go to Notebook page**
2. **Find any entry**
3. **Click "Add Tag" button** (purple button with tag icon)
4. **Enter tag name** (e.g., "verbs", "adjectives")
5. **Press Enter or click "Add"**
6. **Verify:**
   - Tag appears below the entry
   - Tag has remove button (X)

#### Test Batch Tagging / 测试批量标签

1. **Select multiple entries:**
   - Check boxes next to entries you want to tag
   - Or click "Select All"

2. **Open Batch Tagging:**
   - Click "Manage Tags" button
   - Batch tagging panel opens

3. **Add tag to selected entries:**
   - Enter tag name (e.g., "review")
   - Click "Add Tag"
   - Verify tag appears on all selected entries

4. **Remove tag from selected entries:**
   - Click X button on tag in "Available Tags" section
   - Tag removed from all selected entries

**Expected Result:**
- Tags added to all selected entries
- Tags can be removed individually or in batch
- Tags persist after page refresh

---

### 3. Test First Learned Date / 测试首次学习日期

1. **Save a new word:**
   - Go to main page
   - Look up a word
   - Save to notebook

2. **Check first learned date:**
   - Go to Notebook page
   - Find the entry
   - Look at bottom: "First learned: [date]"

3. **Update the entry:**
   - Look up the same word again
   - Click "Replace" when prompted
   - Go back to Notebook

4. **Verify:**
   - First learned date is preserved
   - Created date may be different
   - Both dates are displayed

**Expected Result:**
- First learned date shows when word was first saved
- Date preserved even after updates
- Both dates visible in entry

---

### 4. Test LLM API Replacement / 测试 LLM API 替换

#### Test with Different Providers / 测试不同提供商

**Option A: Switch to OpenAI**

1. **Update `.env.local`:**
   ```env
   OPENAI_API_KEY=sk-your-openai-key
   API_BASE_URL=https://api.openai.com/v1
   AI_MODEL=gpt-4-turbo-preview
   ```

2. **Restart server:**
   ```bash
   # Press Ctrl+C
   npm run dev
   ```

3. **Test word lookup:**
   - Look up a word
   - Verify definition is generated
   - Check response quality

**Option B: Test Fallback Mechanism**

1. **Set invalid SiliconFlow key:**
   ```env
   SILICONFLOW_API_KEY=invalid-key
   ```

2. **Set OpenAI as backup:**
   ```env
   OPENAI_API_KEY=sk-valid-key
   ```

3. **Test:**
   - Look up a word
   - Should fallback to OpenAI if SiliconFlow fails

---

## Database Setup / 数据库设置

### Option 1: Local PostgreSQL (for Development) / 选项 1：本地 PostgreSQL（用于开发）

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
sudo systemctl enable postgresql
```

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install with default settings

#### Create Database / 创建数据库

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE dictionary;

# Create user
CREATE USER dictionary_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dictionary TO dictionary_user;

# Exit
\q
```

#### Update Environment Variables / 更新环境变量

**Create/Update `.env.local`:**
```env
# Database
DATABASE_URL="postgresql://dictionary_user:your_secure_password@localhost:5432/dictionary"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-32-char-string-here"

# AI Services
SILICONFLOW_API_KEY=your-key
AI_MODEL=deepseek-ai/DeepSeek-V3

# Image Service
UNSPLASH_ACCESS_KEY=your-key

# App
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### Set Up Prisma / 设置 Prisma

```bash
# Install Prisma
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init

# Update prisma/schema.prisma with your schema (from PRD section 3.3)
# Include tags and firstLearnedDate fields

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

---

### Option 2: Vercel Postgres (for Production) / 选项 2：Vercel Postgres（用于生产）

#### Step 1: Create Vercel Account / 创建 Vercel 账户

1. Go to https://vercel.com
2. Sign up with GitHub/Email
3. Verify email

#### Step 2: Create Project / 创建项目

1. **Import Repository:**
   - Click "Add New Project"
   - Connect your GitHub repository
   - Or upload code manually

2. **Configure Project:**
   - Framework: Next.js
   - Root Directory: `.` (root)
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Step 3: Create Database / 创建数据库

1. **Go to Storage tab:**
   - In your Vercel project dashboard
   - Click "Storage" tab
   - Click "Create Database"

2. **Select Postgres:**
   - Choose "Postgres"
   - Select region (closest to users)
   - Database name: `dictionary`
   - Click "Create"

3. **Get Connection Strings:**
   - Copy `POSTGRES_PRISMA_URL`
   - Copy `POSTGRES_URL_NON_POOLING`
   - Save these for environment variables

#### Step 4: Set Environment Variables / 设置环境变量

**In Vercel Dashboard → Settings → Environment Variables:**

```env
# Database (from Vercel Postgres)
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-32-char-secret

# AI Services
SILICONFLOW_API_KEY=your-key
AI_MODEL=deepseek-ai/DeepSeek-V3

# Image Service
UNSPLASH_ACCESS_KEY=your-key

# App
NODE_ENV=production
```

#### Step 5: Deploy / 部署

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Step 6: Run Migrations / 运行迁移

**After deployment, run migrations:**

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

## Server Setup (ECS) / 服务器设置（ECS）

### Complete Setup Steps / 完整设置步骤

#### 1. Connect to Server / 连接到服务器

```bash
ssh root@YOUR_ECS_IP
# Enter password when prompted
```

#### 2. Update System / 更新系统

```bash
apt-get update
apt-get upgrade -y
```

#### 3. Install Node.js / 安装 Node.js

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node --version  # Should show v18.x.x
npm --version
```

#### 4. Install PostgreSQL / 安装 PostgreSQL

```bash
# Install PostgreSQL
apt-get install postgresql postgresql-contrib -y

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Verify it's running
systemctl status postgresql
```

#### 5. Create Database / 创建数据库

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE dictionary;
CREATE USER dictionary_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE dictionary TO dictionary_user;
ALTER USER dictionary_user CREATEDB;
\q

# Test connection
psql -U dictionary_user -d dictionary -h localhost
# Enter password when prompted
# Type \q to exit
```

#### 6. Install Nginx / 安装 Nginx

```bash
apt-get install nginx -y
systemctl start nginx
systemctl enable nginx
```

#### 7. Install PM2 / 安装 PM2

```bash
npm install -g pm2
```

#### 8. Clone and Setup Application / 克隆和设置应用

```bash
# Create directory
mkdir -p /var/www
cd /var/www

# Clone repository (replace with your repo URL)
git clone YOUR_REPOSITORY_URL dictionary-app
cd dictionary-app

# Install dependencies
npm install

# Install Prisma
npm install prisma @prisma/client

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

#### 9. Set Environment Variables / 设置环境变量

```bash
# Create .env file
nano .env
```

**Paste your environment variables:**
```env
# Database
DATABASE_URL="postgresql://dictionary_user:YOUR_PASSWORD@localhost:5432/dictionary?connection_limit=10&pool_timeout=20"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-random-32-char-secret"
AUTH_SECRET="your-random-32-char-secret"

# AI Services
SILICONFLOW_API_KEY="sk-your-key"
AI_MODEL="deepseek-ai/DeepSeek-V3"
IMAGE_MODEL="Qwen/Qwen2-VL-72B-Instruct"
AUDIO_MODEL="MOSS"

# Image Service
UNSPLASH_ACCESS_KEY="your-key"

# App
NODE_ENV="production"
PORT="3000"
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

#### 10. Build Application / 构建应用

```bash
npm run build
```

#### 11. Start with PM2 / 使用 PM2 启动

```bash
# Create PM2 config
nano ecosystem.config.js
```

**Paste:**
```javascript
module.exports = {
  apps: [{
    name: 'dictionary-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/dictionary-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/www/dictionary-app/logs/pm2-error.log',
    out_file: '/var/www/dictionary-app/logs/pm2-out.log',
    log_file: '/var/www/dictionary-app/logs/pm2-combined.log',
    time: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
# Create logs directory
mkdir -p logs

# Start app
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Enable auto-start on boot
pm2 startup
# Follow the instructions shown
```

#### 12. Configure Nginx / 配置 Nginx

```bash
# Create Nginx config
nano /etc/nginx/sites-available/dictionary-app
```

**Paste:**
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Client body size limit (for file uploads)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /api/health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/dictionary-app /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

#### 13. Set Up SSL (Optional) / 设置 SSL（可选）

```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx -y

# Get SSL certificate (if you have domain)
certbot --nginx -d yourdomain.com

# Follow prompts
```

#### 14. Verify Deployment / 验证部署

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs dictionary-app

# Check Nginx
systemctl status nginx

# Check PostgreSQL
systemctl status postgresql

# Test health endpoint
curl http://localhost:3000/api/health
```

---

## Testing Checklist / 测试清单

### Local Testing (No Database) / 本地测试（无数据库）

- [ ] Batch upload works with .txt files
- [ ] Batch upload works with .csv files
- [ ] Batch upload works with .md files
- [ ] Batch upload works with .xlsx files
- [ ] Tags can be added to individual entries
- [ ] Tags can be removed from individual entries
- [ ] Batch tagging adds tags to multiple entries
- [ ] Batch tagging removes tags from multiple entries
- [ ] First learned date is tracked
- [ ] First learned date is preserved on update
- [ ] Tags persist after page refresh
- [ ] All tags are visible in tag management

### Database Testing (With PostgreSQL) / 数据库测试（使用 PostgreSQL）

- [ ] Database connection works
- [ ] Migrations run successfully
- [ ] Entries save to database
- [ ] Entries load from database
- [ ] Tags save to database
- [ ] First learned date saves to database
- [ ] Batch upload saves to database
- [ ] Data persists after server restart

### Production Testing (Vercel/ECS) / 生产测试（Vercel/ECS）

- [ ] Application accessible via URL
- [ ] Health check endpoint responds
- [ ] User registration works
- [ ] User login works
- [ ] Word lookup works
- [ ] Batch upload works
- [ ] Tagging works
- [ ] Data persists across sessions
- [ ] SSL certificate works (if configured)

---

## Troubleshooting / 故障排除

### Batch Upload Not Working / 批量上传不工作

**Problem:** File upload fails or no words extracted

**Solutions:**
1. Check file format is supported (.txt, .md, .csv, .xlsx, .xls)
2. Check file size (max 10MB)
3. Check browser console for errors
4. Check server logs: `pm2 logs dictionary-app`
5. Verify API key is set correctly

### Tags Not Saving / 标签不保存

**Problem:** Tags disappear after refresh

**Solutions:**
1. Check browser localStorage (if using local storage)
2. Check database connection (if using database)
3. Check browser console for errors
4. Verify storage functions are called correctly

### Database Connection Error / 数据库连接错误

**Problem:** Cannot connect to database

**Solutions:**
1. Check PostgreSQL is running: `systemctl status postgresql`
2. Check connection string in `.env`
3. Test connection: `psql -U dictionary_user -d dictionary -h localhost`
4. Check firewall rules
5. Verify database exists: `psql -l | grep dictionary`

### LLM API Not Working / LLM API 不工作

**Problem:** Definitions not generating

**Solutions:**
1. Check API key is correct
2. Check API base URL
3. Check model name is valid
4. Check API credits/balance
5. Try different provider (fallback)
6. Check server logs for API errors

---

## Quick Test Commands / 快速测试命令

```bash
# Test database connection
psql -U dictionary_user -d dictionary -h localhost

# Test API endpoint
curl http://localhost:3000/api/health

# Check PM2 status
pm2 status

# View logs
pm2 logs dictionary-app --lines 50

# Restart app
pm2 restart dictionary-app

# Test Nginx config
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

**Next Steps:**
1. Test locally first (no database needed)
2. Set up local database for testing
3. Deploy to Vercel for production
4. Or deploy to ECS for full control

**Need Help?**
- Check server logs: `pm2 logs dictionary-app`
- Check browser console for frontend errors
- Check database logs: `/var/log/postgresql/`
- Check Nginx logs: `/var/log/nginx/error.log`

