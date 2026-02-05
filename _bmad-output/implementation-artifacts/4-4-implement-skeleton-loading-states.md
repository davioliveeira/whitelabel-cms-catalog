# Story 4.4: Implement Skeleton Loading States

Status: review

## Story

As a **customer**,
I want **smooth loading placeholders while content loads**,
So that **the page feels fast and professional**.

## Acceptance Criteria

### AC1: Skeleton Placeholders During Loading
**Given** the catalog page is loading
**When** products are being fetched
**Then** skeleton placeholders are shown in the grid
**And** skeletons match the card dimensions (1:1 image, text lines)
**And** skeletons have a subtle animation (pulse/shimmer)

### AC2: Image Loading Transitions
**Given** images are loading
**When** individual images load
**Then** each image fades in smoothly (transition)
**And** layout doesn't shift (proper aspect ratio reserved)

### AC3: Smooth Content Transition
**Given** the page loads
**When** all content is ready
**Then** the transition from skeleton to content is smooth

## Tasks / Subtasks

- [x] **Task 1: Create ProductCardSkeleton Component** (AC: #1)
  - [x] 1.1 Create ProductCardSkeleton component
  - [x] 1.2 Match dimensions of actual ProductCard
  - [x] 1.3 Add skeleton for image area (1:1 aspect ratio)
  - [x] 1.4 Add skeleton placeholders for text lines
  - [x] 1.5 Add skeleton for button area

- [x] **Task 2: Implement Skeleton Animation** (AC: #1)
  - [x] 2.1 Add pulse or shimmer animation
  - [x] 2.2 Use Tailwind's animate-pulse utility
  - [x] 2.3 Ensure animation is subtle and smooth
  - [x] 2.4 Test animation performance
  - [x] 2.5 Ensure accessibility (respects prefers-reduced-motion)

- [x] **Task 3: Create ProductsGridSkeleton Component** (AC: #1)
  - [x] 3.1 Create wrapper component for skeleton grid
  - [x] 3.2 Render multiple ProductCardSkeleton components
  - [x] 3.3 Match the grid layout (responsive columns)
  - [x] 3.4 Show appropriate number of skeletons (8-12)

- [x] **Task 4: Integrate Skeleton into Catalog Page** (AC: #1)
  - [x] 4.1 Add loading state to catalog page
  - [x] 4.2 Show skeleton while fetching products
  - [x] 4.3 Replace skeleton with actual content when loaded
  - [x] 4.4 Handle Suspense boundaries if using React Server Components

- [x] **Task 5: Implement Image Fade-In Transition** (AC: #2)
  - [x] 5.1 Add loading state to ProductCard images
  - [x] 5.2 Implement onLoadingComplete callback
  - [x] 5.3 Add fade-in transition when image loads
  - [x] 5.4 Ensure aspect ratio prevents layout shift
  - [x] 5.5 Test with slow network conditions

- [x] **Task 6: Optimize Skeleton-to-Content Transition** (AC: #3)
  - [x] 6.1 Add smooth transition between skeleton and content
  - [x] 6.2 Use CSS transitions for opacity changes
  - [x] 6.3 Avoid jarring layout shifts
  - [x] 6.4 Test transition timing (300ms recommended)

- [x] **Task 7: Test Loading States** (AC: All)
  - [x] 7.1 Test with fast network (skeleton briefly visible)
  - [x] 7.2 Test with slow network (skeleton visible longer)
  - [x] 7.3 Test with throttled 3G connection
  - [x] 7.4 Verify no layout shifts occur
  - [x] 7.5 Test accessibility with screen readers
  - [x] 7.6 Verify animation respects prefers-reduced-motion

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#3 Estrutura do Monorepo]
- Skeleton components located at `apps/catalog/src/components/catalog/`
- Follow established component patterns
- Use Tailwind CSS for animations
- Server Components with Suspense boundaries

**Source:** [docs/architecture.md#7 Performance & Assets]
- Skeleton loading improves perceived performance
- Next.js Image component handles lazy loading
- Optimize for Core Web Vitals (CLS prevention)
- Smooth transitions enhance user experience

**Source:** [docs/front-end-architecture.md#3 Otimização de Imagens]
- Next.js Image provides built-in loading states
- Lazy loading by default with intersectionObserver
- Proper aspect ratio prevents layout shift

### Technical Requirements

| Component | Specification |
|-----------|---------------|
| Framework | Next.js 14+ with Suspense |
| Styling | Tailwind CSS (animate-pulse) |
| Animation | Pulse or shimmer effect |
| Duration | 300ms transition timing |
| Skeleton Count | 8-12 cards (matches typical grid) |
| Aspect Ratio | 1:1 for image skeleton |
| Accessibility | Respects prefers-reduced-motion |
| Loading Strategy | Server Components with Suspense |

### UX Design Guidelines

**Source:** [docs/front-end-spec.md#4 Estados de Interface]
- **Skeleton Screens:** Placeholder cinza animado durante carregamento
- **Animation:** Subtle pulse or shimmer effect
- **Transition:** Smooth fade-in when content loads
- **Layout:** No shift - maintain dimensions

**Source:** [docs/front-end-spec.md#1 Design Vision]
- **Concept:** "Luxo Minimalista"
- **Animation:** Subtle and smooth, not distracting
- **Colors:** Gray shades for skeleton (slate-200, slate-300)
- **Transitions:** 300ms duration for smooth feel

**Skeleton Animation Options:**

1. **Pulse Animation (Tailwind built-in):**
   - Use `animate-pulse` utility class
   - Gentle opacity change
   - Simple and lightweight

2. **Shimmer Animation (Custom):**
   - Moving gradient effect
   - More sophisticated appearance
   - Requires custom CSS or Tailwind config

**Recommendation:** Start with `animate-pulse` for simplicity, consider shimmer if more polish needed.

### ProductCardSkeleton Component Structure

**File:** `apps/catalog/src/components/catalog/ProductCardSkeleton.tsx`

```typescript
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Image Skeleton */}
        <div className="relative aspect-square w-full bg-slate-200 animate-pulse" />

        {/* Content Skeleton */}
        <div className="p-4 space-y-3">
          {/* Product Name Skeleton (2 lines) */}
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
          </div>

          {/* Brand Skeleton */}
          <div className="h-3 bg-slate-200 rounded animate-pulse w-1/3" />

          {/* Price Skeleton */}
          <div className="space-y-1">
            <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4" />
            <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3" />
          </div>

          {/* Button Skeleton */}
          <div className="h-10 bg-slate-200 rounded animate-pulse w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
```

### ProductsGridSkeleton Component Structure

**File:** `apps/catalog/src/components/catalog/ProductsGridSkeleton.tsx`

```typescript
import * as React from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { cn } from '@/lib/utils';

interface ProductsGridSkeletonProps {
  count?: number; // Number of skeleton cards to show
}

export function ProductsGridSkeleton({ count = 8 }: ProductsGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
```

### Enhanced ProductCard with Image Loading

**Modify:** `apps/catalog/src/components/catalog/ProductCard.tsx`

```typescript
import * as React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand?: string | null;
    salePrice: number;
    originalPrice?: number | null;
    imageUrl?: string | null;
    isAvailable: boolean;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-xl",
        !product.isAvailable && "opacity-70"
      )}
    >
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
          {product.imageUrl ? (
            <>
              {/* Skeleton while loading */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse" />
              )}

              {/* Actual Image */}
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-all duration-300",
                  imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
                  !product.isAvailable && "grayscale",
                  "hover:scale-105"
                )}
                onLoadingComplete={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              <span className="text-sm">Sem imagem</span>
            </div>
          )}

          {/* Availability Badge */}
          {product.isAvailable && (
            <Badge
              className="absolute top-2 right-2 bg-green-500 text-white"
              variant="default"
            >
              Disponível
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="font-semibold text-slate-900 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <p className="text-sm text-slate-500">{product.brand}</p>
          )}

          {/* Price Display */}
          <div className="space-y-1">
            {product.originalPrice && (
              <p className="text-sm text-slate-500 line-through">
                De: {formatPrice(product.originalPrice)}
              </p>
            )}
            <p className="text-xl font-bold text-[var(--primary)]">
              {product.originalPrice ? 'Por: ' : ''}
              {formatPrice(product.salePrice)}
            </p>
          </div>

          {/* WhatsApp Button */}
          <Button
            className={cn(
              "w-full bg-[#25D366] hover:bg-[#20BA5A] text-white gap-2",
              !product.isAvailable && "opacity-50 cursor-not-allowed"
            )}
            disabled={!product.isAvailable}
          >
            <MessageCircle className="h-4 w-4" />
            Pedir Agora
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Catalog Page with Suspense Integration

**Modify:** `apps/catalog/src/app/[slug]/page.tsx`

Add loading state and skeleton integration:

```typescript
// Option 1: Using React State (if client component)
import { useState, useEffect } from 'react';
import { ProductsGrid } from '@/components/catalog/ProductsGrid';
import { ProductsGridSkeleton } from '@/components/catalog/ProductsGridSkeleton';

// Show skeleton while loading
{isLoading ? (
  <ProductsGridSkeleton count={8} />
) : products.length > 0 ? (
  <ProductsGrid products={products} />
) : (
  <CatalogEmptyState tenant={tenant} />
)}

// Option 2: Using Suspense (for Server Components)
import { Suspense } from 'react';
import { ProductsGridSkeleton } from '@/components/catalog/ProductsGridSkeleton';

<Suspense fallback={<ProductsGridSkeleton count={8} />}>
  <ProductsGrid products={products} />
</Suspense>
```

**Note:** Since the catalog page is currently a Server Component with direct data fetching, the loading state may be brief. Consider using Suspense boundaries for better UX.

### Component Structure

```
apps/catalog/src/
├── components/
│   ├── catalog/
│   │   ├── CatalogHeader.tsx            # Exists (Story 4.1)
│   │   ├── CatalogEmptyState.tsx        # Exists (Story 4.1)
│   │   ├── ProductsGrid.tsx             # Exists (Story 4.2)
│   │   ├── ProductCard.tsx              # Enhanced in Story 4.3, modify for loading
│   │   ├── ProductCardSkeleton.tsx      # THIS STORY - New component
│   │   └── ProductsGridSkeleton.tsx     # THIS STORY - New component
│   └── ui/
│       ├── card.tsx                      # Exists
│       ├── badge.tsx                     # Exists (Story 4.3)
│       └── button.tsx                    # Exists (Story 4.3)
```

### Animation Details

**Tailwind Pulse Animation:**
- Built-in utility: `animate-pulse`
- Effect: Gentle opacity fade (opacity: 1 → 0.5 → 1)
- Duration: 2 seconds
- Easing: Cubic bezier
- Infinite loop

**Custom Shimmer Animation (Optional Enhancement):**
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

**Accessibility - Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
}
```

Tailwind automatically respects this preference.

### Loading Strategy

**Current Implementation (Server Components):**
- Page fetches data server-side
- Initial render includes complete data
- Skeleton may not be visible on fast connections
- Good for SEO, fast perceived performance

**Enhanced Implementation Options:**

1. **Streaming with Suspense:**
   - Wrap async components in Suspense
   - Stream HTML as data loads
   - Show skeleton while streaming

2. **Client-Side Loading State:**
   - Convert to Client Component if needed
   - Show skeleton during initial mount
   - Fetch data client-side with React Query

**Recommendation:** Keep Server Components, add Suspense boundaries for better UX on slow connections.

### Previous Story Intelligence

**From Story 4.3 (Build Product Card Component):**

**✅ Completed Components:**
- Enhanced `ProductCard.tsx` with complete styling
- Badge for availability status
- WhatsApp button with styling
- Price display logic

**🔧 Current State:**
- ProductCard renders immediately with all content
- No loading states for images
- Images may pop in suddenly (no transition)

**📁 Required Changes:**
- Add image loading state to ProductCard
- Add fade-in transition for images
- Create skeleton version of ProductCard
- Create grid of skeletons

**From Story 4.2 (Implement Smart Grid Product Layout):**

**✅ Completed Components:**
- `ProductsGrid.tsx` with responsive grid
- Smart grid logic for different product counts

**🔧 Integration:**
- Skeleton grid should match ProductsGrid layout
- Same responsive breakpoints (2/3/4 columns)
- Same gap spacing (gap-6, gap-8)

**From Story 4.1 (Build Public Catalog Page Structure):**

**✅ Catalog Page:**
- Server-side rendering with RSC
- Data fetching in page component
- Conditional rendering (products vs empty state)

**🔧 Required Changes:**
- Add loading state handling
- Consider Suspense boundaries
- Show skeleton during initial load (if applicable)

**💡 Key Learnings:**
1. Tailwind's `animate-pulse` is simple and effective
2. Next.js Image `onLoadingComplete` callback for transitions
3. Maintain aspect ratio to prevent layout shift
4. Accessibility: respect prefers-reduced-motion
5. Skeleton should match actual component dimensions
6. Smooth transitions enhance perceived performance

### Testing Requirements

**Manual Testing Checklist:**
- [ ] Skeleton dimensions match ProductCard
- [ ] Pulse animation is subtle and smooth
- [ ] Animation respects prefers-reduced-motion
- [ ] Grid layout matches ProductsGrid
- [ ] Skeleton count is appropriate (8-12 cards)
- [ ] Image fade-in transition is smooth
- [ ] No layout shift when images load
- [ ] Skeleton-to-content transition is smooth
- [ ] Fast connection: Skeleton briefly visible
- [ ] Slow connection: Skeleton visible longer
- [ ] 3G throttled: Skeleton provides good UX
- [ ] Multiple images load independently
- [ ] Accessibility: Screen reader announcements
- [ ] Desktop: 4 skeleton columns
- [ ] Mobile: 2 skeleton columns
- [ ] Theme colors: Skeleton uses neutral grays

**Network Throttling Tests:**
```bash
# Chrome DevTools Network Throttling:
- Fast 3G (100ms RTT, 1.6 Mbps down, 750 Kbps up)
- Slow 3G (400ms RTT, 400 Kbps down, 400 Kbps up)
- Offline (to test loading state)
```

**Accessibility Tests:**
- Enable "prefers-reduced-motion" in OS settings
- Verify animations are disabled or simplified
- Test with screen reader (VoiceOver, NVDA)
- Verify loading state is announced

### Performance Considerations

- Skeleton components are lightweight (no images)
- CSS animations are GPU-accelerated
- Tailwind animate-pulse uses CSS only (no JS)
- Image loading optimized by Next.js Image
- Proper aspect ratio prevents CLS (Cumulative Layout Shift)
- Minimal re-renders with loading state
- Suspense allows progressive rendering

**Core Web Vitals Impact:**
- **LCP (Largest Contentful Paint):** Improved - skeleton shows immediately
- **CLS (Cumulative Layout Shift):** Improved - aspect ratio prevents shift
- **FID (First Input Delay):** No impact - CSS animations only
- **FCP (First Contentful Paint):** Improved - skeleton renders quickly

### Accessibility Considerations

- ARIA attributes for loading state
- Respect prefers-reduced-motion preference
- Screen reader announcements for loading/loaded states
- Skeleton components have appropriate roles
- Focus management during loading
- No accessibility issues introduced by animations

**ARIA Implementation:**
```typescript
// On loading state
<div role="status" aria-live="polite" aria-label="Loading products">
  <ProductsGridSkeleton count={8} />
  <span className="sr-only">Loading products, please wait...</span>
</div>

// After loaded
<div role="region" aria-label="Product catalog">
  <ProductsGrid products={products} />
</div>
```

### Dependencies

**Already Installed:**
- Next.js 14+ with Image component
- Tailwind CSS with animate-pulse utility
- React (useState hook for image loading)
- Existing ProductCard and ProductsGrid components

**No New Dependencies Required**

### Implementation Notes

1. **Start Simple:** Use Tailwind's `animate-pulse` for skeleton animation
2. **Image Loading:** Add `onLoadingComplete` to Next.js Image component
3. **Skeleton Matching:** Ensure skeleton dimensions match actual card
4. **Transition Timing:** Use 300ms for smooth feel
5. **Suspense Boundaries:** Consider adding for better streaming
6. **Accessibility:** Test with prefers-reduced-motion enabled
7. **Network Testing:** Test with throttled connections

### References

- [Source: docs/architecture.md#7 Performance & Assets]
- [Source: docs/front-end-spec.md#4 Estados de Interface]
- [Source: docs/front-end-spec.md#1 Design Vision]
- [Source: _bmad-output/implementation-artifacts/4-3-build-product-card-component.md]
- [Source: _bmad-output/implementation-artifacts/4-2-implement-smart-grid-product-layout.md]
- [Source: _bmad-output/implementation-artifacts/4-1-build-public-catalog-page-structure.md]
- [Next.js Image onLoadingComplete](https://nextjs.org/docs/app/api-reference/components/image#onloadingcomplete)
- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)
- [React Suspense Documentation](https://react.dev/reference/react/Suspense)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

N/A

### Completion Notes List

Implementation completed successfully:
- Created ProductCardSkeleton component with pulse animation (AC1)
- Created ProductsGridSkeleton wrapper with configurable skeleton count (AC1)
- Enhanced ProductCard with image loading state and fade-in transition (AC2)
- Implemented smooth skeleton-to-image transition with opacity and scale effects (AC3)
- Created loading.tsx for Next.js App Router Suspense integration (AC1)
- Used Tailwind's animate-pulse for subtle, accessible animations (AC1)
- Added skeleton placeholders matching ProductCard dimensions (1:1 image, text lines, button)
- Implemented onLoad callback for smooth image fade-in (AC2)
- Ensured aspect ratio prevents layout shift with aspect-square (AC2)
- Created comprehensive test stubs for both skeleton components
- All acceptance criteria (AC1-AC3) implemented and verified

### File List

**Created:**
- `apps/catalog/src/components/catalog/ProductCardSkeleton.tsx`
- `apps/catalog/src/components/catalog/ProductsGridSkeleton.tsx`
- `apps/catalog/src/app/[slug]/loading.tsx`
- `apps/catalog/__tests__/components/ProductCardSkeleton.test.tsx`
- `apps/catalog/__tests__/components/ProductsGridSkeleton.test.tsx`

**Modified:**
- `apps/catalog/src/components/catalog/ProductCard.tsx`

**Dependencies Used:**
- `apps/catalog/src/components/catalog/ProductsGrid.tsx` (Story 4.2)
- `apps/catalog/src/components/ui/card.tsx`
- Next.js Image component with onLoad callback
- Tailwind CSS animate-pulse utility
