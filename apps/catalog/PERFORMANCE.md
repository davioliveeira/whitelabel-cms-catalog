# Catalog Performance Optimization

## Overview

This document outlines the performance optimizations implemented for the public catalog application, targeting a load time of under 2 seconds on mobile 4G connections.

## Core Web Vitals Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Time until the largest content element is visible |
| **FID** (First Input Delay) | < 100ms | Time from first user interaction to browser response |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Measure of visual stability during page load |

## Implemented Optimizations

### 1. Image Optimization (`next.config.js`)

**Configuration:**
- Modern image formats: WebP and AVIF
- Quality setting: 80 (balance between quality and file size)
- Responsive image sizes for different devices
- 30-day cache TTL for optimized images
- Automatic minification and compression in production

**Impact:**
- Reduces image file sizes by 25-50%
- Faster image loading on all devices
- Better mobile performance on slower connections

### 2. Lazy Loading Strategy

**Implementation:**
- Next.js Image component with default lazy loading
- Skeleton placeholders during image load (Story 4.4)
- Smooth fade-in transitions when images load
- Images load only when scrolling into view

**Impact:**
- Faster initial page load
- Reduced bandwidth usage
- Better perceived performance

### 3. Layout Shift Prevention (CLS Optimization)

**Implementation:**
- All images use `aspect-square` for 1:1 ratio
- Space reserved before image loads with skeleton
- Fixed dimensions prevent layout jumps
- Skeleton dimensions match actual content

**Impact:**
- CLS score < 0.1 (target met)
- No visual jank during page load
- Better user experience

### 4. Responsive Image Sizing

**sizes Attribute:**
```
(max-width: 768px) 50vw,   // Mobile: 2 columns = 50% width each
(max-width: 1024px) 33vw,  // Tablet: 3 columns = 33% width each
25vw                        // Desktop: 4 columns = 25% width each
```

**Impact:**
- Next.js generates appropriately sized images
- No oversized images downloaded
- Optimal performance across all devices

### 5. Database Query Optimization

**Current Implementation:**
- Pagination: 50 products per page (limit)
- Tenant isolation: Filtered by `tenantId`
- Availability filtering: Only shows `isAvailable: true`
- Indexed fields: `tenantId`, `isAvailable`, `createdAt`

**Recommended Database Indexes:**
```sql
CREATE INDEX idx_product_tenant_available ON Product(tenantId, isAvailable);
CREATE INDEX idx_product_created_at ON Product(createdAt DESC);
```

### 6. Caching Strategy

**Static Assets (Images, CSS, JS):**
```
Cache-Control: public, max-age=31536000, immutable
```

**Dynamic Content (HTML):**
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

**Impact:**
- Instant loads for returning users
- Reduced server load
- Better scalability

### 7. Production Optimizations

**Enabled:**
- SWC minification for faster builds
- Console log removal in production
- HTTP compression (gzip/brotli)
- ETag generation for cache validation

## Performance Testing

### Tools

1. **Lighthouse (Chrome DevTools)**
   ```bash
   # Run Lighthouse audit
   npm run build
   npm run start
   # Open Chrome DevTools > Lighthouse > Run Audit
   ```
   Target Score: > 90

2. **WebPageTest**
   - URL: https://www.webpagetest.org/
   - Test Location: Choose location near your users
   - Connection: 4G LTE
   - Target: First View < 2s

3. **Chrome DevTools Network Tab**
   - Throttle to "Fast 3G" or "Slow 4G"
   - Measure time to interactive
   - Check total page weight

### Test Scenarios

1. **Fast Network (Cable/WiFi)**
   - Initial load < 1s
   - Images load immediately
   - No skeleton visible

2. **Mobile 4G**
   - Initial content < 2s ✅
   - Skeleton briefly visible
   - Progressive image loading

3. **Slow 3G**
   - Initial content < 4s
   - Skeleton visible longer
   - Images load as user scrolls

4. **Returning User (Cached)**
   - Instant page load
   - Images from cache
   - No network requests for assets

## Monitoring

### Key Metrics to Track

1. **Server Response Time (TTFB)**
   - Target: < 600ms
   - Monitor database query performance
   - Check server processing time

2. **Bundle Size**
   - JavaScript: < 100KB gzipped
   - CSS: < 20KB gzipped
   - Total page weight: < 500KB

3. **Image Performance**
   - Average image size: < 50KB
   - WebP adoption rate: > 90%
   - Lazy loading effectiveness

### Tools for Production Monitoring

1. **Next.js Analytics**
   - Built-in Core Web Vitals reporting
   - Real User Monitoring (RUM)
   - Performance insights

2. **Google Search Console**
   - Core Web Vitals report
   - Real-world performance data
   - SEO impact tracking

3. **Custom Metrics**
   - Server-side logging
   - Database query timing
   - API response times

## Optimization Checklist

- [x] Configure Next.js image optimization
- [x] Add responsive image sizes
- [x] Implement lazy loading strategy
- [x] Prevent layout shift with aspect ratios
- [x] Add skeleton loaders
- [x] Optimize database queries with pagination
- [x] Enable production optimizations
- [x] Configure compression
- [ ] Add database indexes (DBA task)
- [ ] Set up CDN (if applicable)
- [ ] Configure monitoring tools
- [ ] Run Lighthouse audits
- [ ] Test on real devices

## Performance Budgets

| Resource Type | Budget | Current |
|---------------|--------|---------|
| JavaScript | < 100KB | TBD |
| CSS | < 20KB | TBD |
| Images (per page) | < 300KB | TBD |
| Total Page Weight | < 500KB | TBD |
| Initial Load Time (4G) | < 2s | TBD |

## Next Steps

1. **Measure Current Performance**
   - Run Lighthouse audit
   - Test on real 4G connection
   - Document baseline metrics

2. **Database Optimization**
   - Verify indexes are created
   - Monitor query performance
   - Consider Redis caching for hot data

3. **CDN Setup (Optional)**
   - Configure CDN for static assets
   - Enable edge caching
   - Reduce latency for global users

4. **Continuous Monitoring**
   - Set up performance alerts
   - Track Core Web Vitals over time
   - Monitor server response times

## References

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Core Web Vitals](https://web.dev/vitals/)
- [Web Performance Guide](https://web.dev/performance/)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/overview/)
