# PRD Composition Guide - How to Write a Product Requirements Document
# PRD 编写指南 - 如何编写产品需求文档

## Introduction / 介绍

This guide analyzes the structure of `PRD_ECS_WITH_LOGIN.md` and teaches you how to compose a comprehensive Product Requirements Document (PRD). A PRD is a blueprint that bridges the gap between business goals and technical implementation.

**本指南分析 `PRD_ECS_WITH_LOGIN.md` 的结构，并教你如何编写全面的产品需求文档（PRD）。PRD 是连接业务目标和技术实现的蓝图。**

---

## What is a PRD? / 什么是 PRD？

A **Product Requirements Document (PRD)** is a comprehensive document that:
- Defines **WHAT** to build (features, functionality)
- Explains **WHY** to build it (business goals, user needs)
- Describes **HOW** to build it (technical architecture, implementation)
- Specifies **WHEN** to build it (timeline, milestones)
- Identifies **WHO** is involved (stakeholders, users)

**产品需求文档（PRD）是一份全面的文档，它：**
- 定义**构建什么**（功能、特性）
- 解释**为什么构建**（业务目标、用户需求）
- 描述**如何构建**（技术架构、实现）
- 规定**何时构建**（时间线、里程碑）
- 确定**涉及人员**（利益相关者、用户）

---

## Document Structure Analysis / 文档结构分析

Based on `PRD_ECS_WITH_LOGIN.md`, a well-structured PRD contains these sections:

### 1. Document Metadata / 文档元数据
**Purpose:** Provides context and version control

**Contains:**
- Version number
- Last updated date
- Document status
- Target deployment/platform
- Document type

**Example from your PRD:**
```markdown
**Version:** 4.0
**Last Updated:** 2024
**Deployment Target:** Aliyun ECS
**Status:** Complete PRD + Technical Guide
```

**Why it matters:** Helps track document evolution and ensures everyone uses the latest version.

---

### 2. Product Overview / 产品概述
**Purpose:** High-level product description and context

**Contains:**
- Product name and version
- Brief description
- Key changes from previous versions
- Business context and objectives
- Value proposition
- Target market
- Competitive positioning

**How it works:**
- Sets the stage for everything that follows
- Aligns stakeholders on product vision
- Provides business justification

**Technical Note:** This section is **non-technical** but critical for understanding the "why" behind technical decisions.

---

### 3. Product Management Sections / 产品管理部分

#### 3.1 User Personas / 用户画像
**Purpose:** Define target users and their needs

**Structure:**
- Persona name, age, occupation
- Goals and pain points
- Technology comfort level
- User journey maps

**How it works:**
- Guides feature prioritization
- Informs UX/UI design decisions
- Helps developers understand user context

**Technical Impact:** Influences authentication requirements, device support, performance targets.

---

#### 3.2 Success Metrics & KPIs / 成功指标和KPI
**Purpose:** Define measurable success criteria

**Structure:**
- North Star Metric (primary goal)
- Acquisition metrics (new users)
- Activation metrics (first value)
- Engagement metrics (usage)
- Retention metrics (returning users)

**How it works technically:**
```javascript
// Example: Tracking user activation
// When user completes first lookup:
analytics.track('user_activated', {
  userId: user.id,
  timestamp: Date.now(),
  timeToActivation: timeSinceRegistration
});

// Calculate activation rate:
const activationRate = activatedUsers / totalRegisteredUsers;
```

**Technical Implementation:**
- Requires analytics tracking code
- Database queries for metrics calculation
- Dashboard for visualization
- API endpoints for metric retrieval

---

#### 3.3 Feature Prioritization / 功能优先级
**Purpose:** Determine what to build first

**Framework Used:** RICE (Reach × Impact × Confidence / Effort)

**How it works:**
```
RICE Score = (Reach × Impact × Confidence) / Effort

Example:
- Reach: 80% of users
- Impact: 3 (High)
- Confidence: 85%
- Effort: 6 person-weeks

RICE = (80 × 3 × 85) / 6 = 3,400
```

**Technical Impact:**
- Determines development order
- Affects database schema design
- Influences API endpoint priority
- Shapes deployment timeline

---

#### 3.4 User Experience Flows / 用户体验流程
**Purpose:** Map user interactions step-by-step

**Structure:**
```
1. User action
   ↓
2. System response
   ↓
3. User decision point
   ↓
4. Outcome
```

**Technical Translation:**
Each flow step corresponds to:
- **Frontend component** (UI element)
- **API endpoint** (backend processing)
- **Database operation** (data storage/retrieval)
- **State management** (application state)

**Example Flow → Technical Implementation:**

```
User Flow: "Save word to notebook"
↓
Technical Implementation:
1. Frontend: onClick handler on "Save" button
2. API Call: POST /api/notebook
3. Backend: Validate user session
4. Database: INSERT INTO notebook_entries
5. Response: Return saved entry
6. Frontend: Update UI state
```

---

#### 3.5 Acceptance Criteria / 验收标准
**Purpose:** Define "done" criteria for each feature

**Format:** Given-When-Then (Behavior-Driven Development)

**Structure:**
```
Given [context]
When [action]
Then [expected outcome]
```

**Technical Example:**
```
Given an authenticated user
When they look up a word
Then they should:
- ✅ See result within 3 seconds
- ✅ See definition in both languages
- ✅ Be able to save to notebook
```

**How it translates to code:**
```typescript
// Test case based on acceptance criteria
describe('Word Lookup', () => {
  it('should return result within 3 seconds', async () => {
    const startTime = Date.now();
    const result = await lookupWord('hello', 'en', 'zh');
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(3000);
    expect(result.definition).toBeDefined();
    expect(result.definitionTarget).toBeDefined();
  });
});
```

---

### 4. Technical Architecture / 技术架构

#### 4.1 Technology Stack / 技术栈
**Purpose:** Define tools and frameworks

**Structure:**
- Frontend technologies
- Backend technologies
- Database
- Third-party services
- Deployment infrastructure

**How it works:**
Each technology choice has implications:

**Example: Next.js (Frontend Framework)**
- **Why chosen:** Server-side rendering, API routes, TypeScript support
- **Technical impact:**
  - File structure: `/app` directory
  - Routing: File-based routing
  - API: Built-in API routes (no separate backend needed)
  - Performance: Automatic code splitting

**Example: PostgreSQL (Database)**
- **Why chosen:** Relational data, ACID compliance, scalability
- **Technical impact:**
  - Schema design: Tables with relationships
  - Queries: SQL for complex joins
  - Migrations: Version-controlled schema changes
  - Connection: Connection pooling required

---

#### 4.2 Database Schema / 数据库架构
**Purpose:** Define data structure and relationships

**Format:** Prisma Schema (or SQL)

**How it works technically:**

```prisma
// Example from your PRD
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // Bcrypt hashed
  notebookEntries NotebookEntry[]
}

model NotebookEntry {
  id          String   @id @default(cuid())
  userId      String
  word        String
  user        User     @relation(fields: [userId], references: [id])
}
```

**Technical Explanation:**
1. **Primary Key (`@id`)**: Unique identifier for each record
2. **Foreign Key (`@relation`)**: Links NotebookEntry to User
3. **Cascade Delete**: When user deleted, entries automatically deleted
4. **Indexes (`@@index`)**: Speed up queries on frequently searched fields

**How it translates to SQL:**
```sql
-- Generated SQL (simplified)
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL
);

CREATE TABLE notebook_entries (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  word VARCHAR NOT NULL
);

CREATE INDEX idx_notebook_user ON notebook_entries(user_id);
```

---

#### 4.3 API Endpoints / API 端点
**Purpose:** Define communication interface between frontend and backend

**Structure:**
- HTTP method (GET, POST, PUT, DELETE)
- Endpoint path
- Request format
- Response format
- Authentication requirements
- Rate limits

**How it works technically:**

```typescript
// Example: POST /api/lookup
// Frontend code:
const response = await fetch('/api/lookup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `next-auth.session-token=${sessionToken}`
  },
  body: JSON.stringify({
    word: 'hello',
    targetLanguage: 'en',
    nativeLanguage: 'zh'
  })
});

// Backend code (Next.js API Route):
// app/api/lookup/route.ts
export async function POST(request: Request) {
  // 1. Authenticate user
  const session = await getServerSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  
  // 2. Parse request body
  const { word, targetLanguage, nativeLanguage } = await request.json();
  
  // 3. Validate input
  if (!word || !targetLanguage || !nativeLanguage) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  // 4. Call AI service
  const definition = await generateDefinition(word, targetLanguage, nativeLanguage);
  
  // 5. Return response
  return Response.json({
    word,
    definition,
    definitionTarget: definition.target,
    imageUrl: definition.image,
    examples: definition.examples
  });
}
```

**Technical Flow:**
```
User Action → Frontend → API Endpoint → Business Logic → Database/AI Service → Response → Frontend → UI Update
```

---

### 5. Deployment Architecture / 部署架构

#### 5.1 Server Configuration / 服务器配置
**Purpose:** Define infrastructure requirements

**Components:**
- ECS Instance (virtual server)
- Database (PostgreSQL)
- Reverse Proxy (Nginx)
- Process Manager (PM2)
- SSL Certificate (Let's Encrypt)

**How it works technically:**

```
Internet Request
    ↓
Nginx (Port 80/443)
    ↓ (reverse proxy)
Next.js App (Port 3000)
    ↓
PostgreSQL (Port 5432, localhost only)
```

**Technical Explanation:**

**Nginx (Reverse Proxy):**
```nginx
# Nginx configuration
server {
    listen 80;
    location / {
        proxy_pass http://localhost:3000;  # Forward to Next.js
        proxy_set_header Host $host;
    }
}
```
- **Why needed:** Next.js runs on port 3000, but web traffic comes on port 80
- **What it does:** Receives requests on port 80, forwards to port 3000
- **Benefits:** SSL termination, load balancing, static file serving

**PM2 (Process Manager):**
```bash
pm2 start npm --name "dictionary-app" -- start
```
- **Why needed:** Keeps app running if it crashes, restarts on server reboot
- **What it does:** Monitors Node.js process, restarts automatically
- **Benefits:** Zero-downtime deployments, log management

**PostgreSQL (Database):**
- **Why on localhost:** Security - database not exposed to internet
- **Connection:** App connects via `DATABASE_URL` environment variable
- **Access:** Only from same server (localhost:5432)

---

#### 5.2 Environment Variables / 环境变量
**Purpose:** Store configuration and secrets

**How it works technically:**

```bash
# .env file (on server)
DATABASE_URL="postgresql://user:password@localhost:5432/dictionary"
NEXTAUTH_SECRET="random-32-character-string"
SILICONFLOW_API_KEY="sk-xxxxxxxxxxxxx"
```

**Technical Explanation:**
- **Why `.env` file:** Keeps secrets out of code repository
- **How it works:** Node.js reads `.env` file at startup
- **Security:** `.env` file is in `.gitignore` (not committed to Git)

**In Code:**
```typescript
// Next.js automatically loads .env
const apiKey = process.env.SILICONFLOW_API_KEY;
// process.env is populated from .env file
```

---

### 6. Step-by-Step Deployment / 逐步部署

**Purpose:** Provide executable instructions

**Structure:**
1. Prerequisites (what you need)
2. Installation steps (commands to run)
3. Configuration (settings to change)
4. Verification (how to test)

**Technical Example:**

```bash
# Step: Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18

# What this does:
# 1. Downloads nvm (Node Version Manager) installer script
# 2. Executes script to install nvm
# 3. Reloads shell configuration
# 4. Installs Node.js version 18
```

**Technical Breakdown:**
- **`curl`**: Downloads file from internet
- **`| bash`**: Pipes downloaded script to bash interpreter
- **`source ~/.bashrc`**: Reloads shell configuration
- **`nvm install 18`**: Installs Node.js version 18

---

## How PRD Sections Work Together / PRD 各部分如何协同工作

### Example: Adding a New Feature / 示例：添加新功能

**Scenario:** Add "Learning Progress Tracking" feature

**1. Product Management Section:**
- **User Persona:** "Li Wei wants to track learning progress"
- **Success Metric:** "80% of users view progress dashboard weekly"
- **Feature Priority:** RICE score = 20.40 (P1)
- **User Flow:** "User navigates to Progress page → sees dashboard"

**2. Technical Architecture:**
- **Database Schema:** New `LearningProgress` table
- **API Endpoint:** `GET /api/progress`
- **Component:** `ProgressDashboard.tsx`

**3. Implementation Flow:**
```
User clicks "Progress" button
    ↓
Frontend: Navigate to /progress
    ↓
Frontend: Fetch GET /api/progress
    ↓
Backend: Query database for user's progress
    ↓
Database: SELECT * FROM learning_progress WHERE user_id = ?
    ↓
Backend: Calculate statistics, format response
    ↓
Frontend: Render ProgressDashboard component with data
    ↓
User sees progress dashboard
```

**4. Acceptance Criteria:**
```
Given a user has studied words
When they view progress dashboard
Then they should see accurate statistics
```

**5. Deployment:**
- Database migration: Add `learning_progress` table
- Deploy new API endpoint
- Deploy new frontend component
- Test and verify

---

## Key Principles / 关键原则

### 1. Traceability / 可追溯性
Every feature should be traceable from:
- Business objective → User need → Feature → Technical implementation

### 2. Completeness / 完整性
PRD should answer:
- **What?** (Features)
- **Why?** (Business goals)
- **How?** (Technical approach)
- **When?** (Timeline)
- **Who?** (Stakeholders)

### 3. Clarity / 清晰性
- Use simple language for non-technical sections
- Use technical language where appropriate
- Provide examples and diagrams
- Include acceptance criteria

### 4. Maintainability / 可维护性
- Version control
- Regular updates
- Clear change history
- Document status tracking

---

## Common Mistakes to Avoid / 常见错误避免

### ❌ Too Technical Too Early
**Bad:** Start with database schema
**Good:** Start with user needs and business goals

### ❌ Missing User Context
**Bad:** "Add progress tracking"
**Good:** "Li Wei needs to see his learning progress to stay motivated"

### ❌ Vague Acceptance Criteria
**Bad:** "Progress tracking should work"
**Good:** "Given a user has studied 10 words, when they view progress dashboard, then they should see '10 words learned'"

### ❌ No Prioritization
**Bad:** All features treated equally
**Good:** Use RICE framework to prioritize

### ❌ Missing Technical Details
**Bad:** "Use a database"
**Good:** "Use PostgreSQL 14+ with Prisma ORM, connection pooling enabled"

---

## Quick Reference: PRD Checklist / 快速参考：PRD 检查清单

### Product Management / 产品管理
- [ ] Business objectives defined
- [ ] User personas created
- [ ] Success metrics identified
- [ ] Features prioritized
- [ ] User flows mapped
- [ ] Acceptance criteria written

### Technical / 技术
- [ ] Technology stack chosen
- [ ] Database schema designed
- [ ] API endpoints defined
- [ ] Architecture diagram created
- [ ] Deployment plan documented

### Operational / 运营
- [ ] Monitoring plan defined
- [ ] Backup strategy documented
- [ ] Security considerations listed
- [ ] Troubleshooting guide included

---

## Conclusion / 结论

A well-written PRD serves as:
1. **Communication tool** - Aligns team on goals and approach
2. **Planning tool** - Guides development timeline and resources
3. **Reference document** - Answers questions during development
4. **Quality assurance** - Defines what "done" means

**Remember:** A PRD is a living document. Update it as you learn more about users, technology, and business needs.

---

**Next Steps:**
1. Review `PRD_ECS_WITH_LOGIN.md` section by section
2. Identify which sections apply to your project
3. Start with product management sections (business context)
4. Then move to technical sections (architecture)
5. Finally, add operational sections (deployment, monitoring)

**Questions to ask yourself:**
- Who is my target user?
- What problem am I solving?
- How will I measure success?
- What technology fits my needs?
- How will I deploy and maintain this?

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Based on:** PRD_ECS_WITH_LOGIN.md v4.0
