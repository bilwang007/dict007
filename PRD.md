# Product Requirements Document (PRD)
# 产品需求文档

## AI Dictionary - Language Learning Application
## AI 词典 - 语言学习应用

---

## 1. Product Overview / 产品概述

### English
**Product Name:** AI Dictionary  
**Version:** 2.0  
**Last Updated:** 2024

AI Dictionary is an intelligent, AI-powered language learning tool that helps users learn new languages through interactive definitions, visual aids, audio pronunciation, and study tools. The application supports 10 popular languages and provides a seamless learning experience across web and mobile devices.

### 中文
**产品名称:** AI 词典  
**版本:** 2.0  
**最后更新:** 2024

AI 词典是一款智能的、AI 驱动的语言学习工具，通过交互式定义、视觉辅助、音频发音和学习工具帮助用户学习新语言。该应用支持 10 种流行语言，并在网页和移动设备上提供无缝的学习体验。

---

## 2. Core Features / 核心功能

### 2.1 Word Lookup / 单词查询

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

### 2.2 Notebook / 笔记本

#### English
- **Save Entries:** Save any lookup result to personal notebook
- **Entry Management:**
  - View all saved words
  - Delete entries
  - Replace existing entries with updated definitions
- **Smart Detection:** Automatically detects if word is already saved
- **Replace Prompt:** Asks user to replace when looking up saved words
- **Story Generation:** Generate stories using selected words to aid memorization
  - Story in target language
  - Translation in native language (toggleable)
  - Select All / Deselect All functionality

#### 中文
- **保存条目:** 将任何查询结果保存到个人笔记本
- **条目管理:**
  - 查看所有已保存的单词
  - 删除条目
  - 用更新的定义替换现有条目
- **智能检测:** 自动检测单词是否已保存
- **替换提示:** 查询已保存单词时询问是否替换
- **故事生成:** 使用选定的单词生成故事以帮助记忆
  - 目标语言的故事
  - 母语翻译（可切换）
  - 全选/取消全选功能

### 2.3 Study Mode / 学习模式

#### English
- **Flashcards:** Interactive flashcards with flip animation
- **Card Front:** Word in target language + image
- **Card Back:** Word + definition in native language + example sentence
- **Translation Toggle:** One-click toggle to show/hide example sentence translation
- **Navigation:** Previous/Next buttons and shuffle functionality
- **Progress Indicator:** Shows current card position
- **Audio Integration:** Play pronunciation without flipping card

#### 中文
- **抽认卡:** 带翻转动画的交互式抽认卡
- **卡片正面:** 目标语言单词 + 图片
- **卡片背面:** 单词 + 母语定义 + 例句
- **翻译切换:** 一键切换显示/隐藏例句翻译
- **导航:** 上一张/下一张按钮和随机播放功能
- **进度指示器:** 显示当前卡片位置
- **音频集成:** 播放发音而不翻转卡片

---

## 3. User Interface / 用户界面

### 3.1 Design System / 设计系统

#### English
- **Color Scheme:** Green/Emerald/Teal gradient theme
- **Layout:** Responsive design for mobile and desktop
- **Navigation:** Sticky top navigation bar with 3 modules (Lookup, Notebook, Study)
- **Language Selectors:**
  - Top position when no result (initial state)
  - Bottom position when result is displayed
  - Learning language (target) prominently displayed
  - Native language collapsible

#### 中文
- **配色方案:** 绿色/翠绿色/青绿色渐变主题
- **布局:** 移动端和桌面端响应式设计
- **导航:** 粘性顶部导航栏，包含 3 个模块（查询、笔记本、学习）
- **语言选择器:**
  - 无结果时位于顶部（初始状态）
  - 显示结果时位于底部
  - 学习语言（目标语言）突出显示
  - 母语可折叠

### 3.2 User Flow / 用户流程

#### English
1. **Initial State:**
   - Navigation bar at top
   - Language selectors at top
   - Lookup form in center
   - Header with app title

2. **After Lookup:**
   - Result appears immediately below navigation
   - Language selectors move to bottom
   - Compact lookup form below result for new searches
   - Save button shows status (blue = not saved, green = saved)

3. **Save Status:**
   - Blue button: "Save to Notebook" (clickable)
   - Green button: "Saved to Notebook" (disabled)
   - Yellow prompt: "Replace?" when word already exists

#### 中文
1. **初始状态:**
   - 顶部导航栏
   - 顶部语言选择器
   - 中央查询表单
   - 应用标题

2. **查询后:**
   - 结果立即显示在导航栏下方
   - 语言选择器移至底部
   - 结果下方紧凑的查询表单用于新搜索
   - 保存按钮显示状态（蓝色 = 未保存，绿色 = 已保存）

3. **保存状态:**
   - 蓝色按钮："保存到笔记本"（可点击）
   - 绿色按钮："已保存到笔记本"（禁用）
   - 黄色提示：单词已存在时显示"替换？"

---

## 4. Technical Requirements / 技术要求

### 4.1 Technology Stack / 技术栈

#### English
- **Framework:** Next.js 14+ with TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Storage:** localStorage (client-side)
- **AI Services:**
  - SiliconFlow API (primary)
  - OpenAI-compatible API
  - Unsplash API (images)
- **Audio:** Browser Web Speech API with API fallback

#### 中文
- **框架:** Next.js 14+ 与 TypeScript
- **样式:** Tailwind CSS
- **动画:** Framer Motion
- **存储:** localStorage（客户端）
- **AI 服务:**
  - SiliconFlow API（主要）
  - OpenAI 兼容 API
  - Unsplash API（图片）
- **音频:** 浏览器 Web Speech API，带 API 备用方案

### 4.2 Performance Requirements / 性能要求

#### English
- **Lookup Speed:** < 3 seconds for definition (image loads asynchronously)
- **Caching:** 24-hour client-side cache
- **Image Loading:** Non-blocking, loads after definition
- **Audio Latency:** < 500ms for browser TTS
- **Responsive:** Works on mobile (320px+) and desktop (1920px+)

#### 中文
- **查询速度:** 定义 < 3 秒（图片异步加载）
- **缓存:** 24 小时客户端缓存
- **图片加载:** 非阻塞，定义后加载
- **音频延迟:** 浏览器 TTS < 500ms
- **响应式:** 支持移动端（320px+）和桌面端（1920px+）

### 4.3 API Endpoints / API 端点

#### English
- `POST /api/lookup` - Word lookup (returns definition immediately, image loads separately)
- `POST /api/image` - Image generation (async)
- `POST /api/audio` - Audio generation (with browser TTS fallback)
- `POST /api/story` - Story generation from selected words

#### 中文
- `POST /api/lookup` - 单词查询（立即返回定义，图片单独加载）
- `POST /api/image` - 图片生成（异步）
- `POST /api/audio` - 音频生成（带浏览器 TTS 备用方案）
- `POST /api/story` - 从选定单词生成故事

---

## 5. User Stories / 用户故事

### 5.1 Lookup Flow / 查询流程

#### English
**As a language learner, I want to:**
1. Look up words in my target language and see definitions in both target and native languages
2. See visual representations of words to aid memory
3. Hear pronunciation without leaving the page
4. Save interesting words for later review
5. Replace outdated definitions when I look up saved words again

#### 中文
**作为语言学习者，我希望:**
1. 查询目标语言的单词，看到目标语言和母语的双语定义
2. 看到单词的视觉表示以帮助记忆
3. 在不离开页面的情况下听到发音
4. 保存有趣的单词以供日后复习
5. 再次查询已保存单词时替换过时的定义

### 5.2 Study Flow / 学习流程

#### English
**As a language learner, I want to:**
1. Review saved words as flashcards
2. See images and definitions to reinforce learning
3. Toggle translations for example sentences
4. Navigate through cards easily
5. Shuffle cards for varied practice

#### 中文
**作为语言学习者，我希望:**
1. 以抽认卡形式复习已保存的单词
2. 看到图片和定义以加强学习
3. 切换例句的翻译
4. 轻松浏览卡片
5. 随机播放卡片以进行多样化练习

### 5.3 Notebook Flow / 笔记本流程

#### English
**As a language learner, I want to:**
1. View all my saved words in one place
2. Generate stories from selected words to aid memorization
3. Delete words I no longer need
4. See stories in target language with toggleable translations

#### 中文
**作为语言学习者，我希望:**
1. 在一个地方查看所有已保存的单词
2. 从选定的单词生成故事以帮助记忆
3. 删除不再需要的单词
4. 看到目标语言的故事，带可切换的翻译

---

## 6. Keyboard Shortcuts / 键盘快捷键

#### English
- **Enter:** Save word to notebook (or replace if prompt is showing)
- **Enter (in lookup form):** Submit lookup

#### 中文
- **Enter:** 保存单词到笔记本（或如果显示提示则替换）
- **Enter（在查询表单中）:** 提交查询

---

## 7. Data Model / 数据模型

### 7.1 NotebookEntry / 笔记本条目

#### English
```typescript
{
  id: string
  word: string
  targetLanguage: string
  nativeLanguage: string
  definition: string (native language)
  definitionTarget: string (target language)
  imageUrl?: string
  exampleSentence1: string
  exampleSentence2: string
  exampleTranslation1: string
  exampleTranslation2: string
  usageNote: string
  createdAt: string
}
```

#### 中文
```typescript
{
  id: string
  word: string
  targetLanguage: string
  nativeLanguage: string
  definition: string (母语)
  definitionTarget: string (目标语言)
  imageUrl?: string
  exampleSentence1: string
  exampleSentence2: string
  exampleTranslation1: string
  exampleTranslation2: string
  usageNote: string
  createdAt: string
}
```

### 7.2 Story / 故事

#### English
```typescript
{
  id: string
  content: string (target language)
  translation: string (native language)
  wordsUsed: string[] (entry IDs)
  createdAt: string
}
```

#### 中文
```typescript
{
  id: string
  content: string (目标语言)
  translation: string (母语)
  wordsUsed: string[] (条目 ID)
  createdAt: string
}
```

---

## 8. Future Enhancements / 未来增强功能

### English
1. **Spaced Repetition:** Algorithm-based review scheduling
2. **Progress Tracking:** Statistics on words learned
3. **Export/Import:** Backup notebook data
4. **Offline Mode:** Service worker for offline access
5. **Voice Input:** Speech-to-text for lookups
6. **Quiz Mode:** Multiple choice and fill-in-the-blank exercises
7. **Social Features:** Share words and stories
8. **More Languages:** Expand beyond 10 languages

### 中文
1. **间隔重复:** 基于算法的复习计划
2. **进度跟踪:** 学习单词的统计数据
3. **导出/导入:** 备份笔记本数据
4. **离线模式:** 用于离线访问的服务工作者
5. **语音输入:** 语音转文字查询
6. **测验模式:** 多项选择和填空练习
7. **社交功能:** 分享单词和故事
8. **更多语言:** 扩展到 10 种以上语言

---

## 9. Success Metrics / 成功指标

### English
- **User Engagement:** Daily active users, words saved per user
- **Learning Effectiveness:** Words reviewed in Study mode
- **Performance:** Average lookup time, cache hit rate
- **User Satisfaction:** Feature usage rates, retention

### 中文
- **用户参与度:** 日活跃用户，每用户保存的单词数
- **学习效果:** 学习模式中复习的单词数
- **性能:** 平均查询时间，缓存命中率
- **用户满意度:** 功能使用率，留存率

---

## 10. Accessibility / 可访问性

### English
- Keyboard navigation support
- ARIA labels for screen readers
- High contrast mode support
- Responsive text sizing

### 中文
- 键盘导航支持
- 屏幕阅读器的 ARIA 标签
- 高对比度模式支持
- 响应式文本大小

---

## 11. Revision History & Bug Fixes / 修订历史和错误修复

### 11.1 Major Bugs Fixed / 主要错误修复

#### Bug #1: Notebook Page Blank / 笔记本页面空白
**English:**
- **Issue:** Notebook page showed blank screen after clicking "Notebook" button
- **Root Cause:** AI functions were being imported on client-side, causing API key errors
- **Solution:** 
  - Made API key check lazy and server-side only using proxy pattern
  - Moved `generateStory` call to API route `/api/story`
  - Updated notebook page to call API route instead of direct import
- **Status:** ✅ Fixed

**中文:**
- **问题:** 点击"笔记本"按钮后，笔记本页面显示空白屏幕
- **根本原因:** AI 函数在客户端被导入，导致 API 密钥错误
- **解决方案:**
  - 使用代理模式使 API 密钥检查延迟且仅在服务器端
  - 将 `generateStory` 调用移至 API 路由 `/api/story`
  - 更新笔记本页面以调用 API 路由而不是直接导入
- **状态:** ✅ 已修复

---

#### Bug #2: Images Not Displaying in Study and Notebook / 学习和笔记本中图片不显示
**English:**
- **Issue:** Images displayed in new lookups but not in saved entries (Study mode and Notebook)
- **Root Cause:** Next.js image optimization blocking external image sources
- **Solution:**
  - Added image domains to `next.config.js` remotePatterns (SiliconFlow, Unsplash)
  - Added `unoptimized` prop to Image components
  - Improved error handling for image loading
  - Added Unsplash API integration as primary image source
- **Status:** ✅ Fixed

**中文:**
- **问题:** 新查询中显示图片，但已保存条目（学习模式和笔记本）中不显示
- **根本原因:** Next.js 图片优化阻止外部图片源
- **解决方案:**
  - 在 `next.config.js` 的 remotePatterns 中添加图片域名（SiliconFlow、Unsplash）
  - 为 Image 组件添加 `unoptimized` 属性
  - 改进图片加载的错误处理
  - 添加 Unsplash API 集成作为主要图片源
- **状态:** ✅ 已修复

---

#### Bug #3: Story Language Incorrect / 故事语言错误
**English:**
- **Issue:** Generated stories appeared in Chinese (native language) instead of target language
- **Root Cause:** AI prompt not explicit enough about language requirements
- **Solution:**
  - Enhanced `generateStory` prompt with "CRITICAL LANGUAGE REQUIREMENTS" section
  - Added explicit "DO NOT" instructions
  - Ensured `targetLanguage` parameter is correctly passed through API chain
  - Added numbered requirements for clarity
- **Status:** ✅ Fixed

**中文:**
- **问题:** 生成的故事显示为中文（母语）而不是目标语言
- **根本原因:** AI 提示对语言要求不够明确
- **解决方案:**
  - 在 `generateStory` 提示中增强"关键语言要求"部分
  - 添加明确的"不要"指令
  - 确保 `targetLanguage` 参数正确传递通过 API 链
  - 添加编号要求以提高清晰度
- **状态:** ✅ 已修复

---

#### Bug #4: Definition Display Incorrect / 定义显示错误
**English:**
- **Issue:** Definitions showed only in native language, missing target language definition
- **Root Cause:** 
  - `definitionTarget` field not included in API response
  - Notebook entries missing `definitionTarget` field
- **Solution:**
  - Added `definitionTarget` to LookupResult interface
  - Updated `/api/lookup` to include `definitionTarget` in response
  - Updated `NotebookEntry` interface to include optional `definitionTarget`
  - Modified `ResultCard` and `NotebookItem` to display both definitions (target first, then native)
  - Enhanced AI prompt to explicitly generate both definitions
- **Status:** ✅ Fixed

**中文:**
- **问题:** 定义仅显示母语，缺少目标语言定义
- **根本原因:**
  - API 响应中未包含 `definitionTarget` 字段
  - 笔记本条目缺少 `definitionTarget` 字段
- **解决方案:**
  - 在 LookupResult 接口中添加 `definitionTarget`
  - 更新 `/api/lookup` 以在响应中包含 `definitionTarget`
  - 更新 `NotebookEntry` 接口以包含可选的 `definitionTarget`
  - 修改 `ResultCard` 和 `NotebookItem` 以显示两个定义（先目标语言，后母语）
  - 增强 AI 提示以明确生成两个定义
- **状态:** ✅ 已修复

---

#### Bug #5: Audio Not Working / 音频不工作
**English:**
- **Issue:** Audio playback failed completely
- **Root Cause:** SiliconFlow API doesn't support audio generation the same way as OpenAI
- **Solution:**
  - Implemented browser Web Speech API as primary audio source
  - Added API fallback that gracefully handles failures
  - Created language mapping for browser TTS
  - Updated AudioPlayer component with dual-mode support
  - Added proper error handling and fallback chain
- **Status:** ✅ Fixed

**中文:**
- **问题:** 音频播放完全失败
- **根本原因:** SiliconFlow API 不支持与 OpenAI 相同的音频生成方式
- **解决方案:**
  - 实现浏览器 Web Speech API 作为主要音频源
  - 添加优雅处理失败的 API 备用方案
  - 为浏览器 TTS 创建语言映射
  - 使用双模式支持更新 AudioPlayer 组件
  - 添加适当的错误处理和备用链
- **状态:** ✅ 已修复

---

#### Bug #6: Lookup Speed Too Slow / 查询速度太慢
**English:**
- **Issue:** Word lookups took too long, poor user experience
- **Root Cause:** Image generation blocking API response
- **Solution:**
  - Made image generation non-blocking (returns definition immediately)
  - Created separate `/api/image` endpoint for async image loading
  - Implemented 24-hour client-side caching
  - Optimized AI parameters (lower temperature, max_tokens limit)
  - Images now load asynchronously after definition is displayed
- **Status:** ✅ Fixed
- **Performance Improvement:** ~50-70% faster first lookup, instant for cached words

**中文:**
- **问题:** 单词查询耗时过长，用户体验差
- **根本原因:** 图片生成阻塞 API 响应
- **解决方案:**
  - 使图片生成非阻塞（立即返回定义）
  - 创建单独的 `/api/image` 端点用于异步图片加载
  - 实现 24 小时客户端缓存
  - 优化 AI 参数（降低温度，限制最大令牌数）
  - 图片现在在定义显示后异步加载
- **状态:** ✅ 已修复
- **性能改进:** 首次查询快约 50-70%，缓存单词即时显示

---

#### Bug #7: Flashcard Audio Button Flips Card / 抽认卡音频按钮翻转卡片
**English:**
- **Issue:** Clicking audio button on flashcard caused card to flip instead of playing audio
- **Root Cause:** Event propagation not stopped on audio button
- **Solution:**
  - Added `stopPropagation()` and `preventDefault()` to AudioPlayer button
  - Added event stopping on wrapper div in Flashcard component
  - Added `onMouseDown` handler to prevent any card interaction
- **Status:** ✅ Fixed

**中文:**
- **问题:** 点击抽认卡上的音频按钮导致卡片翻转而不是播放音频
- **根本原因:** 音频按钮上未停止事件传播
- **解决方案:**
  - 在 AudioPlayer 按钮上添加 `stopPropagation()` 和 `preventDefault()`
  - 在 Flashcard 组件的包装 div 上添加事件停止
  - 添加 `onMouseDown` 处理程序以防止任何卡片交互
- **状态:** ✅ 已修复

---

#### Bug #8: Enter Key Not Working for Replace / Enter 键不能用于替换
**English:**
- **Issue:** Enter key saved new words but didn't trigger replace when prompt was showing
- **Root Cause:** Enter key handler didn't check for replace prompt state
- **Solution:**
  - Updated Enter key handler to detect `showReplacePrompt` and `saveStatus === 'exists'`
  - Added conditional logic to trigger replace when prompt is visible
  - Maintained backward compatibility for normal save functionality
- **Status:** ✅ Fixed

**中文:**
- **问题:** Enter 键保存新单词，但在显示提示时不会触发替换
- **根本原因:** Enter 键处理程序未检查替换提示状态
- **解决方案:**
  - 更新 Enter 键处理程序以检测 `showReplacePrompt` 和 `saveStatus === 'exists'`
  - 添加条件逻辑以在提示可见时触发替换
  - 保持正常保存功能的向后兼容性
- **状态:** ✅ 已修复

---

### 11.2 UI/UX Improvements / UI/UX 改进

#### Improvement #1: Color Scheme Update / 配色方案更新
**English:**
- **Change:** Changed entire UI from purple/pink theme to green/emerald/teal gradient
- **Files Updated:** All page components, navigation, buttons, cards
- **Status:** ✅ Completed

**中文:**
- **更改:** 将整个 UI 从紫色/粉色主题更改为绿色/翠绿色/青绿色渐变
- **更新的文件:** 所有页面组件、导航、按钮、卡片
- **状态:** ✅ 已完成

---

#### Improvement #2: Layout Optimization / 布局优化
**English:**
- **Change:** Improved responsive layout for mobile and desktop
- **Details:**
  - Language selectors move from top to bottom after lookup
  - Results appear immediately without scrolling
  - Compact lookup form when result is displayed
  - Better spacing and alignment across breakpoints
- **Status:** ✅ Completed

**中文:**
- **更改:** 改进移动端和桌面端的响应式布局
- **详情:**
  - 查询后语言选择器从顶部移至底部
  - 结果立即显示，无需滚动
  - 显示结果时使用紧凑的查询表单
  - 跨断点更好的间距和对齐
- **状态:** ✅ 已完成

---

#### Improvement #3: Save Status Indicators / 保存状态指示器
**English:**
- **Change:** Visual feedback for save status
- **Details:**
  - Blue button: Not saved (clickable)
  - Green button: Saved (disabled)
  - Yellow prompt: Word exists, ask to replace
  - Inline notifications instead of alerts
- **Status:** ✅ Completed

**中文:**
- **更改:** 保存状态的视觉反馈
- **详情:**
  - 蓝色按钮：未保存（可点击）
  - 绿色按钮：已保存（禁用）
  - 黄色提示：单词存在，询问是否替换
  - 内联通知而不是警报
- **状态:** ✅ 已完成

---

### 11.3 Performance Optimizations / 性能优化

#### Optimization #1: Non-blocking Image Loading / 非阻塞图片加载
**English:**
- **Change:** Images load asynchronously after definition
- **Impact:** Definition appears 2-3 seconds faster
- **Status:** ✅ Completed

**中文:**
- **更改:** 图片在定义后异步加载
- **影响:** 定义显示快 2-3 秒
- **状态:** ✅ 已完成

---

#### Optimization #2: Client-side Caching / 客户端缓存
**English:**
- **Change:** 24-hour localStorage cache for lookup results
- **Impact:** Repeated lookups are instant (no API call)
- **Status:** ✅ Completed

**中文:**
- **更改:** 查询结果的 24 小时 localStorage 缓存
- **影响:** 重复查询即时显示（无需 API 调用）
- **状态:** ✅ 已完成

---

#### Optimization #3: AI Parameter Tuning / AI 参数调整
**English:**
- **Change:** Lowered temperature from 0.7 to 0.5, added max_tokens limit
- **Impact:** Faster, more consistent AI responses
- **Status:** ✅ Completed

**中文:**
- **更改:** 将温度从 0.7 降低到 0.5，添加最大令牌数限制
- **影响:** 更快、更一致的 AI 响应
- **状态:** ✅ 已完成

---

## Document Version History / 文档版本历史

| Version | Date | Changes |
|---------|------|---------|
| 2.1 | 2024 | Added revision history and bug fixes documentation |
| 2.0 | 2024 | Complete rewrite based on current implementation |
| 1.0 | 2024 | Initial PRD |

---

**Document Status:** Active / 文档状态：活跃  
**Last Reviewed:** 2024 / 最后审查：2024  
**Total Bugs Fixed:** 8 / 已修复错误总数：8  
**Total Improvements:** 3 / 总改进数：3

