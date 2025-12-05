# Product Requirements Document (PRD) - ECS Deployment with Authentication
  # 产品需求文档 - ECS部署与用户认证

## AI Dictionary - Language Learning Application with User Authentication
## AI 词典 - 带用户认证的语言学习应用

---

## Document Information / 文档信息

**Version:** 4.1  
**Last Updated:** 2024  
**Deployment Target:** Aliyun ECS (Elastic Compute Service) / Vercel  
**Database:** PostgreSQL (on ECS or Vercel Postgres)  
**Authentication:** NextAuth.js v5 (Auth.js) with Email/Password  
**Status:** Complete Product Requirements Document with Deployment Guide  
**Document Type:** PRD (Product Requirements Document) + Technical Deployment Guide

---

## 1. Product Overview / 产品概述

### English
**Product Name:** AI Dictionary  
**Version:** 3.0  
**Deployment:** Aliyun ECS with PostgreSQL Database

AI Dictionary is an intelligent, AI-powered language learning tool that helps users learn new languages through interactive definitions, visual aids, audio pronunciation, and study tools. This version includes user authentication, persistent database storage, and cloud deployment on Aliyun ECS.

**Key Changes from v2.0:**
- ✅ User authentication (login/register)
- ✅ PostgreSQL database for persistent storage
- ✅ Multi-user support (data isolated per user)
- ✅ ECS deployment architecture
- ✅ Production-ready configuration

### 中文
**产品名称:** AI 词典  
**版本:** 3.0  
**部署:** 阿里云 ECS 与 PostgreSQL 数据库

AI 词典是一款智能的、AI 驱动的语言学习工具，通过交互式定义、视觉辅助、音频发音和学习工具帮助用户学习新语言。此版本包括用户认证、持久数据库存储和阿里云 ECS 云部署。

**与 v2.0 的主要变化:**
- ✅ 用户认证（登录/注册）
- ✅ PostgreSQL 数据库用于持久存储
- ✅ 多用户支持（数据按用户隔离）
- ✅ ECS 部署架构
- ✅ 生产就绪配置

---

## 1.1 Business Context & Objectives / 业务背景和目标

### Problem Statement / 问题陈述

**English:**
Traditional language learning tools are fragmented, expensive, and lack personalization. Learners struggle with:
- Memorizing vocabulary without context
- Understanding cultural nuances and usage
- Finding relevant examples and visual aids
- Tracking progress across devices
- High costs of premium language learning apps

**中文:**
传统语言学习工具分散、昂贵且缺乏个性化。学习者面临以下困难：
- 在没有上下文的情况下记忆词汇
- 理解文化背景和使用场景
- 找到相关的例句和视觉辅助
- 跨设备跟踪学习进度
- 高级语言学习应用的高成本

### Value Proposition / 价值主张

**English:**
AI Dictionary provides a free, intelligent, and personalized language learning experience that combines:
- **Contextual Learning:** AI-powered definitions with cultural context
- **Multi-modal Learning:** Visual, audio, and textual learning aids
- **Personal Progress:** Persistent notebook and study tools
- **Accessibility:** Free to use, no subscription required
- **Cross-device Sync:** Access your learning data anywhere

**中文:**
AI 词典提供免费、智能和个性化的语言学习体验，结合：
- **情境学习：** 带文化背景的 AI 驱动定义
- **多模态学习：** 视觉、音频和文本学习辅助
- **个人进度：** 持久笔记本和学习工具
- **可访问性：** 免费使用，无需订阅
- **跨设备同步：** 随时随地访问学习数据

### Business Objectives / 业务目标

**Short-term (3 months):**
- Acquire 1,000 registered users
- Achieve 40% Day-7 retention rate
- Maintain 95%+ uptime
- Average 5+ lookups per active user per week

**Medium-term (6 months):**
- Reach 10,000 registered users
- Achieve 50% Day-30 retention rate
- Implement freemium model (optional premium features)
- Expand to 20+ languages

**Long-term (12 months):**
- Build sustainable user base of 50,000+ users
- Establish product-market fit
- Explore monetization opportunities
- Consider mobile app development

### Target Market / 目标市场

**Primary Market:**
- Self-directed language learners (ages 18-45)
- Students learning foreign languages
- Professionals needing language skills for work
- Language enthusiasts and polyglots

**Geographic Focus:**
- Initially: Chinese-speaking markets (China, Taiwan, Singapore)
- Secondary: English-speaking markets
- Future: Global expansion

### Competitive Positioning / 竞争定位

| Feature | AI Dictionary | Duolingo | Google Translate | Anki |
|---------|--------------|----------|------------------|------|
| **Price** | Free | Freemium | Free | Free/Paid |
| **AI Context** | ✅ Rich | ❌ Basic | ❌ None | ❌ None |
| **Visual Learning** | ✅ AI Images | ⚠️ Limited | ❌ None | ⚠️ Manual |
| **Personal Notebook** | ✅ Built-in | ⚠️ Limited | ❌ None | ✅ Yes |
| **Story Generation** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Offline** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |

**Key Differentiators:**
1. AI-powered contextual definitions (not just translations)
2. Integrated visual and audio learning
3. Story generation for memorization
4. Free and accessible
5. Cross-device synchronization

---

## 1.2 User Personas / 用户画像

### Primary Persona: "The Self-Learner" / 主要画像："自主学习者"

**Name:** Li Wei (李伟)  
**Age:** 28  
**Occupation:** Software Engineer  
**Location:** Beijing, China

**Goals:**
- Learn English to advance career
- Improve vocabulary for technical communication
- Study during commute and breaks
- Track learning progress

**Pain Points:**
- Traditional dictionaries lack context
- Forgets words quickly without practice
- No time for structured courses
- Existing apps are expensive or too gamified

**Technology Comfort:** High  
**Device Usage:** Mobile (60%), Desktop (40%)  
**Learning Style:** Visual + Contextual

**User Journey:**
1. Discovers app through search/recommendation
2. Registers quickly (email/password)
3. Looks up first word during work break
4. Saves interesting words to notebook
5. Uses study mode during commute
6. Generates story with saved words
7. Returns daily to review and learn new words

### Secondary Persona: "The Student" / 次要画像："学生"

**Name:** Maria Garcia  
**Age:** 22  
**Occupation:** University Student  
**Location:** Madrid, Spain

**Goals:**
- Pass language proficiency exams
- Expand vocabulary for academic writing
- Understand cultural context
- Study efficiently with limited time

**Pain Points:**
- Needs examples and usage notes
- Struggles with memorization
- Can't afford premium apps
- Needs to study on multiple devices

**Technology Comfort:** Medium-High  
**Device Usage:** Mobile (70%), Desktop (30%)  
**Learning Style:** Structured + Repetitive

### Tertiary Persona: "The Language Enthusiast" / 第三画像："语言爱好者"

**Name:** David Chen  
**Age:** 35  
**Occupation:** Marketing Manager  
**Location:** Singapore

**Goals:**
- Learn multiple languages (Japanese, Korean)
- Understand cultural nuances
- Build vocabulary for travel
- Share learning progress

**Pain Points:**
- Needs context beyond translation
- Wants to track multiple languages
- Needs offline access (future)
- Wants to export data

**Technology Comfort:** High  
**Device Usage:** Mobile (80%), Desktop (20%)  
**Learning Style:** Exploratory + Social

---

## 1.3 Success Metrics & KPIs / 成功指标和KPI

### North Star Metric / 北极星指标

**Primary Metric:** Weekly Active Learners (WAL)
- Definition: Users who perform at least 3 lookups or study sessions per week
- Target: 60% of registered users become WAL within first month

### Key Performance Indicators / 关键绩效指标

#### Acquisition Metrics / 获客指标
- **New User Registrations:** Target 50+ per day
- **Registration Conversion Rate:** Target 70%+ (visitors → registered)
- **Traffic Sources:** Track organic, referral, direct
- **Cost per Acquisition (CPA):** Monitor if paid marketing

#### Activation Metrics / 激活指标
- **First Lookup Completion:** Target 80%+ (registered users who complete first lookup)
- **Time to First Value:** Target < 2 minutes from registration
- **Onboarding Completion:** Target 90%+ complete first save to notebook

#### Engagement Metrics / 参与度指标
- **Daily Active Users (DAU):** Target 30%+ of registered users
- **Weekly Active Users (WAU):** Target 60%+ of registered users
- **Monthly Active Users (MAU):** Target 80%+ of registered users
- **Lookups per User per Week:** Target 5+ lookups
- **Notebook Entries per User:** Target 20+ entries
- **Study Sessions per Week:** Target 2+ sessions

#### Retention Metrics / 留存指标
- **Day-1 Retention:** Target 50%+
- **Day-7 Retention:** Target 40%+
- **Day-30 Retention:** Target 30%+
- **Churn Rate:** Target < 5% monthly

#### Feature Adoption / 功能采用
- **Notebook Save Rate:** Target 40%+ of lookups saved
- **Study Mode Usage:** Target 30%+ of users try study mode
- **Story Generation Usage:** Target 20%+ of users generate stories
- **Multi-language Usage:** Target 25%+ use 2+ languages

#### Quality Metrics / 质量指标
- **API Response Time:** Target < 3 seconds for lookup
- **Error Rate:** Target < 1%
- **Uptime:** Target 99.5%+
- **User Satisfaction:** Target 4.0+ stars (if app store)

### Analytics Requirements / 分析要求

**Required Tracking:**
- User registration and login events
- Word lookup events (word, languages, success/failure)
- Notebook save/delete events
- Study mode sessions (cards viewed, time spent)
- Story generation events
- Error events and types
- Page views and navigation paths
- API response times and errors

**Tools:**
- Google Analytics 4 (or similar)
- Custom event tracking in application
- Database analytics queries
- Server-side logging and monitoring

---

## 1.4 Feature Prioritization / 功能优先级

### MVP Features (Must Have - Phase 1) / MVP功能（必须有 - 第一阶段）

**Core Value Delivery:**
1. ✅ User Authentication (Login/Register)
2. ✅ Word Lookup with AI definitions
3. ✅ Basic Notebook (Save/View/Delete)
4. ✅ Study Mode (Flashcards)
5. ✅ Multi-language support (10 languages)
6. ✅ Image and audio integration

**Timeline:** 4-6 weeks  
**Success Criteria:** Users can register, look up words, save to notebook, and study

### Phase 2 Features (Should Have) / 第二阶段功能（应该有）

**Enhanced Experience:**
1. ✅ Story Generation
2. ✅ **Batch Upload** - Upload words from text, markdown, CSV, or Excel files
3. ✅ **Tagging System** - Organize words with tags (individual and batch tagging)
4. ✅ **First Learned Date Tracking** - Track when words were first learned
5. Notebook search and filtering
6. Progress tracking (basic stats)
7. Export notebook data
8. Improved error handling and user feedback
9. Performance optimizations

**Timeline:** 2-3 weeks after MVP  
**Success Criteria:** Users can generate stories, batch upload words, tag entries, see learning history, search notebook, see basic progress

### Phase 3 Features (Nice to Have) / 第三阶段功能（最好有）

**Advanced Features:**
1. Email verification
2. Password reset
3. Social login (Google, GitHub, WeChat), cellphone number login
4. **Learning Process Tracking** - Comprehensive progress tracking, statistics, and learning analytics
5. **Quiz Functions** - Interactive quizzes to test vocabulary knowledge and retention
6. Spaced repetition algorithm
7. Mobile app (React Native)
8. Offline mode
9. Collaborative features (share notebooks)

**Timeline:** 3-6 months after Phase 2  
**Success Criteria:** Enhanced user experience and retention

### Prioritization Framework / 优先级框架

Using **RICE Framework** (Reach × Impact × Confidence / Effort):

| Feature | Reach | Impact | Confidence | Effort | RICE Score | Priority |
|---------|-------|--------|------------|--------|------------|----------|
| User Auth | 100% | 3 | 90% | 8 | 33.75 | P0 |
| Word Lookup | 100% | 3 | 90% | 10 | 27.00 | P0 |
| Notebook | 80% | 3 | 85% | 6 | 34.00 | P0 |
| Study Mode | 60% | 3 | 80% | 8 | 18.00 | P1 |
| Story Gen | 40% | 2 | 70% | 6 | 9.33 | P2 |
| Email Verify | 100% | 1 | 90% | 4 | 22.50 | P1 |
| Password Reset | 30% | 2 | 90% | 4 | 13.50 | P2 |
| Learning Tracking | 80% | 3 | 85% | 10 | 20.40 | P1 |
| Quiz Functions | 70% | 3 | 80% | 12 | 14.00 | P1 |
| Batch Upload | 60% | 3 | 90% | 8 | 20.25 | P1 |
| Tagging System | 80% | 2 | 90% | 4 | 36.00 | P1 |
| First Learned Date | 100% | 2 | 95% | 2 | 95.00 | P0 |

**Legend:**
- Reach: % of users affected (0-100%)
- Impact: 0=No impact, 1=Low, 2=Medium, 3=High
- Confidence: % confidence in estimates (0-100%)
- Effort: Person-weeks
- RICE Score: (Reach × Impact × Confidence) / Effort

---

## 1.5 User Experience Flows / 用户体验流程

### Key User Flows / 关键用户流程

#### Flow 1: First-Time User Onboarding / 首次用户引导流程

```
1. User lands on homepage
   ↓
2. Sees "Get Started" or "Sign Up" button
   ↓
3. Registration form (email, password, optional name)
   ↓
4. Email validation and password strength check
   ↓
5. Account created → Auto-login
   ↓
6. Welcome screen with quick tutorial (optional skip)
   ↓
7. Prompted to do first lookup
   ↓
8. First lookup result shown
   ↓
9. Prompted to save to notebook
   ↓
10. Success! User sees notebook with first entry
```

**Success Criteria:**
- User completes registration in < 2 minutes
- User completes first lookup within 5 minutes
- 80%+ of users save first word to notebook

#### Flow 2: Word Lookup Flow / 单词查询流程

```
1. User on main page (authenticated)
   ↓
2. Selects target language (e.g., English)
   ↓
3. Selects native language (e.g., Chinese)
   ↓
4. Enters word/phrase in search box
   ↓
5. Clicks "Look Up" or presses Enter
   ↓
6. Loading state shown (spinner + "Looking up...")
   ↓
7. Result displayed:
   - Definition (target + native)
   - Image
   - 2 Example sentences
   - Usage notes
   - Audio player
   ↓
8. User can:
   - Play audio
   - Save to notebook
   - Look up another word
```

**Error Handling:**
- Word not found → Show helpful message + suggestions
- API timeout → Retry button + fallback message
- Network error → Show offline message + retry
- Rate limit → Show message + countdown timer

#### Flow 3: Notebook Save Flow / 笔记本保存流程

```
1. User views lookup result
   ↓
2. Clicks "Save to Notebook" button
   ↓
3. If word already saved:
   - Show "Already Saved" indicator
   - Option to "Update Entry"
   ↓
4. If new word:
   - Save to database
   - Show success message
   - Button changes to "Saved ✓"
   ↓
5. User can navigate to Notebook page
   ↓
6. See all saved words in list/grid
```

**Edge Cases:**
- Duplicate word detection
- Update existing entry
- Save fails → Show error + retry option

#### Flow 4: Study Mode Flow / 学习模式流程

```
1. User navigates to Study page
   ↓
2. If notebook empty:
   - Show empty state
   - Prompt to save words first
   ↓
3. If notebook has entries:
   - Load flashcards from notebook
   - Show first card (word + image)
   ↓
4. User can:
   - Click card to flip (see definition)
   - Click audio to hear pronunciation
   - Click Next/Previous
   - Click Shuffle
   - Toggle translation visibility
   ↓
5. Progress indicator shows: "Card 3 of 15"
```

**Success Criteria:**
- Cards load in < 2 seconds
- Smooth flip animation
- Audio plays without delay
- Progress accurately tracked

---

## 1.6 Acceptance Criteria / 验收标准

### Feature: User Registration / 功能：用户注册

**Given** a new user visits the registration page  
**When** they enter valid email and password  
**Then** they should:
- ✅ Receive confirmation that account is created
- ✅ Be automatically logged in
- ✅ Be redirected to main lookup page
- ✅ See welcome message or tutorial

**Given** a user enters invalid email  
**When** they try to register  
**Then** they should:
- ✅ See validation error message
- ✅ Not be able to submit form
- ✅ Error message is clear and actionable

**Given** a user enters weak password  
**When** they try to register  
**Then** they should:
- ✅ See password strength indicator
- ✅ See requirements (min 8 chars, etc.)
- ✅ Not be able to submit until requirements met

**Edge Cases:**
- Email already exists → Show "Email already registered" + login link
- Network error → Show retry option
- Server error → Show friendly error message

### Feature: Word Lookup / 功能：单词查询

**Given** an authenticated user  
**When** they look up a word  
**Then** they should:
- ✅ See result within 3 seconds
- ✅ See definition in both languages
- ✅ See at least one example sentence
- ✅ See image (if available)
- ✅ Be able to play audio
- ✅ Be able to save to notebook

**Given** a user looks up non-existent word  
**When** API returns no results  
**Then** they should:
- ✅ See helpful message: "Word not found. Try checking spelling."
- ✅ See suggestions (if available)
- ✅ Be able to try again

**Performance:**
- API response time < 3 seconds (95th percentile)
- Image loads within 2 seconds
- Audio ready to play within 1 second

### Feature: Notebook / 功能：笔记本

**Given** a user saves a word to notebook  
**When** they navigate to notebook page  
**Then** they should:
- ✅ See saved word in list
- ✅ See word, definition, and image
- ✅ Be able to delete entry
- ✅ See entries sorted by date (newest first)

**Given** a user tries to save duplicate word  
**When** word already exists in notebook  
**Then** they should:
- ✅ See "Already Saved" indicator
- ✅ Have option to update/replace entry
- ✅ Not create duplicate entry

**Data Integrity:**
- All entries persist after page refresh
- Entries sync across devices (after login)
- Deleted entries are permanently removed

### Feature: Study Mode / 功能：学习模式

**Given** a user has saved words in notebook  
**When** they open study mode  
**Then** they should:
- ✅ See flashcards from their notebook
- ✅ Be able to flip cards smoothly
- ✅ See progress indicator
- ✅ Navigate between cards
- ✅ Play audio without flipping card

**Given** a user has no saved words  
**When** they open study mode  
**Then** they should:
- ✅ See empty state message
- ✅ See prompt to save words first
- ✅ See link to main lookup page

**UX Requirements:**
- Card flip animation smooth (60fps)
- Audio plays immediately on click
- Progress updates in real-time
- Shuffle works correctly

### Feature: Learning Progress Tracking / 功能：学习进度跟踪

**Given** a user has studied words  
**When** they view their progress dashboard  
**Then** they should:
- ✅ See accurate total words learned
- ✅ See current learning streak
- ✅ See daily/weekly/monthly statistics
- ✅ See visual charts (line, bar, pie)
- ✅ See activity timeline
- ✅ Be able to filter by date range
- ✅ Be able to export data

**Given** a user studies a word  
**When** they view word progress  
**Then** they should:
- ✅ See mastery level updated
- ✅ See study count incremented
- ✅ See last studied timestamp
- ✅ See next review date (if spaced repetition enabled)

**Performance:**
- Dashboard loads in < 2 seconds
- Charts render in < 1 second
- Data updates in real-time
- Export generates in < 5 seconds

### Feature: Quiz Functions / 功能：测验功能

**Given** a user wants to take a quiz  
**When** they configure and start quiz  
**Then** they should:
- ✅ See questions one at a time
- ✅ See progress indicator (Question X of Y)
- ✅ Be able to answer questions
- ✅ Receive immediate feedback
- ✅ See final score and results
- ✅ See words that need review

**Given** a user answers a quiz question  
**When** they submit answer  
**Then** they should:
- ✅ See immediate feedback (correct/incorrect)
- ✅ See correct answer if wrong
- ✅ See explanation if available
- ✅ Have answer saved to database

**Given** a user completes a quiz  
**When** they view results  
**Then** they should:
- ✅ See score percentage
- ✅ See grade (A, B, C, D, F)
- ✅ See breakdown of correct/incorrect
- ✅ See recommendations
- ✅ Be able to review incorrect answers
- ✅ Be able to retake quiz

**Quiz Types Validation:**
- Multiple choice: 4 options, 1 correct
- Fill in blank: Sentence with blank, correct word
- Matching: Words matched with definitions
- Spelling: Audio/definition provided, user types word
- Translation: Word in one language, translate to another

**Performance:**
- Quiz starts in < 2 seconds
- Questions load instantly
- Answer submission < 500ms
- Results calculated in < 1 second

---

## 1.7 Risk Assessment / 风险评估

### Product Risks / 产品风险

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| **Low user adoption** | Medium | High | Early user testing, marketing, referral program |
| **High churn rate** | Medium | High | Improve onboarding, add engagement features, email reminders |
| **API dependency failure** | Low | High | Fallback APIs, caching, graceful degradation |
| **Data privacy concerns** | Low | Medium | Clear privacy policy, GDPR compliance, data encryption |
| **Competitor launches similar product** | Medium | Medium | Focus on unique features, fast iteration, user loyalty |

### Technical Risks / 技术风险

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| **Database performance issues** | Medium | High | Connection pooling, indexing, monitoring |
| **API rate limits exceeded** | Medium | Medium | Rate limiting, caching, queue system |
| **Security vulnerabilities** | Low | High | Security audits, regular updates, penetration testing |
| **Scalability issues** | Medium | Medium | Load testing, horizontal scaling plan, CDN |
| **Data loss** | Low | High | Automated backups, disaster recovery plan |

### Business Risks / 业务风险

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| **Cost overruns (API costs)** | Medium | Medium | Monitor usage, implement limits, optimize calls |
| **Timeline delays** | Medium | Low | Agile development, MVP focus, regular check-ins |
| **Resource constraints** | Low | Medium | Prioritize features, consider outsourcing non-core tasks |

### Contingency Plans / 应急计划

**If user adoption is low:**
- Pivot messaging and value proposition
- Add viral/referral features
- Consider paid marketing (if budget allows)
- Gather user feedback and iterate

**If API costs are too high:**
- Implement stricter rate limiting
- Optimize API calls (caching, batching)
- Consider alternative providers
- Introduce freemium model earlier

**If security breach occurs:**
- Immediate incident response plan
- User notification process
- Data breach protocol
- Security audit and fixes

---

## 1.8 Go-to-Market Strategy / 上市策略

### Launch Plan / 发布计划

**Phase 1: Soft Launch (Week 1-2)**
- Deploy to production
- Invite 50-100 beta users
- Gather feedback
- Fix critical bugs
- Monitor performance

**Phase 2: Public Launch (Week 3-4)**
- Open registration to public
- Announce on social media
- Submit to product directories
- Reach out to language learning communities
- Monitor and respond to feedback

**Phase 3: Growth (Month 2+)**
- Implement referral program
- Content marketing (blog posts, tutorials)
- Community engagement
- Feature announcements
- User testimonials

### Marketing Channels / 营销渠道

**Organic Channels:**
1. **SEO:** Optimize for "language learning dictionary", "AI dictionary"
2. **Content Marketing:** Blog posts about language learning tips
3. **Social Media:** Twitter, Reddit (r/languagelearning), Facebook groups
4. **Product Hunt:** Launch on Product Hunt
5. **Community:** Engage in language learning forums

**Paid Channels (Future):**
- Google Ads (if budget allows)
- Social media ads (Facebook, Instagram)
- Influencer partnerships

### User Acquisition Strategy / 用户获取策略

**Initial Focus:**
- Target language learning communities
- Share on social media
- Word-of-mouth referrals
- Product directory listings

**Growth Tactics:**
- Referral program (invite friends, get benefits)
- Social sharing (share notebook entries, stories)
- SEO optimization
- Content partnerships

### Pricing Strategy / 定价策略

**Current (v3.0):** Free  
**Future Consideration:**
- **Free Tier:** Basic features (limited lookups per day)
- **Premium Tier:** Unlimited lookups, advanced features, priority support
- **Pricing:** $4.99/month or $49.99/year

**Note:** Pricing to be evaluated based on user feedback and market research.

---

## 1.9 Stakeholder Management / 利益相关者管理

### Key Stakeholders / 关键利益相关者

| Stakeholder | Role | Interest | Influence | Communication Frequency |
|------------|------|---------|-----------|------------------------|
| **Product Owner** | Decision maker | Product success, user satisfaction | High | Daily |
| **Development Team** | Builders | Technical feasibility, timeline | High | Daily |
| **End Users** | Customers | Features, usability, value | High | Weekly (feedback) |
| **Business Owner** | Sponsor | ROI, business metrics | Medium | Weekly |
| **Designer** | UX/UI | User experience, design quality | Medium | As needed |
| **QA Team** | Quality | Bug-free release, test coverage | Medium | Daily during sprints |

### Decision-Making Process / 决策流程

**Feature Decisions:**
1. Product Owner proposes feature
2. Team reviews (technical feasibility, effort)
3. User research/validation (if needed)
4. Prioritization using RICE framework
5. Approval from Business Owner (for major features)
6. Implementation

**Technical Decisions:**
1. Development team proposes solution
2. Technical review
3. Product Owner approves (if impacts users)
4. Implementation

### Communication Plan / 沟通计划

**Daily:**
- Standup meetings (development team)
- Slack/chat for quick questions

**Weekly:**
- Sprint planning
- Stakeholder updates (email/dashboard)
- User feedback review

**Monthly:**
- Product review meeting
- Metrics review
- Roadmap planning

**Ad-hoc:**
- Critical bug fixes
- Security issues
- Major feature launches

---

## 1.10 Timeline & Milestones / 时间线和里程碑

### Project Phases / 项目阶段

#### Phase 1: MVP Development (Weeks 1-6) / MVP开发（第1-6周）

**Week 1-2: Foundation**
- ✅ User authentication (register/login)
- ✅ Database setup and Prisma configuration
- ✅ Basic UI components

**Week 3-4: Core Features**
- ✅ Word lookup API integration
- ✅ Notebook CRUD operations
- ✅ Basic UI for lookup and notebook

**Week 5-6: Study Mode & Polish**
- ✅ Flashcard implementation
- ✅ Study mode UI
- ✅ Testing and bug fixes
- ✅ Deployment preparation

**Milestone 1:** MVP Deployed (End of Week 6)  
**Success Criteria:** Users can register, look up words, save to notebook, and study

#### Phase 2: Enhancement (Weeks 7-9) / 增强功能（第7-9周）

**Week 7: Story Generation**
- Story generation API
- Story UI component
- Integration with notebook

**Week 8: Improvements**
- Notebook search and filtering
- Progress tracking (basic)
- Error handling improvements
- Performance optimizations

**Week 9: Testing & Launch Prep**
- User testing
- Bug fixes
- Documentation
- Marketing materials

**Milestone 2:** Enhanced Version Launched (End of Week 9)  
**Success Criteria:** All Phase 2 features working, 100+ users registered

#### Phase 3: Growth & Optimization (Months 3-6) / 增长与优化（第3-6月）

**Months 3-4:**
- Email verification
- Password reset
- Advanced analytics
- User feedback integration

**Months 5-6:**
- Social login (if needed)
- Spaced repetition
- Mobile app planning
- Scaling infrastructure

**Milestone 3:** Growth Phase Complete (End of Month 6)  
**Success Criteria:** 1,000+ users, 40% Day-7 retention

### Critical Path / 关键路径

**Dependencies:**
1. Authentication → All other features
2. Database setup → Notebook and user data
3. Word lookup API → Core functionality
4. Study mode → Requires notebook data

**Risks to Timeline:**
- API integration delays
- Database performance issues
- Third-party service outages
- Scope creep

**Mitigation:**
- Buffer time in estimates (20%)
- Regular progress reviews
- MVP focus (avoid scope creep)
- Parallel work where possible

### Resource Requirements / 资源需求

**Development Team:**
- 1 Full-stack Developer (6 weeks full-time)
- 1 Designer (2 weeks, part-time)
- 1 QA Engineer (2 weeks, part-time)

**Infrastructure:**
- ECS instance (ongoing)
- Database (ongoing)
- API services (usage-based)

**Timeline Summary:**
- **MVP:** 6 weeks
- **Enhanced:** 3 weeks (total 9 weeks)
- **Growth Phase:** 3-6 months
- **Total to Production:** 9 weeks minimum

---

## Table of Contents / 目录

### Product Management Sections / 产品管理部分
1. [Product Overview](#1-product-overview--产品概述)
   - [Business Context & Objectives](#11-business-context--objectives--业务背景和目标)
   - [User Personas](#12-user-personas--用户画像)
   - [Success Metrics & KPIs](#13-success-metrics--kpis--成功指标和kpi)
   - [Feature Prioritization](#14-feature-prioritization--功能优先级)
   - [User Experience Flows](#15-user-experience-flows--用户体验流程)
   - [Acceptance Criteria](#16-acceptance-criteria--验收标准)
   - [Risk Assessment](#17-risk-assessment--风险评估)
   - [Go-to-Market Strategy](#18-go-to-market-strategy--上市策略)
   - [Stakeholder Management](#19-stakeholder-management--利益相关者管理)
   - [Timeline & Milestones](#110-timeline--milestones--时间线和里程碑)

### Technical Sections / 技术部分
2. [Core Features](#2-core-features--核心功能)
3. [Technical Architecture](#3-technical-architecture--技术架构)
4. [Deployment Architecture](#4-deployment-architecture--部署架构)
5. [Required Information & Credentials](#5-required-information--credentials--所需信息和凭证)
6. [Prerequisites](#6-prerequisites--先决条件)
7. [Step-by-Step Deployment Guide](#7-step-by-step-deployment-guide--逐步部署指南)
8. [Rollback Procedures](#8-rollback-procedures--回滚程序)
9. [Maintenance & Updates](#9-maintenance--updates--维护和更新)
10. [Troubleshooting](#10-troubleshooting--故障排除)
11. [Cost Estimation](#11-cost-estimation--成本估算)
12. [Security Considerations](#12-security-considerations--安全考虑)
13. [Performance Optimization](#13-performance-optimization--性能优化)
14. [Future Enhancements](#14-future-enhancements--未来增强功能)
15. [Testing Strategy](#15-testing-strategy--测试策略)
16. [CI/CD Considerations](#16-cicd-considerations--cicd-考虑事项)
17. [Common Deployment Mistakes](#17-common-deployment-mistakes--常见部署错误)
18. [Support & Documentation](#18-support--documentation--支持和文档)
19. [Document Version History](#19-document-version-history--文档版本历史)

---

## 2. Core Features / 核心功能

### 2.1 User Authentication / 用户认证

#### English
- **Registration:** Email and password registration
- **Login:** Email/password authentication
- **Session Management:** Secure session handling with NextAuth.js
- **Password Security:** Bcrypt hashing
- **User Profile:** Basic user information storage
- **Logout:** Secure session termination
- **Protected Routes:** All features require authentication

#### 中文
- **注册:** 邮箱和密码注册
- **登录:** 邮箱/密码认证
- **会话管理:** 使用 NextAuth.js 的安全会话处理
- **密码安全:** Bcrypt 哈希加密
- **用户资料:** 基本用户信息存储
- **登出:** 安全会话终止
- **受保护路由:** 所有功能需要认证

### 2.2 Word Lookup / 单词查询

#### English
- **Multi-language Support:** 10 languages (English, Spanish, Chinese, Hindi, Arabic, Portuguese, Bengali, Russian, Japanese, French)
- **Input Types:** Words, phrases, or sentences
- **Dual Language Definitions:**
  - Primary definition in target language (the language being learned)
  - Secondary definition/translation in native language
- **Visual Learning:** AI-generated or Unsplash-sourced images for each word
- **Audio Pronunciation:** Browser TTS with API fallback for natural pronunciation
- **Example Sentences:** 2 example sentences with translations
- **Usage Notes:** Cultural context, tone, synonyms, and common confusions
- **Caching:** 24-hour client-side cache for instant repeated lookups
- **User-specific:** All lookups are associated with logged-in user

#### 中文
- **多语言支持:** 10 种语言（英语、西班牙语、中文、印地语、阿拉伯语、葡萄牙语、孟加拉语、俄语、日语、法语）
- **输入类型:** 单词、短语或句子
- **双语定义:**
  - 目标语言（正在学习的语言）的主要定义
  - 母语的翻译/解释
- **视觉学习:** 每个单词的 AI 生成或 Unsplash 来源的图片
- **音频发音:** 浏览器 TTS，带 API 备用方案，提供自然发音
- **例句:** 2 个带翻译的例句
- **使用说明:** 文化背景、语调、同义词和常见混淆
- **缓存:** 24 小时客户端缓存，实现即时重复查询
- **用户特定:** 所有查询与登录用户关联

### 2.3 Notebook / 笔记本

#### English
- **Save Entries:** Save any lookup result to personal notebook (stored in database)
- **Entry Management:**
  - View all saved words (user-specific)
  - Delete entries
  - Replace existing entries with updated definitions
- **Smart Detection:** Automatically detects if word is already saved
- **Replace Prompt:** Asks user to replace when looking up saved words
- **Batch Upload:** Upload multiple words at once from files
  - Supported formats: Plain text (.txt), Markdown (.md), CSV (.csv), Excel (.xlsx, .xls)
  - Automatically generates definitions for all words in batch
  - Progress tracking during batch processing
  - Rate limiting protection (1 second delay between requests)
  - Maximum 100 words per batch
- **Tagging System:** Organize words with custom tags
  - Add tags to individual entries
  - **Batch Tagging:** Add/remove tags from multiple selected entries at once
  - Filter entries by tags
  - View all available tags
  - Tag management (add, remove, rename)
- **Learning History Tracking:**
  - **First Learned Date:** Tracks when each word was first learned (preserved even when entry is updated)
  - Created date (when entry was added to notebook)
  - Visual display of learning timeline
- **Story Generation:** Generate stories using selected words to aid memorization
  - Story in target language
  - Translation in native language (toggleable)
  - Select All / Deselect All functionality
- **Persistence:** All entries stored in PostgreSQL database (or localStorage for local version)
- **Multi-device:** Access notebook from any device after login

#### 中文
- **保存条目:** 将任何查询结果保存到个人笔记本（存储在数据库中）
- **条目管理:**
  - 查看所有已保存的单词（用户特定）
  - 删除条目
  - 用更新的定义替换现有条目
- **智能检测:** 自动检测单词是否已保存
- **替换提示:** 查询已保存单词时询问是否替换
- **批量上传:** 从文件一次性上传多个单词
  - 支持格式：纯文本 (.txt)、Markdown (.md)、CSV (.csv)、Excel (.xlsx, .xls)
  - 自动为所有单词生成定义
  - 批量处理进度跟踪
  - 速率限制保护（请求之间延迟1秒）
  - 每批最多100个单词
- **标签系统:** 使用自定义标签组织单词
  - 为单个条目添加标签
  - **批量标签:** 一次性为多个选定的条目添加/删除标签
  - 按标签筛选条目
  - 查看所有可用标签
  - 标签管理（添加、删除、重命名）
- **学习历史跟踪:**
  - **首次学习日期:** 跟踪每个单词首次学习的日期（即使更新条目也保留）
  - 创建日期（添加到笔记本的时间）
  - 学习时间线的可视化显示
- **故事生成:** 使用选定的单词生成故事以帮助记忆
  - 目标语言的故事
  - 母语翻译（可切换）
  - 全选/取消全选功能
- **持久性:** 所有条目存储在 PostgreSQL 数据库中（或本地版本的 localStorage）
- **多设备:** 登录后可从任何设备访问笔记本

### 2.4 Study Mode / 学习模式

#### English
- **Flashcards:** Interactive flashcards with flip animation
- **Card Front:** Word in target language + image
- **Card Back:** Word + definition in native language + example sentence
- **Translation Toggle:** One-click toggle to show/hide example sentence translation
- **Navigation:** Previous/Next buttons and shuffle functionality
- **Progress Indicator:** Shows current card position
- **Audio Integration:** Play pronunciation without flipping card
- **User-specific:** Only shows flashcards from logged-in user's notebook

#### 中文
- **抽认卡:** 带翻转动画的交互式抽认卡
- **卡片正面:** 目标语言单词 + 图片
- **卡片背面:** 单词 + 母语定义 + 例句
- **翻译切换:** 一键切换显示/隐藏例句翻译
- **导航:** 上一张/下一张按钮和随机播放功能
- **进度指示器:** 显示当前卡片位置
- **音频集成:** 播放发音而不翻转卡片
- **用户特定:** 仅显示登录用户笔记本中的抽认卡

### 2.5 Learning Process Tracking / 学习过程跟踪

#### English
- **Progress Dashboard:** Comprehensive overview of learning statistics
- **Learning Statistics:**
  - Total words learned
  - Words learned per day/week/month
  - Study streak (consecutive days)
  - Total study time
  - Languages studied
- **Word Mastery Levels:** Track proficiency for each word (New, Learning, Mastered, Review)
- **Activity Timeline:** Chronological view of learning activities
- **Performance Metrics:**
  - Quiz scores and trends
  - Flashcard accuracy rate
  - Words mastered vs. words in progress
  - Learning velocity (words per week)
- **Achievement System:** Badges and milestones for learning accomplishments
- **Visual Charts:** Graphs showing progress over time (daily, weekly, monthly)
- **Export Data:** Download learning statistics as CSV/JSON

#### 中文
- **进度仪表板:** 学习统计的全面概览
- **学习统计:**
  - 已学单词总数
  - 每天/周/月学习的单词数
  - 学习连续天数（学习连续记录）
  - 总学习时间
  - 学习的语言
- **单词掌握程度:** 跟踪每个单词的熟练程度（新词、学习中、已掌握、需复习）
- **活动时间线:** 学习活动的按时间顺序视图
- **性能指标:**
  - 测验分数和趋势
  - 抽认卡准确率
  - 已掌握单词 vs. 进行中的单词
  - 学习速度（每周单词数）
- **成就系统:** 学习成就的徽章和里程碑
- **可视化图表:** 显示随时间进度的图表（每日、每周、每月）
- **导出数据:** 将学习统计下载为 CSV/JSON

### 2.6 Quiz Functions / 测验功能

#### English
- **Quiz Types:**
  - **Multiple Choice:** Choose correct definition from 4 options
  - **Fill in the Blank:** Complete sentences with correct word
  - **Matching:** Match words with definitions
  - **Spelling:** Type the word from audio/definition
  - **Translation:** Translate word/phrase between languages
- **Quiz Configuration:**
  - Select number of questions (5, 10, 20, 50)
  - Choose difficulty level (Easy, Medium, Hard)
  - Filter by language pair
  - Select from notebook entries or all learned words
  - Focus on specific mastery levels (New, Learning, Review)
- **Quiz Session:**
  - Real-time scoring
  - Immediate feedback (correct/incorrect)
  - Explanation for incorrect answers
  - Progress indicator (Question X of Y)
  - Time tracking (optional timer)
- **Quiz Results:**
  - Score percentage and grade
  - Correct/incorrect breakdown
  - Words that need review
  - Performance comparison with previous quizzes
  - Recommendations for improvement
- **Adaptive Learning:** Quiz difficulty adjusts based on performance
- **Review Mode:** Retake incorrect questions
- **Practice Mode:** Unlimited practice without scoring

#### 中文
- **测验类型:**
  - **选择题:** 从4个选项中选择正确定义
  - **填空题:** 用正确单词完成句子
  - **匹配题:** 将单词与定义匹配
  - **拼写题:** 根据音频/定义输入单词
  - **翻译题:** 在语言之间翻译单词/短语
- **测验配置:**
  - 选择题目数量（5、10、20、50）
  - 选择难度级别（简单、中等、困难）
  - 按语言对筛选
  - 从笔记本条目或所有已学单词中选择
  - 专注于特定掌握程度（新词、学习中、需复习）
- **测验会话:**
  - 实时评分
  - 即时反馈（正确/错误）
  - 错误答案的解释
  - 进度指示器（第X题，共Y题）
  - 时间跟踪（可选计时器）
- **测验结果:**
  - 分数百分比和等级
  - 正确/错误明细
  - 需要复习的单词
  - 与之前测验的性能比较
  - 改进建议
- **自适应学习:** 测验难度根据表现调整
- **复习模式:** 重新回答错误的问题
- **练习模式:** 无限练习，不计分

---

## 3. Technical Architecture / 技术架构

### 3.1 Technology Stack / 技术栈

#### Frontend / 前端
- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Authentication:** NextAuth.js v5 (Auth.js)
- **Icons:** Lucide React

#### Backend / 后端
- **Runtime:** Node.js 18+
- **API:** Next.js API Routes
- **Database:** PostgreSQL 14+ (installed on ECS)
- **ORM:** Prisma (database client)
- **Session:** NextAuth.js session management

#### AI Services / AI 服务
- **Primary:** SiliconFlow API (OpenAI-compatible)
- **Alternative:** OpenAI API, Anthropic Claude, Google Gemini
- **Image Search:** Unsplash API
- **Audio:** Browser Web Speech API with API fallback
- **LLM Replacement:** Supports multiple providers with fallback mechanism

#### Deployment / 部署
- **Server:** Aliyun ECS (Ubuntu 22.04 LTS)
- **Database:** PostgreSQL on ECS
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt (via Certbot)
- **Domain:** Custom domain (optional)

### 3.2 Project Structure / 项目结构

```
/dictionary-app
  /app
    /api
      /auth
        /[...nextauth]/route.ts    # NextAuth.js API route
      /lookup/route.ts              # Word lookup
      /image/route.ts               # Image generation
      /audio/route.ts               # Audio generation
      /story/route.ts               # Story generation
      /notebook/route.ts            # Notebook CRUD (GET, POST, DELETE)
      /user/route.ts                # User profile management
      /progress/route.ts            # Learning progress tracking
      /quiz/route.ts                 # Quiz functions
    /(auth)
      /login/page.tsx               # Login page
      /register/page.tsx            # Registration page
    /(protected)
      /page.tsx                     # Main lookup page (protected)
      /notebook/page.tsx            # Notebook page (protected)
      /study/page.tsx               # Study mode (protected)
    /components
      /AuthForm.tsx                 # Login/Register form component
      /Navigation.tsx               # Navigation with user menu
      /LanguageSelector.tsx
      /LookupForm.tsx
      /ResultCard.tsx
      /AudioPlayer.tsx
      /NotebookItem.tsx
      /Flashcard.tsx
      /StoryView.tsx
      /ProgressDashboard.tsx
      /QuizQuestion.tsx
      /QuizResults.tsx
      /ProgressChart.tsx
      /ActivityTimeline.tsx
    /lib
      /auth.ts                      # NextAuth configuration
      /db.ts                        # Prisma client
      /ai.ts                        # AI service clients
      /types.ts                     # TypeScript interfaces
    /middleware.ts                  # Auth middleware
    layout.tsx                      # Root layout
    globals.css
  /prisma
    schema.prisma                   # Database schema
    migrations/                     # Database migrations
  /public
    /images
    /audio
  .env.local                        # Local environment variables
  .env.example                      # Example environment file
  next.config.js
  tailwind.config.js
  tsconfig.json
  package.json
  ecosystem.config.js               # PM2 configuration
  nginx.conf                        # Nginx configuration
  deploy.sh                         # Deployment script
```

### 3.3 Database Schema / 数据库架构

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // Bcrypt hashed
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  notebookEntries NotebookEntry[]
  stories         Story[]
  learningProgress LearningProgress[]
  quizSessions     QuizSession[]
  learningActivities LearningActivity[]
  
  @@map("users")
}

// Notebook entry model
model NotebookEntry {
  id                  String   @id @default(cuid())
  userId              String
  word                String
  targetLanguage      String
  nativeLanguage      String
  definition          String   // Native language definition
  definitionTarget    String?  // Target language definition
  imageUrl            String?
  audioUrl            String?
  exampleSentence1    String
  exampleSentence2    String
  exampleTranslation1 String
  exampleTranslation2 String
  usageNote           String
  tags                String[] @default([]) // Tags for categorization
  firstLearnedDate    DateTime @default(now()) // Date when word was first learned
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  // Relations
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  learningProgress    LearningProgress[]
  
  @@unique([userId, word, targetLanguage, nativeLanguage])
  @@index([userId])
  @@index([userId, tags]) // Index for tag filtering
  @@map("notebook_entries")
}

// Story model
model Story {
  id          String   @id @default(cuid())
  userId      String
  content     String   // Story in target language
  translation String   // Translation in native language
  wordsUsed   String[] // Array of notebook entry IDs
  createdAt   DateTime @default(now())
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("stories")
}
```

### 3.4 API Endpoints / API 端点

#### Authentication / 认证
- `POST /api/auth/register` - User registration
  - Request: `{ email: string, password: string, name?: string }`
  - Response: `{ user: { id, email, name }, message: string }`
  - Errors: 400 (validation), 409 (email exists)
  
- `POST /api/auth/login` - User login (handled by NextAuth)
  - Request: `{ email: string, password: string }`
  - Response: Session cookie set
  - Errors: 401 (invalid credentials)
  
- `POST /api/auth/logout` - User logout (handled by NextAuth)
  - Response: Session cleared
  
- `GET /api/auth/session` - Get current session
  - Response: `{ user: { id, email, name } | null }`
  - Requires: Authentication

#### Word Lookup / 单词查询
- `POST /api/lookup` - Look up word/phrase
  - Request: `{ word: string, targetLanguage: string, nativeLanguage: string }`
  - Response: `{ word, definitionTarget, definition, imageUrl, examples, usageNote, audioUrl? }`
  - Requires: Authentication
  - Rate Limit: 60 requests/hour per user
  - Timeout: 30 seconds

#### Notebook / 笔记本
- `GET /api/notebook` - Get all notebook entries for current user
  - Query Params: `?page=1&limit=50` (optional pagination)
  - Response: `{ entries: NotebookEntry[], total: number, page: number }`
  - Requires: Authentication
  
- `POST /api/notebook` - Save entry to notebook
  - Request: `NotebookEntry` (without id, userId, createdAt)
  - Response: `{ entry: NotebookEntry, message: string }`
  - Requires: Authentication
  - Validation: Checks for duplicate entries
  
- `PUT /api/notebook/:id` - Update notebook entry
  - Request: `Partial<NotebookEntry>`
  - Response: `{ entry: NotebookEntry }`
  - Requires: Authentication (only own entries)
  
- `DELETE /api/notebook/:id` - Delete notebook entry
  - Response: `{ message: string }`
  - Requires: Authentication (only own entries)

- `POST /api/batch-upload` - Batch upload words from file
  - Request: `FormData` with `file`, `targetLanguage`, `nativeLanguage`
  - Supported file formats: `.txt`, `.md`, `.csv`, `.xlsx`, `.xls`
  - Response: `{ results: BatchUploadResult[], summary: { total, success, failed } }`
  - Requires: Authentication
  - Rate Limit: 1 request per minute (to avoid API rate limits)
  - Max words per batch: 100
  - Processing: 1 second delay between word definitions

- `PUT /api/notebook/tags` - Batch tag operations
  - Request: `{ entryIds: string[], tags: string[], operation: 'add' | 'remove' }`
  - Response: `{ updatedCount: number, message: string }`
  - Requires: Authentication (only own entries)

- `GET /api/notebook/tags` - Get all tags for current user
  - Response: `{ tags: string[] }`
  - Requires: Authentication

#### Story / 故事
- `POST /api/story` - Generate story from selected words
  - Request: `{ words: string[], nativeLanguage: string, targetLanguage: string }`
  - Response: `{ content: string, translation: string, storyId: string }`
  - Requires: Authentication
  - Rate Limit: 10 requests/hour per user
  - Timeout: 60 seconds

#### Media / 媒体
- `POST /api/image` - Generate/get image
  - Request: `{ word: string, definition: string }`
  - Response: `{ imageUrl: string }`
  - Cache: 24 hours
  - Rate Limit: 100 requests/hour per user
  
- `POST /api/audio` - Generate audio pronunciation
  - Request: `{ text: string, language: string }`
  - Response: Audio stream (MP3) or 503 (use browser TTS)
  - Cache: 7 days
  - Rate Limit: 200 requests/hour per user

#### Health & Monitoring / 健康检查与监控
- `GET /api/health` - Application health check
  - Response: `{ status: 'ok', timestamp: string, uptime: number, database: 'connected' | 'disconnected' }`
  - No authentication required
  
- `GET /api/health/detailed` - Detailed health check
  - Response: `{ status, database, redis?, diskSpace, memory }`
  - Requires: Admin authentication

#### Learning Progress / 学习进度
- `GET /api/progress` - Get user's learning progress overview
  - Response: `{ totalWords, masteredWords, learningWords, streak, totalStudyTime, languages, weeklyStats }`
  - Requires: Authentication
  
- `GET /api/progress/word/:entryId` - Get progress for specific word
  - Response: `{ masteryLevel, timesStudied, timesCorrect, timesIncorrect, lastStudied, nextReviewDate }`
  - Requires: Authentication
  
- `PUT /api/progress/word/:entryId` - Update word mastery level
  - Request: `{ masteryLevel: string, isCorrect?: boolean }`
  - Response: `{ progress: LearningProgress }`
  - Requires: Authentication
  
- `GET /api/progress/timeline` - Get learning activity timeline
  - Query Params: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=50`
  - Response: `{ activities: LearningActivity[], total: number }`
  - Requires: Authentication
  
- `GET /api/progress/stats` - Get detailed statistics
  - Query Params: `?period=day|week|month|year`
  - Response: `{ period, wordsLearned, studyTime, quizScores, accuracyRate, charts }`
  - Requires: Authentication
  
- `GET /api/progress/export` - Export learning data
  - Query Params: `?format=csv|json`
  - Response: File download or JSON data
  - Requires: Authentication

#### Quiz / 测验
- `POST /api/quiz/start` - Start a new quiz session
  - Request: `{ quizType: string, languagePair: string, numQuestions: number, difficulty?: string, masteryLevels?: string[] }`
  - Response: `{ sessionId: string, questions: QuizQuestion[] }`
  - Requires: Authentication
  
- `POST /api/quiz/answer` - Submit quiz answer
  - Request: `{ sessionId: string, questionId: string, answer: string, timeSpent?: number }`
  - Response: `{ isCorrect: boolean, correctAnswer: string, explanation?: string }`
  - Requires: Authentication
  
- `POST /api/quiz/submit` - Submit completed quiz
  - Request: `{ sessionId: string, answers: QuizAnswer[] }`
  - Response: `{ session: QuizSession, score: number, recommendations: string[] }`
  - Requires: Authentication
  
- `GET /api/quiz/history` - Get quiz history
  - Query Params: `?limit=20&offset=0`
  - Response: `{ sessions: QuizSession[], total: number }`
  - Requires: Authentication
  
- `GET /api/quiz/results/:sessionId` - Get detailed quiz results
  - Response: `{ session: QuizSession, answers: QuizAnswer[], performance: object }`
  - Requires: Authentication

---

## 4. Deployment Architecture / 部署架构

### 4.1 ECS Instance Configuration / ECS 实例配置

#### Recommended Specs / 推荐配置
- **Instance Type:** ecs.t6-c1m2.large (2 vCPU, 4GB RAM) or higher
- **OS:** Ubuntu 22.04 LTS
- **Storage:** 40GB SSD
- **Network:** Public IP with security group configured
- **Cost:** ~¥100-150/month

#### Security Group Rules / 安全组规则
```
Inbound Rules:
- Port 22 (SSH): Your IP only
- Port 80 (HTTP): 0.0.0.0/0
- Port 443 (HTTPS): 0.0.0.0/0
- Port 5432 (PostgreSQL): 127.0.0.1 only (localhost)

Outbound Rules:
- All traffic allowed
```

### 4.2 Software Stack on ECS / ECS 上的软件栈

```
ECS Instance (Ubuntu 22.04)
├── Node.js 18+ (via nvm)
├── PostgreSQL 14+
├── Nginx (reverse proxy)
├── PM2 (process manager)
├── Certbot (SSL certificates)
└── Your Next.js Application
```

### 4.3 Network Architecture / 网络架构

```
Internet
  ↓
Aliyun ECS (Public IP)
  ├── Nginx (Port 80/443)
  │   └── Next.js App (Port 3000)
  │       ├── API Routes
  │       └── NextAuth.js
  └── PostgreSQL (Port 5432, localhost only)
```

---

## 5. Required Information & Credentials / 所需信息和凭证

### 5.1 Aliyun ECS Information / 阿里云 ECS 信息

You need to provide / 您需要提供:

- [ ] **ECS Instance Public IP:** `xxx.xxx.xxx.xxx`
- [ ] **ECS Instance SSH Username:** `root` or `ubuntu`
- [ ] **ECS Instance SSH Password/Key:** (for server access)
- [ ] **ECS Region:** (e.g., `cn-hangzhou`, `cn-beijing`)
- [ ] **Domain Name (Optional):** `yourdomain.com` (if you have one)

### 5.2 Database Information / 数据库信息

You need to provide / 您需要提供:

- [ ] **PostgreSQL Database Name:** `dictionary`
- [ ] **PostgreSQL Username:** `dictionary_user`
- [ ] **PostgreSQL Password:** (you'll set this during setup)
- [ ] **PostgreSQL Host:** `localhost` (on ECS)
- [ ] **PostgreSQL Port:** `5432`

### 5.3 API Keys / API 密钥

You need to provide / 您需要提供:

- [ ] **SiliconFlow API Key:** `sk-xxxxxxxxxxxxx`
  - Get from: https://siliconflow.cn
  - Used for: AI definitions, story generation
  
- [ ] **OpenAI API Key (Optional):** `sk-xxxxxxxxxxxxx`
  - Get from: https://platform.openai.com
  - Used as: Fallback if SiliconFlow unavailable
  
- [ ] **Unsplash Access Key:** `xxxxxxxxxxxxx`
  - Get from: https://unsplash.com/developers
  - Used for: Image search/generation
  - You have: `YSIFbFwW5qw3NFHLsA38XArSkg5WIHioWEXFXV06eIE`

### 5.4 NextAuth Configuration / NextAuth 配置

You need to provide / 您需要提供:

- [ ] **NEXTAUTH_URL:** `https://yourdomain.com` or `http://your-ecs-ip:3000`
- [ ] **NEXTAUTH_SECRET:** (random 32+ character string, generated during setup)

### 5.5 Environment Variables Checklist / 环境变量清单

Complete `.env` file needed on ECS / ECS 上需要的完整 `.env` 文件:

```env
# Database
DATABASE_URL="postgresql://dictionary_user:YOUR_PASSWORD@localhost:5432/dictionary?connection_limit=10&pool_timeout=20"

# NextAuth (v5 - Auth.js)
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-random-32-char-secret-here"
AUTH_SECRET="your-random-32-char-secret-here"  # Same as NEXTAUTH_SECRET for v5

# AI Services
SILICONFLOW_API_KEY="sk-your-siliconflow-key"
OPENAI_API_KEY="sk-your-openai-key"  # Optional fallback
AI_MODEL="Qwen/Qwen2.5-72B-Instruct"
IMAGE_MODEL="Qwen/Qwen2-VL-72B-Instruct"
AUDIO_MODEL="MOSS"

# Image Service
UNSPLASH_ACCESS_KEY="YSIFbFwW5qw3NFHLsA38XArSkg5WIHioWEXFXV06eIE"

# App Configuration
NODE_ENV="production"
PORT="3000"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Rate Limiting (Optional - if implementing rate limiting)
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="3600000"  # 1 hour

# Logging
LOG_LEVEL="info"  # debug, info, warn, error
ENABLE_REQUEST_LOGGING="true"

# Security
ALLOWED_ORIGINS="https://yourdomain.com"
SESSION_MAX_AGE="2592000"  # 30 days in seconds
```

#### Environment Variable Validation / 环境变量验证

After setting up `.env`, validate all required variables:

```bash
# Create validation script
nano /var/www/dictionary-app/validate-env.sh
```

```bash
#!/bin/bash
# validate-env.sh
required_vars=(
  "DATABASE_URL"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
  "SILICONFLOW_API_KEY"
  "UNSPLASH_ACCESS_KEY"
)

missing_vars=()

for var in "${required_vars[@]}"; do
  if ! grep -q "^${var}=" .env 2>/dev/null; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
  echo "✅ All required environment variables are set"
  exit 0
else
  echo "❌ Missing required environment variables:"
  printf '  - %s\n' "${missing_vars[@]}"
  exit 1
fi
```

```bash
chmod +x validate-env.sh
./validate-env.sh
```

---

## 6. Prerequisites / 先决条件

*Note: This section covers technical prerequisites. For product/business prerequisites, see Section 1.*  
*注意：本节涵盖技术先决条件。产品/业务先决条件请参见第1节。*

### 6.1 Required Knowledge / 所需知识

Before starting deployment, you should be familiar with:
- Basic Linux command line operations
- SSH and remote server access
- Git version control
- Basic understanding of Node.js and Next.js
- PostgreSQL database basics
- Nginx web server basics

### 6.2 Required Accounts & Services / 所需账户和服务

- [ ] Aliyun account with ECS access
- [ ] GitHub/GitLab account (for code repository)
- [ ] SiliconFlow API account and key
- [ ] Unsplash developer account and access key
- [ ] Domain name (optional but recommended)
- [ ] Email service (for notifications, optional)

### 6.3 Local Development Setup / 本地开发环境

Before deploying to ECS, ensure your application works locally:

```bash
# On your local machine
git clone YOUR_REPOSITORY_URL
cd dictionary-app
npm install

# Set up local .env.local
cp .env.example .env.local
# Edit .env.local with your API keys

# Run local database (Docker or local PostgreSQL)
# Or use Supabase for testing

# Test locally
npm run dev
# Verify all features work at http://localhost:3000
```

### 6.4 Estimated Time / 预计时间

- **Initial Setup:** 2-3 hours
- **Application Deployment:** 1-2 hours
- **Configuration & Testing:** 1 hour
- **Total:** 4-6 hours for first-time deployment

---

## 7. Step-by-Step Deployment Guide / 逐步部署指南

### Phase 1: ECS Setup / ECS 设置

#### Step 1.1: Create ECS Instance / 创建 ECS 实例

1. Log in to Aliyun Console / 登录阿里云控制台
2. Go to ECS → Instances / 前往 ECS → 实例
3. Click "Create Instance" / 点击"创建实例"
4. Configure:
   - **Region:** Choose closest to you / 选择离您最近的区域
   - **Instance Type:** ecs.t6-c1m2.large (2 vCPU, 4GB RAM)
   - **Image:** Ubuntu 22.04 LTS
   - **Storage:** 40GB SSD
   - **Network:** VPC with public IP
   - **Security Group:** Create new (we'll configure later)
5. Set root password (save it securely!)
6. Click "Create" / 点击"创建"

#### Step 1.2: Configure Security Group / 配置安全组

1. Go to ECS → Security Groups / 前往 ECS → 安全组
2. Find your instance's security group
3. Add Inbound Rules / 添加入站规则:
   ```
   SSH (22): Your IP only
   HTTP (80): 0.0.0.0/0
   HTTPS (443): 0.0.0.0/0
   ```
4. Save rules / 保存规则

#### Step 1.3: Connect to ECS / 连接到 ECS

```bash
# On your local machine / 在本地机器上
ssh root@YOUR_ECS_IP
# Enter password when prompted / 提示时输入密码
```

---

### Phase 2: Install Software / 安装软件

#### Step 2.1: Update System / 更新系统

```bash
apt-get update
apt-get upgrade -y
```

#### Step 2.2: Install Node.js / 安装 Node.js

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

#### Step 2.3: Install PostgreSQL / 安装 PostgreSQL

```bash
# Install PostgreSQL
apt-get install postgresql postgresql-contrib -y

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Verify PostgreSQL is running
systemctl status postgresql
# Should show: active (running)

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE dictionary;
CREATE USER dictionary_user WITH PASSWORD 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE dictionary TO dictionary_user;
ALTER USER dictionary_user CREATEDB;  # Allow creating databases for migrations
\q

# Configure PostgreSQL for better performance (optional but recommended)
sudo -u postgres psql -c "ALTER SYSTEM SET shared_buffers = '256MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET effective_cache_size = '1GB';"
sudo -u postgres psql -c "ALTER SYSTEM SET maintenance_work_mem = '128MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET checkpoint_completion_target = 0.9;"
sudo -u postgres psql -c "ALTER SYSTEM SET wal_buffers = '16MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET default_statistics_target = 100;"
sudo -u postgres psql -c "ALTER SYSTEM SET random_page_cost = 1.1;"
sudo -u postgres psql -c "ALTER SYSTEM SET effective_io_concurrency = 200;"
sudo -u postgres psql -c "ALTER SYSTEM SET work_mem = '16MB';"
sudo -u postgres psql -c "ALTER SYSTEM SET min_wal_size = '1GB';"
sudo -u postgres psql -c "ALTER SYSTEM SET max_wal_size = '4GB';"

# Reload PostgreSQL configuration
sudo systemctl reload postgresql

# Test connection
psql -U dictionary_user -d dictionary -h localhost
# Enter password when prompted
# You should see: dictionary=>
# Type \q to exit

# Verify database was created
sudo -u postgres psql -l | grep dictionary
# Should show: dictionary | dictionary_user | UTF8 | ...
```

#### Step 2.4: Install Nginx / 安装 Nginx

```bash
apt-get install nginx -y
systemctl start nginx
systemctl enable nginx
```

#### Step 2.5: Install PM2 / 安装 PM2

```bash
npm install -g pm2
```

#### Step 2.6: Install Certbot (for SSL) / 安装 Certbot（用于 SSL）

```bash
apt-get install certbot python3-certbot-nginx -y
```

---

### Phase 3: Deploy Application / 部署应用

#### Step 3.1: Clone Repository / 克隆仓库

```bash
# On ECS / 在 ECS 上
cd /var/www
git clone YOUR_REPOSITORY_URL dictionary-app
cd dictionary-app
```

#### Step 3.2: Install Dependencies / 安装依赖

```bash
npm install
```

#### Step 3.3: Set Up Environment Variables / 设置环境变量

```bash
# Create .env file
nano .env

# Paste your environment variables (see section 5.5)
# Save: Ctrl+O, Enter, Ctrl+X
```

#### Step 3.4: Set Up Prisma / 设置 Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Verify Prisma can connect to database
npx prisma db pull

# Run migrations (creates all tables)
npx prisma migrate deploy

# Verify tables were created
npx prisma studio
# This opens a GUI at http://localhost:5555
# Press Ctrl+C to exit after verifying tables exist

# Alternative: Verify via command line
psql -U dictionary_user -d dictionary -h localhost -c "\dt"
# Should show tables: users, notebook_entries, stories

# Create initial admin user (optional - via Prisma Studio or SQL)
psql -U dictionary_user -d dictionary -h localhost
# Then run:
# INSERT INTO users (id, email, password, name, "createdAt", "updatedAt")
# VALUES ('admin-id', 'admin@example.com', '$2b$10$hashedpassword', 'Admin', NOW(), NOW());
# (Use bcrypt to hash password first)
```

#### Step 3.5: Build Application / 构建应用

```bash
npm run build
```

#### Step 3.6: Start with PM2 / 使用 PM2 启动

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
// ecosystem.config.js
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
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    error_file: '/var/www/dictionary-app/logs/pm2-error.log',
    out_file: '/var/www/dictionary-app/logs/pm2-out.log',
    log_file: '/var/www/dictionary-app/logs/pm2-combined.log',
    time: true,
    merge_logs: true,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
# Create logs directory
mkdir -p /var/www/dictionary-app/logs
```

```bash
# Start app
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup  # Follow instructions to enable auto-start on boot
```

---

### Phase 4: Configure Nginx / 配置 Nginx

#### Step 4.1: Create Nginx Configuration / 创建 Nginx 配置

```bash
nano /etc/nginx/sites-available/dictionary-app
```

```nginx
# /etc/nginx/sites-available/dictionary-app
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Client body size limit (for file uploads if needed)
    client_max_body_size 10M;

    # Proxy settings
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

    # Health check endpoint (bypasses auth)
    location /api/health {
        proxy_pass http://localhost:3000;
        access_log off;
    }

    # Static file caching (if serving static files)
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/dictionary-app /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

#### Step 4.2: Set Up SSL (Optional but Recommended) / 设置 SSL（可选但推荐）

```bash
# If you have a domain name / 如果您有域名
certbot --nginx -d yourdomain.com

# Follow prompts to complete SSL setup
# Certbot will automatically configure Nginx for HTTPS
```

---

### Phase 5: Verify Deployment / 验证部署

#### Step 5.1: Check Application Status / 检查应用状态

```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs dictionary-app

# Check Nginx status
systemctl status nginx

# Check PostgreSQL status
systemctl status postgresql
```

#### Step 5.2: Test Application / 测试应用

**Basic Functionality Tests / 基本功能测试:**

1. **Health Check:**
   ```bash
   curl http://YOUR_ECS_IP/api/health
   # Should return: {"status":"ok","timestamp":"...","uptime":...,"database":"connected"}
   ```

2. **Open browser:** `http://YOUR_ECS_IP` or `https://yourdomain.com`
   - Should redirect to login if not authenticated
   - Should show login/register page

3. **Test Registration:**
   - Create a new account with email and password
   - Verify email format validation
   - Verify password strength requirements (if implemented)
   - Check for duplicate email error

4. **Test Login:**
   - Log in with credentials
   - Verify session is created
   - Verify redirect to main page

5. **Test Word Lookup:**
   - Look up a word in different languages
   - Verify definition, image, and examples appear
   - Verify audio playback works
   - Test with phrases and sentences

6. **Test Notebook:**
   - Save word to notebook
   - View notebook page - verify saved word appears
   - Test delete functionality
   - Test replace/update functionality

7. **Test Study Mode:**
   - Navigate to study mode
   - Verify flashcards load from notebook
   - Test flip animation
   - Test navigation (next/previous/shuffle)
   - Test audio playback on cards

8. **Test Story Generation:**
   - Select multiple words in notebook
   - Generate story
   - Verify story appears in target language
   - Test translation toggle

**Performance Tests / 性能测试:**

```bash
# Test response time
time curl -X POST http://YOUR_ECS_IP/api/lookup \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION" \
  -d '{"word":"hello","targetLanguage":"en","nativeLanguage":"zh"}'

# Check server resources
htop
# Monitor CPU and memory usage during tests
```

**Security Tests / 安全测试:**

1. Try accessing protected routes without authentication
2. Try accessing another user's notebook entries (should fail)
3. Verify HTTPS redirect (if SSL configured)
4. Check security headers in browser DevTools

---

## 8. Rollback Procedures / 回滚程序

### 8.1 Application Rollback / 应用回滚

If a deployment causes issues, rollback to previous version:

```bash
# On ECS
cd /var/www/dictionary-app

# Option 1: Git rollback (if using git)
git log --oneline -10  # View recent commits
git checkout <previous-commit-hash>
npm install
npm run build
pm2 restart dictionary-app

# Option 2: Restore from backup
# If you backed up the working version:
cd /var/www
rm -rf dictionary-app
tar -xzf dictionary-app-backup-YYYYMMDD.tar.gz
cd dictionary-app
npm install
npm run build
pm2 restart dictionary-app
```

### 8.2 Database Rollback / 数据库回滚

```bash
# If database migration caused issues
cd /var/www/dictionary-app

# List migrations
npx prisma migrate status

# Rollback last migration (if using Prisma migrate)
# Note: Prisma doesn't support automatic rollback
# You'll need to manually reverse the migration SQL

# Or restore database from backup
pm2 stop dictionary-app
pg_restore -U dictionary_user -d dictionary -c /root/backups/dictionary_YYYYMMDD.dump
pm2 start dictionary-app
```

### 8.3 Configuration Rollback / 配置回滚

```bash
# Restore Nginx config
cp /etc/nginx/sites-available/dictionary-app.backup /etc/nginx/sites-available/dictionary-app
nginx -t
systemctl reload nginx

# Restore PM2 config
cp ecosystem.config.js.backup ecosystem.config.js
pm2 delete dictionary-app
pm2 start ecosystem.config.js
```

### 8.4 Emergency Shutdown / 紧急关闭

```bash
# Stop application immediately
pm2 stop dictionary-app

# Or kill process
pm2 kill

# Stop Nginx (if needed)
systemctl stop nginx

# Put up maintenance page
# Create /var/www/maintenance.html
# Update Nginx to serve maintenance page
```

---

## 9. Maintenance & Updates / 维护和更新

### 9.1 Updating Application / 更新应用

#### Standard Update Process / 标准更新流程

```bash
# On ECS / 在 ECS 上
cd /var/www/dictionary-app

# 1. Backup current version
tar -czf ../dictionary-app-backup-$(date +%Y%m%d).tar.gz .

# 2. Backup database
/root/backup-db.sh

# 3. Pull latest code
git fetch origin
git pull origin main  # or your branch name

# 4. Install new dependencies (if any)
npm install

# 5. Run database migrations (if any)
npx prisma generate
npx prisma migrate deploy

# 6. Rebuild application
npm run build

# 7. Test build
npm run start &
# Wait a few seconds, then test http://localhost:3000/api/health
pkill -f "next start"

# 8. Restart with PM2
pm2 restart dictionary-app

# 9. Monitor for errors
pm2 logs dictionary-app --lines 50
```

#### Zero-Downtime Update (Advanced) / 零停机更新（高级）

For production with high availability requirements:

```bash
# 1. Build new version in separate directory
cd /var/www
git clone YOUR_REPOSITORY_URL dictionary-app-new
cd dictionary-app-new
npm install
npm run build

# 2. Switch PM2 to new directory
pm2 stop dictionary-app
# Update ecosystem.config.js cwd to new directory
pm2 start ecosystem.config.js

# 3. Keep old directory as backup
mv dictionary-app dictionary-app-old
mv dictionary-app-new dictionary-app
```

```bash
# On ECS / 在 ECS 上
cd /var/www/dictionary-app

# Pull latest code
git pull origin main

# Install new dependencies (if any)
npm install

# Run database migrations (if any)
npx prisma migrate deploy

# Rebuild
npm run build

# Restart app
pm2 restart dictionary-app
```

### 9.2 Database Backups / 数据库备份

#### Automated Backup Script / 自动备份脚本

```bash
# Create backup script
nano /root/backup-db.sh
```

```bash
#!/bin/bash
# backup-db.sh - Automated database backup script

BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dictionary_$DATE.sql"
LOG_FILE="/var/log/db-backup.log"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
echo "[$(date)] Starting database backup..." >> $LOG_FILE
pg_dump -U dictionary_user -d dictionary -F c -f "$BACKUP_DIR/dictionary_$DATE.dump" 2>> $LOG_FILE

if [ $? -eq 0 ]; then
  echo "[$(date)] Backup successful: dictionary_$DATE.dump" >> $LOG_FILE
  
  # Compress backup
  gzip "$BACKUP_DIR/dictionary_$DATE.dump"
  
  # Keep only last 7 days of backups
  find $BACKUP_DIR -name "dictionary_*.dump.gz" -mtime +7 -delete
  
  # Remove old log entries (keep last 100 lines)
  tail -n 100 $LOG_FILE > $LOG_FILE.tmp && mv $LOG_FILE.tmp $LOG_FILE
else
  echo "[$(date)] Backup FAILED!" >> $LOG_FILE
  # Optionally send alert email or notification
  exit 1
fi
```

```bash
# Make executable
chmod +x /root/backup-db.sh

# Test backup script
/root/backup-db.sh

# Verify backup was created
ls -lh /root/backups/

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-db.sh >> /var/log/db-backup-cron.log 2>&1
```

#### Manual Backup / 手动备份

```bash
# Full database backup
pg_dump -U dictionary_user -d dictionary -F c -f /root/backups/manual_backup_$(date +%Y%m%d).dump

# Backup specific table
pg_dump -U dictionary_user -d dictionary -t users -F c -f /root/backups/users_backup.dump

# Backup as SQL (readable format)
pg_dump -U dictionary_user -d dictionary > /root/backups/dictionary_$(date +%Y%m%d).sql
```

#### Restore from Backup / 从备份恢复

```bash
# Stop application first
pm2 stop dictionary-app

# Restore from compressed backup
gunzip -c /root/backups/dictionary_YYYYMMDD_HHMMSS.dump.gz | pg_restore -U dictionary_user -d dictionary -c

# Or restore from SQL file
psql -U dictionary_user -d dictionary < /root/backups/dictionary_YYYYMMDD.sql

# Verify restore
psql -U dictionary_user -d dictionary -c "SELECT COUNT(*) FROM users;"

# Restart application
pm2 start dictionary-app
```

**⚠️ Warning:** Restoring will overwrite existing data. Always backup current data before restoring!

### 9.3 Monitoring / 监控

#### PM2 Monitoring / PM2 监控

```bash
# Real-time monitoring dashboard
pm2 monit

# Check application status
pm2 status

# View logs (last 100 lines)
pm2 logs dictionary-app --lines 100

# View error logs only
pm2 logs dictionary-app --err --lines 50

# View logs in real-time
pm2 logs dictionary-app --lines 0
```

#### System Monitoring / 系统监控

```bash
# System resources
htop
# Or use: top, free -h, df -h

# Disk usage
df -h
du -sh /var/www/dictionary-app

# Memory usage
free -h

# Network connections
netstat -tulpn | grep :3000
ss -tulpn | grep :3000

# PostgreSQL connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

#### Application Health Monitoring / 应用健康监控

```bash
# Create health check script
nano /root/health-check.sh
```

```bash
#!/bin/bash
# health-check.sh
HEALTH_URL="http://localhost:3000/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$RESPONSE" -eq 200 ]; then
  echo "✅ Application is healthy (HTTP $RESPONSE)"
  exit 0
else
  echo "❌ Application health check failed (HTTP $RESPONSE)"
  # Optionally restart the app
  # pm2 restart dictionary-app
  exit 1
fi
```

```bash
chmod +x /root/health-check.sh

# Add to crontab (every 5 minutes)
crontab -e
# Add: */5 * * * * /root/health-check.sh >> /var/log/health-check.log 2>&1
```

#### Log Management / 日志管理

```bash
# Set up log rotation for PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# View Nginx access logs
tail -f /var/log/nginx/access.log

# View Nginx error logs
tail -f /var/log/nginx/error.log

# View PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 10. Troubleshooting / 故障排除

### Common Issues / 常见问题

#### Issue 1: Application won't start / 应用无法启动
```bash
# Check logs
pm2 logs dictionary-app

# Check environment variables
cat .env

# Check database connection
npx prisma db pull

# Restart
pm2 restart dictionary-app
```

#### Issue 2: Database connection error / 数据库连接错误
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U dictionary_user -d dictionary -h localhost

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

#### Issue 3: Nginx 502 Bad Gateway / Nginx 502 错误
```bash
# Check if app is running
pm2 status

# Check app logs
pm2 logs dictionary-app

# Check Nginx error log
tail -f /var/log/nginx/error.log
```

#### Issue 4: SSL certificate expired / SSL 证书过期
```bash
# Renew certificate
certbot renew

# Test renewal
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal
```

#### Issue 5: High memory usage / 内存使用过高
```bash
# Check memory usage
free -h
pm2 monit

# Check for memory leaks
pm2 logs dictionary-app | grep -i "memory\|heap"

# Restart application
pm2 restart dictionary-app

# If persistent, increase max_memory_restart in ecosystem.config.js
```

#### Issue 6: Database connection pool exhausted / 数据库连接池耗尽
```bash
# Check active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname='dictionary';"

# Check max connections
sudo -u postgres psql -c "SHOW max_connections;"

# Increase connection pool in DATABASE_URL
# Add: ?connection_limit=20&pool_timeout=20
# Then restart app: pm2 restart dictionary-app
```

#### Issue 7: Slow API responses / API 响应缓慢
```bash
# Check application logs for slow queries
pm2 logs dictionary-app | grep -i "slow\|timeout"

# Check database query performance
sudo -u postgres psql -d dictionary -c "
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
"

# Check Nginx upstream response time
tail -f /var/log/nginx/access.log | awk '{print $10}'

# Check system load
uptime
top
```

#### Issue 8: Authentication not working / 认证不工作
```bash
# Check NextAuth configuration
cat .env | grep NEXTAUTH

# Verify NEXTAUTH_SECRET is set
# Generate new secret if needed:
openssl rand -base64 32

# Check session cookies in browser DevTools
# Verify NEXTAUTH_URL matches your domain

# Check NextAuth logs
pm2 logs dictionary-app | grep -i "auth\|session"
```

---

## 11. Cost Estimation / 成本估算

### Monthly Costs / 月度成本

| Item / 项目 | Cost / 成本 | Notes / 备注 |
|------------|------------|-------------|
| ECS Instance (2vCPU, 4GB) | ¥100-150 | Basic tier |
| Bandwidth (1TB) | ¥23 | Included in some plans |
| Domain (Optional) | ¥50-100/year | ~¥5-8/month |
| **Total** | **¥128-181/month** | Without domain |

### Cost Optimization Tips / 成本优化建议

1. Use reserved instances for 1-year commitment (30% discount)
2. Monitor bandwidth usage
3. Use Aliyun CDN for static assets (optional)
4. Scale down during low-traffic periods

---

## 12. Security Considerations / 安全考虑

### 10.1 Application Security / 应用安全

- ✅ Password hashing with bcrypt (minimum 10 rounds)
- ✅ HTTPS/SSL encryption (TLS 1.2+)
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ XSS protection (Next.js built-in, React escaping)
- ✅ CSRF protection (NextAuth.js)
- ✅ Rate limiting (implement at Nginx or application level)
- ✅ Input validation and sanitization
- ✅ Secure session management (httpOnly cookies)
- ✅ Environment variable protection (.env not in git)
- ✅ API key rotation capability

#### Security Hardening Steps / 安全加固步骤

```bash
# 1. Set up fail2ban for SSH protection
apt-get install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban

# 2. Configure automatic security updates
apt-get install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades

# 3. Set up firewall (ufw)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 4. Disable root login via SSH (recommended)
# Edit /etc/ssh/sshd_config:
# PermitRootLogin no
# Then: systemctl restart sshd

# 5. Set up SSH key authentication (more secure than password)
# On local machine:
ssh-keygen -t rsa -b 4096
ssh-copy-id root@YOUR_ECS_IP

# 6. Regular security audits
apt-get install lynis -y
lynis audit system
```

### 10.2 Server Security / 服务器安全

- ✅ Firewall (security group) configured
- ✅ SSH key authentication (recommended)
- ✅ Regular system updates
- ✅ Database only accessible from localhost
- ✅ Strong passwords for all services

### 10.3 Data Security / 数据安全

- ✅ User passwords never stored in plain text
- ✅ Database backups encrypted
- ✅ Session tokens secure
- ✅ API keys in environment variables only

---

## 13. Performance Optimization / 性能优化

### 11.1 Database Optimization / 数据库优化

```sql
-- Add indexes for common queries
CREATE INDEX idx_notebook_user_created ON notebook_entries(user_id, created_at DESC);
CREATE INDEX idx_notebook_user_word ON notebook_entries(user_id, word);
CREATE INDEX idx_stories_user_created ON stories(user_id, created_at DESC);

-- Analyze tables for query optimization
ANALYZE users;
ANALYZE notebook_entries;
ANALYZE stories;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 11.2 Application Optimization / 应用优化

- **Caching Strategy:**
  - Implement Redis for session storage (optional)
  - Cache API responses for lookup results (24 hours)
  - Cache images and audio files
  - Use Next.js Image optimization

- **Connection Pooling:**
  - Configure Prisma connection pool size
  - Monitor connection usage
  - Set appropriate timeout values

- **Code Splitting:**
  - Use Next.js dynamic imports for heavy components
  - Lazy load study mode and notebook pages

### 11.3 Nginx Optimization / Nginx 优化

```nginx
# Add to nginx config for better performance
http {
    # Enable caching
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
    
    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}
```

---

## 14. LLM API Replacement & Vercel Deployment / LLM API 替换与 Vercel 部署

### 14.1 LLM API Replacement Options / LLM API 替换选项

The application currently uses SiliconFlow API (OpenAI-compatible). You can easily replace it with other providers:

**当前应用使用 SiliconFlow API（OpenAI 兼容）。您可以轻松替换为其他提供商：**

#### Option 1: OpenAI (Direct) / 选项 1：OpenAI（直接）

**Setup:**
```env
OPENAI_API_KEY=sk-your-openai-key
API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4-turbo-preview
```

**Advantages:**
- High quality responses
- Reliable service
- Good documentation

**Disadvantages:**
- More expensive
- Requires credits

#### Option 2: Anthropic Claude / 选项 2：Anthropic Claude

**Setup:**
```bash
npm install @anthropic-ai/sdk
```

```env
ANTHROPIC_API_KEY=sk-ant-your-key
```

**Code Changes:**
```typescript
// In app/lib/ai.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function generateDefinition(...) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: prompt
    }]
  })
  // Parse response...
}
```

#### Option 3: Google Gemini / 选项 3：Google Gemini

**Setup:**
```bash
npm install @google/generative-ai
```

```env
GOOGLE_API_KEY=your-google-api-key
```

**Code Changes:**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
```

#### Option 4: Local LLM (Ollama) / 选项 4：本地 LLM（Ollama）

**Setup:**
```bash
# Install Ollama locally
# https://ollama.ai
```

```env
OLLAMA_API_BASE=http://localhost:11434/v1
AI_MODEL=llama2
```

**Advantages:**
- Free
- No API costs
- Privacy (data stays local)

**Disadvantages:**
- Requires local setup
- Lower performance
- Limited models

#### Option 5: Multiple Providers with Fallback / 选项 5：多提供商与回退

**Recommended Approach:**
```typescript
// In app/lib/ai.ts
export async function generateDefinition(...) {
  // Try primary provider
  try {
    return await generateWithSiliconFlow(...)
  } catch (error) {
    console.log('SiliconFlow failed, trying OpenAI...')
    try {
      return await generateWithOpenAI(...)
    } catch (error) {
      console.log('OpenAI failed, trying Claude...')
      return await generateWithClaude(...)
    }
  }
}
```

### 14.2 Vercel Deployment with Database / 使用数据库部署到 Vercel

#### Step 1: Set Up Vercel Postgres / 步骤 1：设置 Vercel Postgres

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Go to Storage tab
   - Click "Create Database" → Select "Postgres"

2. **Create Database:**
   - Choose region (closest to your users)
   - Database name: `dictionary`
   - Click "Create"

3. **Get Connection Strings:**
   - Copy `POSTGRES_PRISMA_URL` (for Prisma)
   - Copy `POSTGRES_URL_NON_POOLING` (for migrations)

#### Step 2: Install Prisma / 步骤 2：安装 Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

#### Step 3: Configure Prisma / 步骤 3：配置 Prisma

**Update `prisma/schema.prisma`:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}

// Add all models from section 3.3
model User {
  // ... (see section 3.3)
}

model NotebookEntry {
  // ... (with tags and firstLearnedDate)
}
```

#### Step 4: Create Database Client / 步骤 4：创建数据库客户端

**Create `app/lib/db.ts`:**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### Step 5: Update Environment Variables / 步骤 5：更新环境变量

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
# OR
OPENAI_API_KEY=your-key
# OR
ANTHROPIC_API_KEY=your-key

# Other
UNSPLASH_ACCESS_KEY=your-key
NODE_ENV=production
```

#### Step 6: Update Storage Functions / 步骤 6：更新存储函数

**Create `app/lib/db-storage.ts` (database version):**
```typescript
import { prisma } from './db'
import { getServerSession } from 'next-auth'
import type { NotebookEntry } from './types'

export async function getNotebookEntries(): Promise<NotebookEntry[]> {
  const session = await getServerSession()
  if (!session?.user?.email) return []
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) return []
  
  const entries = await prisma.notebookEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })
  
  return entries.map(entry => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    firstLearnedDate: entry.firstLearnedDate?.toISOString(),
    tags: entry.tags || []
  }))
}

export async function saveNotebookEntry(entry: Omit<NotebookEntry, 'id' | 'createdAt' | 'firstLearnedDate'>): Promise<NotebookEntry> {
  const session = await getServerSession()
  if (!session?.user?.email) throw new Error('Unauthorized')
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!user) throw new Error('User not found')
  
  // Check for existing entry
  const existing = await prisma.notebookEntry.findUnique({
    where: {
      userId_word_targetLanguage_nativeLanguage: {
        userId: user.id,
        word: entry.word,
        targetLanguage: entry.targetLanguage,
        nativeLanguage: entry.nativeLanguage
      }
    }
  })
  
  if (existing) {
    // Update existing
    const updated = await prisma.notebookEntry.update({
      where: { id: existing.id },
      data: {
        ...entry,
        tags: entry.tags || [],
        // Keep original firstLearnedDate
        firstLearnedDate: existing.firstLearnedDate
      }
    })
    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      firstLearnedDate: updated.firstLearnedDate?.toISOString(),
      tags: updated.tags || []
    }
  }
  
  // Create new
  const created = await prisma.notebookEntry.create({
    data: {
      ...entry,
      userId: user.id,
      tags: entry.tags || [],
      firstLearnedDate: new Date()
    }
  })
  
  return {
    ...created,
    createdAt: created.createdAt.toISOString(),
    firstLearnedDate: created.firstLearnedDate.toISOString(),
    tags: created.tags || []
  }
}
```

#### Step 7: Run Migrations / 步骤 7：运行迁移

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# For production (on Vercel)
npx prisma migrate deploy
```

#### Step 8: Deploy to Vercel / 步骤 8：部署到 Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Or use GitHub integration:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel will auto-deploy on push

#### Step 9: Run Production Migration / 步骤 9：运行生产迁移

After deployment, run migrations:
```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Or add to package.json scripts:
"postdeploy": "prisma migrate deploy"
```

#### Vercel-Specific Considerations / Vercel 特定注意事项

**Environment Variables:**
- Set in Vercel Dashboard (not `.env` file)
- Different for production/preview/development
- Automatically injected at runtime

**Database Connection:**
- Use `POSTGRES_PRISMA_URL` for Prisma (connection pooling)
- Use `POSTGRES_URL_NON_POOLING` for migrations
- Vercel handles connection pooling automatically

**Build Settings:**
```json
// vercel.json (optional)
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**Edge Functions (Optional):**
- Can use Vercel Edge Functions for faster API responses
- Good for simple lookups without database access

**Cost Considerations:**
- Vercel Hobby: Free (limited)
- Vercel Pro: $20/month
- Vercel Postgres: Pay-as-you-go (~$0.10/GB storage)
- Total: ~$20-30/month for small-medium usage

---

## 15. Future Enhancements / 未来增强功能

### Phase 2 Features / 第二阶段功能

1. **Email Verification:** Verify email on registration
2. **Password Reset:** Forgot password functionality with email links
3. **Social Login:** Google, GitHub OAuth integration
4. **User Profiles:** Customizable user profiles with avatars
5. **Progress Tracking:** Learning statistics, streaks, and progress charts
6. **Spaced Repetition:** Algorithm-based review scheduling (SM-2 algorithm)
7. **Export/Import:** Backup notebook data (JSON, CSV formats)
8. **Mobile App:** React Native mobile application
9. **Offline Support:** Service workers for offline functionality
10. **Multi-device Sync:** Real-time synchronization across devices
11. **Study Groups:** Share notebooks and study together
12. **AI Tutor:** Personalized learning recommendations
13. **Voice Input:** Speech-to-text for word lookup
14. **Dark Mode:** Theme customization
15. **Notifications:** Reminders for daily study goals

---

## 15. Testing Strategy / 测试策略

### 13.1 Pre-Deployment Testing / 部署前测试

#### Local Testing / 本地测试

```bash
# 1. Run TypeScript type checking
npm run build

# 2. Run linter
npm run lint

# 3. Test database migrations
npx prisma migrate dev

# 4. Test API endpoints locally
npm run dev
# Test all endpoints with curl or Postman
```

#### Test Checklist / 测试清单

- [ ] User registration with valid/invalid emails
- [ ] User login with correct/incorrect credentials
- [ ] Session persistence across page refreshes
- [ ] Protected routes redirect to login when not authenticated
- [ ] Word lookup in all 10 supported languages
- [ ] Image generation/retrieval for words
- [ ] Audio pronunciation generation
- [ ] Notebook save/retrieve/delete operations
- [ ] Story generation with multiple words
- [ ] Flashcard navigation and interactions
- [ ] Error handling for API failures
- [ ] Database connection recovery
- [ ] Rate limiting (if implemented)

### 13.2 Post-Deployment Testing / 部署后测试

- [ ] Load testing with multiple concurrent users
- [ ] Database performance under load
- [ ] Memory leak detection (run for 24+ hours)
- [ ] SSL certificate validation
- [ ] Backup and restore procedures
- [ ] Monitoring and alerting systems

---

## 16. CI/CD Considerations / CI/CD 考虑事项

### 16.1 Automated Deployment (Optional) / 自动化部署（可选）

For teams or frequent updates, consider setting up CI/CD:

#### GitHub Actions Example / GitHub Actions 示例

```yaml
# .github/workflows/deploy.yml
name: Deploy to ECS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Deploy to ECS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.ECS_HOST }}
          username: ${{ secrets.ECS_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/dictionary-app
            git pull origin main
            npm install
            npx prisma generate
            npx prisma migrate deploy
            npm run build
            pm2 restart dictionary-app
```

#### Required Secrets / 所需密钥

Add these secrets to your GitHub repository:
- `ECS_HOST`: Your ECS public IP
- `ECS_USER`: SSH username (usually `root`)
- `SSH_PRIVATE_KEY`: Private SSH key for authentication

### 16.2 Deployment Checklist / 部署检查清单

Before each deployment:
- [ ] All tests pass locally
- [ ] Database migrations tested
- [ ] Environment variables updated (if needed)
- [ ] Backup current version
- [ ] Backup database
- [ ] Notify users (if major update)
- [ ] Monitor logs after deployment

---

## 17. Common Deployment Mistakes / 常见部署错误

### Mistakes to Avoid / 避免的错误

1. **❌ Not backing up before updates**
   - ✅ Always backup database and application files

2. **❌ Using weak passwords**
   - ✅ Use strong, unique passwords for all services

3. **❌ Exposing database port publicly**
   - ✅ Keep PostgreSQL on localhost only

4. **❌ Not setting up monitoring**
   - ✅ Configure PM2 monitoring and health checks

5. **❌ Forgetting to update environment variables**
   - ✅ Validate all environment variables after deployment

6. **❌ Not testing database migrations**
   - ✅ Test migrations on staging environment first

7. **❌ Skipping SSL certificate setup**
   - ✅ Always use HTTPS in production

8. **❌ Not configuring log rotation**
   - ✅ Set up log rotation to prevent disk space issues

9. **❌ Using root user for application**
   - ✅ Create dedicated user for application (best practice)

10. **❌ Not setting up automatic backups**
    - ✅ Schedule automated daily backups

---

## 18. Support & Documentation / 支持和文档

### Useful Commands / 有用命令

```bash
# Application
pm2 status                    # Check app status
pm2 logs dictionary-app       # View logs
pm2 restart dictionary-app    # Restart app

# Database
sudo -u postgres psql         # PostgreSQL CLI
pg_dump -U dictionary_user dictionary > backup.sql  # Backup

# Nginx
nginx -t                      # Test config
systemctl reload nginx        # Reload config

# System
htop                          # Monitor resources
df -h                         # Check disk space
free -h                       # Check memory
```

### Important Files / 重要文件

- `/var/www/dictionary-app/.env` - Environment variables
- `/var/www/dictionary-app/ecosystem.config.js` - PM2 config
- `/var/www/dictionary-app/logs/` - Application logs
- `/etc/nginx/sites-available/dictionary-app` - Nginx config
- `/etc/nginx/sites-enabled/dictionary-app` - Nginx enabled config
- `/root/backups/` - Database backups
- `/var/log/nginx/` - Nginx logs
- `/var/log/postgresql/` - PostgreSQL logs
- `/root/backup-db.sh` - Backup script
- `/root/health-check.sh` - Health check script

### Quick Troubleshooting Commands / 快速故障排除命令

```bash
# Application not responding?
pm2 restart dictionary-app && pm2 logs dictionary-app --lines 50

# Database connection issues?
systemctl status postgresql && psql -U dictionary_user -d dictionary -h localhost

# Nginx 502 error?
pm2 status && tail -f /var/log/nginx/error.log

# Out of disk space?
df -h && du -sh /var/www/dictionary-app

# High memory usage?
free -h && pm2 monit

# Check all services status?
systemctl status nginx postgresql && pm2 status
```

---

## 19. Document Version History / 文档版本历史

| Version | Date | Changes |
|---------|------|---------|
| 4.1 | 2024 | **Feature Updates:** Added batch upload (text/markdown/CSV/Excel), tagging system with batch operations, first learned date tracking, LLM API replacement guide, and Vercel deployment instructions with database setup. |
| 4.0 | 2024 | **Major Enhancement:** Added comprehensive product management sections including business context, user personas, success metrics, feature prioritization, user experience flows, acceptance criteria, risk assessment, go-to-market strategy, stakeholder management, and timeline. Document now serves as complete PRD + Technical Guide. |
| 3.1 | 2024 | Enhanced with monitoring, health checks, performance optimization, comprehensive troubleshooting, security hardening, backup/restore procedures, and testing strategy |
| 3.0 | 2024 | Added authentication, database, ECS deployment guide |
| 2.1 | 2024 | Added revision history and bug fixes |
| 2.0 | 2024 | Complete rewrite based on current implementation |
| 1.0 | 2024 | Initial PRD |

---

**Document Status:** Active / 文档状态：活跃  
**Last Reviewed:** 2024 / 最后审查：2024  
**Next Review:** After deployment / 下次审查：部署后

---

## Quick Reference Checklist / 快速参考清单

> Below is a step-by-step checklist for setting up and checking the English-Chinese Dictionary App.  
> For each point, I indicate whether I (your software/deployment helper) can guide you, automate, or do the step for you, or if it's something you must handle directly.

- Tasks marked **[I can help/do]**: I can automate, provide scripts, or walk you through it remotely.
- Tasks marked **[You/Your team]**: These generally require your input (like cloud credentials, buying domains, or hardware access).

If unsure on any step, just ask—I will clarify what I can do.

---

This page is meant as a step-by-step list for deploying and checking the English-Chinese Dictionary App. Each step explains in simple terms what needs to be done and what it means. If you are not technical, use this as a guide and ask for help if you're unsure about any point.

---

### Before Deployment / 部署前

**You need to get everything ready before launching the app:**

- [ ] **ECS Instance is Ready:**  
  - "ECS" is a virtual computer in the cloud, where your app will run.  
  - Make sure you've created it, turned it on, and can access it.
- [ ] **Security Group Rules are Configured:**  
  - Security rules protect your server from unwanted visitors.  
  - Confirm these are set so only you (or your team) can access the server, and only necessary ports (like 80 or 443 for the website) are open.
- [ ] **All API Keys are Obtained:**  
  - "API keys" are like special passwords needed for certain services (such as dictionary, images, or AI).  
  - Make sure you have all these keys somewhere safe—ask your developer where to put them.
- [ ] **Domain Name is Set Up (Optional):**  
  - If you want a custom web address (like www.mydictionary.com), make sure you have bought the domain and it's pointing to your server/IP address.
- [ ] **SSH Access is Tested:**  
  - "SSH" means remote login to your server (like TeamViewer for computers, but for servers).  
  - Make sure you or your technical helper can connect remotely to your server, so you can fix things if something breaks.

---

### During Deployment / 部署期间

**These steps set up the app on your server. Some may require technical help, but here is what each step means:**

- [ ] **Node.js is Installed:**  
  - Node.js is software needed to run the app.  
  - Ensure it's on the server (your developer can check: `node -v`).
- [ ] **PostgreSQL is Installed and Database is Created:**  
  - PostgreSQL is where your app keeps all user and word data.  
  - Confirm it’s installed, and a database is created for the app.
- [ ] **Nginx is Installed and Configured:**  
  - Nginx is the "traffic controller" for your website: it directs visitors to your app and helps with security.  
  - Confirm it’s installed and running.
- [ ] **Application is Cloned and Dependencies are Installed:**  
  - "Cloned" means copying the app's files/code onto the server (usually from GitHub or similar).  
  - "Dependencies" are other tools the app needs—usually installed with a single command.
- [ ] **Environment Variables are Set:**  
  - These are secret settings—like API keys and passwords.  
  - Confirm they are set up in a `.env` file (ask your developer).
- [ ] **Database Migrations are Run:**  
  - This prepares the database with the correct tables and structures for your app.  
  - Developer usually runs a command to do this.
- [ ] **Application is Built:**  
  - Building makes your app ready to be launched publicly (compiling all the code).  
  - Developer runs `npm run build` or similar.
- [ ] **PM2 is Set Up and App is Started:**  
  - PM2 is a tool to keep your app running, even if the server restarts.  
  - Make sure the app is launched using PM2, so it’s always online.
- [ ] **Nginx Reverse Proxy is Configured:**  
  - This step connects Nginx to your app so people can visit your domain and see your site.  
  - Developer creates a Nginx config file for your app.
- [ ] **SSL Certificate is Installed (If Using Domain):**  
  - SSL gives your website the green lock and allows "https://" (secure browsing).  
  - Use free services like Let's Encrypt, if needed.

---

### After Deployment / 部署后

**Once the app is live, check that everything works properly. Here’s what to check (no technical language):**

- [ ] **Can You Reach the App in Your Web Browser?**  
  - Visit your website address—does the dictionary site appear?
- [ ] **Health Check Page Responds:**  
  - There should be a special URL (ask your developer) to check if the app is healthy.  
  - Visit it—if it says "ok," you're good.
- [ ] **User Registration Works:**  
  - Try signing up as a new user—make sure it works, and you get a confirmation if needed.
- [ ] **User Login Works:**  
  - Try logging in with your email and password.
- [ ] **User Session Persists:**  
  - Stay logged in, even after closing and reopening your browser.  
  - You shouldn't have to log in again right away.
- [ ] **Word Lookup Works in All Languages:**  
  - Use the search feature to look up words in every supported language.  
  - Confirm you get results.
- [ ] **Image Generation Works:**  
  - Check that word images show up correctly.
- [ ] **Audio Pronunciation Works:**  
  - Try listening to the word—does the audio play?
- [ ] **Notebook Features Work:**  
  - Save a word to your notebook, view it, and try deleting it.
- [ ] **Story Generation Works:**  
  - Use the feature to generate a story from words; check that it creates both the story and its translation.
- [ ] **Study Mode Works:**  
  - Try the "flashcard" or study feature. Make sure you can flip cards and hear audio.
- [ ] **Database Backup is Scheduled and Tested:**  
  - Confirm there is an automatic backup of your data, and if possible, test restoring from a backup.
- [ ] **Monitoring is Set Up:**  
  - There should be tools in place (like PM2 or health check pages) that let you know if the app is having problems.
- [ ] **Log Rotation is Working:**  
  - App "logs" are like a history of what happened. They should not grow too large.  
  - Make sure these are being regularly cleaned up or cycled.
- [ ] **Security Hardening is Done:**  
  - Check that all basic security steps (like changing default passwords) are done.  
  - Confirm firewalls are active and unnecessary ports are closed.
- [ ] **SSL Certificate is Installed (If Using Domain):**  
  - Make sure you see the green lock ("https://") on your website.
- [ ] **Performance Test Results are Recorded:**  
  - Check how fast the app loads, and write down any major problems or slowdowns.
- [ ] **Backup Restoration Was Tested:**  
  - Don't just schedule backups—try restoring the data to confirm it actually works.

If any of these steps are confusing or not working, ask your development team for help and refer to this list for clarity!


---

**End of Document / 文档结束**

