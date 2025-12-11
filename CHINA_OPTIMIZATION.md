# China Mainland Optimization Guide / 中国大陆优化指南

## Problem / 问题
Vercel's infrastructure is primarily in US/Europe, causing slow connections from China mainland due to:
- Great Firewall network routing
- Geographic distance
- External API blocks/slowness

Vercel 的基础设施主要在美国/欧洲，导致中国大陆连接缓慢，原因包括：
- 防火墙网络路由
- 地理距离
- 外部 API 被阻止/缓慢

## Solutions / 解决方案

### 1. Use China-Accessible Image Services / 使用中国可访问的图片服务

**Current Issue:** Unsplash API is slow/blocked in China
**当前问题：** Unsplash API 在中国缓慢/被阻止

**Solution:** Use China-based image services
**解决方案：** 使用中国图片服务

Options:
- 阿里云 OSS (Alibaba Cloud OSS)
- 腾讯云 COS (Tencent Cloud COS)
- 七牛云 (Qiniu Cloud)
- 或者使用本地生成的占位符

### 2. Add Aggressive Caching / 添加积极缓存

**Implementation:**
- Client-side caching (already implemented - 24 hours)
- Server-side caching for API responses
- Static page generation where possible
- CDN caching headers

### 3. Use Edge Functions / 使用边缘函数

Vercel Edge Functions can reduce latency by running closer to users.

### 4. Optimize External API Calls / 优化外部 API 调用

**Current APIs:**
- ✅ SiliconFlow (api.siliconflow.cn) - Already in China, good!
- ❌ Wikipedia - May be slow/blocked
- ❌ Unsplash - May be slow/blocked
- ⚠️ Supabase - May be slow from China

**Optimizations:**
- Add longer timeouts (already done)
- Add retry logic (already done)
- Use China-based alternatives where possible
- Cache API responses aggressively

### 5. Bundle Size Optimization / 打包大小优化

- Code splitting
- Tree shaking
- Lazy loading components
- Optimize images

### 6. Consider China-Specific Deployment / 考虑中国特定部署

For best performance in China, consider:
- Deploy to Aliyun ECS (阿里云 ECS)
- Use Aliyun CDN (阿里云 CDN)
- Use China-based database (阿里云 RDS)

### 7. Use China-Accessible CDN / 使用中国可访问的 CDN

Options:
- Aliyun CDN (阿里云 CDN)
- Tencent Cloud CDN (腾讯云 CDN)
- Cloudflare (limited China presence)

## Immediate Actions / 立即行动

1. ✅ Add timeouts to all external APIs (DONE)
2. ✅ Add retry logic (DONE)
3. 🔄 Replace Unsplash with China-based image service
4. 🔄 Add server-side caching
5. 🔄 Optimize bundle sizes
6. 🔄 Consider static generation for common pages

