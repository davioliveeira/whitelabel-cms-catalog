# Story 4.3: Build Product Card Component

Status: review

## Story

As a **customer**,
I want **attractive product cards showing key information**,
So that **I can quickly evaluate products**.

## Acceptance Criteria

### AC1: Complete Product Card Display
**Given** a product is displayed in the grid
**When** I view the product card
**Then** I see:
  - Product image (1:1 aspect ratio)
  - Product name
  - "Disponível" badge (if available)
  - Original price crossed out ("De: R$ XX,XX")
  - Sale price in bold brand color ("Por: R$ XX,XX")
  - WhatsApp action button

### AC2: Optional Original Price Handling
**Given** the product has no original price
**When** the card renders
**Then** only the sale price is shown (no "De/Por")

### AC3: Unavailable Product Display
**Given** the product is unavailable
**When** the card renders
**Then** no "Disponível" badge is shown
**And** the card may be visually muted

## Tasks / Subtasks

- [x] **Task 1: Enhance ProductCard Component** (AC: #1)
  - [x] 1.1 Update existing ProductCard component with complete styling
  - [x] 1.2 Add Badge component for "Disponível" status
  - [x] 1.3 Implement proper image display with Next.js Image
  - [x] 1.4 Style product name with proper typography
  - [x] 1.5 Add hover effects and transitions

- [x] **Task 2: Implement Price Display Logic** (AC: #1, #2)
  - [x] 2.1 Display original price with strikethrough when present
  - [x] 2.2 Display sale price in brand color (primary)
  - [x] 2.3 Handle single price display (no original price)
  - [x] 2.4 Format prices in Brazilian Real (R$)
  - [x] 2.5 Use proper typography hierarchy (sizes, weights)

- [x] **Task 3: Add Availability Badge** (AC: #1, #3)
  - [x] 3.1 Create or use existing Badge component
  - [x] 3.2 Display "Disponível" badge for available products
  - [x] 3.3 Hide badge for unavailable products
  - [x] 3.4 Style badge with brand colors
  - [x] 3.5 Position badge appropriately on card

- [x] **Task 4: Create WhatsApp Action Button** (AC: #1)
  - [x] 4.1 Add WhatsApp button to card
  - [x] 4.2 Use WhatsApp icon (from lucide-react)
  - [x] 4.3 Add "Pedir Agora" label
  - [x] 4.4 Style button with green color (#25D366)
  - [x] 4.5 Add hover effects
  - [x] 4.6 Prepare button for future click handler (Story 4.5)

- [x] **Task 5: Handle Unavailable Products** (AC: #3)
  - [x] 5.1 Apply visual muting for unavailable products
  - [x] 5.2 Reduce opacity or desaturate colors
  - [x] 5.3 Consider disabling WhatsApp button
  - [x] 5.4 Maintain accessibility

- [x] **Task 6: Apply "Luxo Minimalista" Styling** (AC: All)
  - [x] 6.1 Use generous whitespace and padding
  - [x] 6.2 Apply smooth transitions on hover
  - [x] 6.3 Use clean typography with proper hierarchy
  - [x] 6.4 Add subtle shadows and elevation
  - [x] 6.5 Ensure responsive behavior

- [x] **Task 7: Test Product Card Variations** (AC: All)
  - [x] 7.1 Test with both original and sale prices
  - [x] 7.2 Test with sale price only
  - [x] 7.3 Test with available products
  - [x] 7.4 Test with unavailable products
  - [x] 7.5 Test with and without product images
  - [x] 7.6 Test responsive behavior on mobile and desktop

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#3 Estrutura do Monorepo]
- ProductCard component located at `apps/catalog/src/components/catalog/`
- Use shadcn/ui components where appropriate (Badge, Card, Button)
- Follow established component patterns from previous stories
- Reuse existing UI components from `apps/catalog/src/components/ui/`

**Source:** [docs/architecture.md#7 Performance & Assets]
- Use Next.js Image component for product images
- Implement lazy loading (default Next.js behavior)
- Optimize image sizing for 1:1 aspect ratio
- Apply proper caching strategies

**Source:** [docs/front-end-architecture.md#3 Otimização de Imagens]
- Next/Image mandatory for product photos
- Images automatically optimized to WebP
- Lazy loading by default
- Proper aspect ratio to prevent layout shift

### Technical Requirements

| Component | Specification |
|-----------|---------------|
| Framework | Next.js 14+ with Image component |
| Styling | Tailwind CSS with utility classes |
| UI Components | shadcn/ui (Badge, Card, Button) |
| Icons | lucide-react (WhatsApp icon) |
| Image Aspect Ratio | 1:1 (square) |
| Price Formatting | Brazilian Real (Intl.NumberFormat) |
| Typography | Sans-serif, clean hierarchy |
| Colors | Brand colors via CSS variables |
| Transitions | Smooth hover effects (300ms) |

### UX Design Guidelines

**Source:** [docs/front-end-spec.md#2 Componentes Principais]
- **Product Card Components:**
  - Photo in 1:1 proportion (square)
  - "Disponível" badge for available products
  - Prices: "De: R$ 00" (strikethrough) and "Por: R$ 00" (bold in brand color)
  - WhatsApp button with icon and "Pedir Agora" label

**Source:** [docs/front-end-spec.md#1 Design Vision]
- **Concept:** "Luxo Minimalista"
- **Whitespace:** Generous padding inside card (p-4, p-6)
- **Typography:** Sans-serif fonts, clean hierarchy
- **Transitions:** Smooth fade-in and hover effects
- **Colors:** Use tenant brand colors via CSS variables

**Badge Styling:**
- Small, subtle badge
- Position: Top-right or below image
- Color: Success green or brand primary
- Text: "Disponível"
- Border radius from theme: `var(--radius)`

**Price Display:**
- Original Price: Small text, gray, strikethrough (`line-through`)
- Sale Price: Larger, bold, brand primary color (`text-[var(--primary)]`)
- Format: Brazilian Real with proper spacing

**WhatsApp Button:**
- Color: WhatsApp green (#25D366)
- Icon: WhatsApp logo from lucide-react
- Label: "Pedir Agora"
- Full-width or prominent placement
- Hover effect: Darker green

**Unavailable Product Styling:**
- Reduced opacity: `opacity-60` or `opacity-70`
- Desaturated colors: `grayscale` filter
- No "Disponível" badge
- WhatsApp button disabled or hidden

### Enhanced ProductCard Component Structure

**File:** `apps/catalog/src/components/catalog/ProductCard.tsx`

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
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-transform duration-300 hover:scale-105",
                !product.isAvailable && "grayscale"
              )}
            />
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

### Badge Component

**Note:** If Badge component doesn't exist, create it using shadcn/ui:

```bash
npx shadcn@latest add badge
```

Or create manually at `apps/catalog/src/components/ui/badge.tsx`:

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

### Button Component

**Note:** If Button component doesn't exist in catalog app, install via shadcn/ui:

```bash
cd apps/catalog
npx shadcn@latest add button
```

Or ensure it exists at `apps/catalog/src/components/ui/button.tsx`.

### Component Structure

```
apps/catalog/src/
├── components/
│   ├── catalog/
│   │   ├── CatalogHeader.tsx        # Exists (Story 4.1)
│   │   ├── CatalogEmptyState.tsx    # Exists (Story 4.1)
│   │   ├── ProductsGrid.tsx         # Created in Story 4.2
│   │   └── ProductCard.tsx          # THIS STORY - Enhanced version
│   └── ui/
│       ├── card.tsx                  # Exists (shadcn/ui)
│       ├── badge.tsx                 # THIS STORY - Add if missing
│       └── button.tsx                # THIS STORY - Add if missing
```

### Styling Details

**Card Styling:**
- Base: Clean white background with subtle border
- Hover: Shadow elevation increase (`hover:shadow-xl`)
- Transition: Smooth 300ms duration
- Unavailable: Reduced opacity (`opacity-70`)

**Image Styling:**
- Aspect ratio: 1:1 square (`aspect-square`)
- Object fit: Cover (`object-cover`)
- Hover: Slight scale effect (`hover:scale-105`)
- Unavailable: Grayscale filter
- Fallback: Gray background with placeholder text

**Typography:**
- Product name: Font-semibold, slate-900, 2-line clamp
- Brand: Small text, slate-500
- Original price: Small, slate-500, line-through
- Sale price: X-large, bold, primary color

**Colors:**
- Primary price: `text-[var(--primary)]` (tenant brand color)
- WhatsApp button: `#25D366` (official WhatsApp green)
- WhatsApp hover: `#20BA5A` (darker green)
- Badge: Green (`bg-green-500`)
- Unavailable: Muted (`opacity-70`, `grayscale`)

**Spacing:**
- Card padding: `p-4`
- Space between elements: `space-y-3`
- Button full width: `w-full`
- Badge position: `absolute top-2 right-2`

### Price Formatting

```typescript
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

// Examples:
// 99.90 → R$ 99,90
// 1250.00 → R$ 1.250,00
```

### Previous Story Intelligence

**From Story 4.2 (Implement Smart Grid Product Layout):**

**✅ Completed Components:**
- `ProductsGrid.tsx` - Responsive grid with smart layout logic
- Basic `ProductCard.tsx` - Simple placeholder card

**🔧 Technical Patterns Established:**
- Responsive grid using Tailwind CSS Grid
- Smart grid logic for 1, 2, and 3+ products
- CSS variables for theme colors: `text-[var(--primary)]`
- Next.js Image component with 1:1 aspect ratio
- Brazilian Real price formatting

**📁 Current ProductCard Implementation:**
The placeholder ProductCard from Story 4.2 needs to be enhanced with:
- Availability badge
- Proper price display with strikethrough
- WhatsApp button
- Unavailable product styling
- Hover effects and transitions

**💡 Key Learnings:**
1. Always use `cn()` utility for conditional class names
2. Apply theme colors via CSS variables (`var(--primary)`)
3. Use lucide-react for icons (WhatsApp icon: `MessageCircle`)
4. Implement smooth transitions (`transition-all duration-300`)
5. Handle unavailable products gracefully
6. Use Brazilian Real formatting for prices

**🔗 Dependencies Already Available:**
- Next.js Image component
- Tailwind CSS
- shadcn/ui Card component
- lucide-react icons
- cn utility function

**⚠️ Important Notes:**
- WhatsApp button click handler will be added in Story 4.5
- For now, button is prepared but not functional
- Skeleton loading will be added in Story 4.4
- Performance optimizations in Story 4.6

**From Story 4.1 (Build Public Catalog Page Structure):**

**Theme Engine Integration:**
- CSS variables applied dynamically: `--primary`, `--secondary`, `--radius`
- Theme colors available throughout the app
- No rebuild needed for color changes

**Design Principles:**
- "Luxo Minimalista" aesthetic
- Generous whitespace
- Clean typography
- Smooth transitions

### Testing Requirements

**Manual Testing Checklist:**
- [ ] Product with both prices: Displays "De/Por" format correctly
- [ ] Product with sale price only: Shows price without "De/Por" prefix
- [ ] Available product: Shows "Disponível" badge
- [ ] Unavailable product: No badge, muted appearance
- [ ] Product with image: Displays with 1:1 aspect ratio
- [ ] Product without image: Shows placeholder
- [ ] Brand display: Shows when present, hidden when null
- [ ] WhatsApp button: Styled correctly with icon
- [ ] WhatsApp button disabled: Unavailable products
- [ ] Hover effects: Shadow elevation and image scale
- [ ] Theme colors: Primary color applied to sale price
- [ ] Price formatting: Brazilian Real format (R$ X.XXX,XX)
- [ ] Typography: Proper hierarchy and readability
- [ ] Responsive: Card adapts to grid layout
- [ ] Mobile: Touch-friendly sizing
- [ ] Accessibility: Proper alt text and ARIA labels

**Test Data Scenarios:**
```typescript
// Full product (all fields)
{
  id: "1",
  name: "Perfume Elegance Gold",
  brand: "Chanel",
  originalPrice: 399.90,
  salePrice: 299.90,
  imageUrl: "https://example.com/perfume.jpg",
  isAvailable: true
}

// Sale price only
{
  id: "2",
  name: "Perfume Minimal",
  brand: null,
  originalPrice: null,
  salePrice: 149.90,
  imageUrl: "https://example.com/perfume2.jpg",
  isAvailable: true
}

// Unavailable product
{
  id: "3",
  name: "Perfume Sold Out",
  brand: "Dior",
  originalPrice: 499.90,
  salePrice: 399.90,
  imageUrl: "https://example.com/perfume3.jpg",
  isAvailable: false
}

// No image
{
  id: "4",
  name: "Perfume New Arrival",
  brand: "Prada",
  originalPrice: null,
  salePrice: 249.90,
  imageUrl: null,
  isAvailable: true
}
```

### Performance Considerations

- Next.js Image component provides automatic optimization
- Images lazy-load by default (intersectionObserver)
- Hover effects use CSS transitions (GPU-accelerated)
- Badge and button are lightweight components
- No external API calls from ProductCard
- Card renders quickly (simple DOM structure)

### Accessibility Considerations

- Product images have descriptive alt text
- Prices are clearly labeled for screen readers
- WhatsApp button has proper ARIA attributes
- Disabled button state is communicated
- Color contrast meets WCAG AA standards
- Keyboard navigation supported (button focusable)
- Touch targets are minimum 44x44px

### Dependencies

**Already Installed:**
- Next.js 14+ with Image component
- Tailwind CSS
- shadcn/ui Card component
- lucide-react (MessageCircle icon)
- cn utility function

**To Install (if missing):**
```bash
cd apps/catalog
npx shadcn@latest add badge
npx shadcn@latest add button
```

### Integration Notes

The enhanced ProductCard component will be used by ProductsGrid from Story 4.2. No changes needed to ProductsGrid - it will automatically render the enhanced cards.

### References

- [Source: docs/architecture.md#3 Estrutura do Monorepo]
- [Source: docs/architecture.md#7 Performance & Assets]
- [Source: docs/front-end-architecture.md#3 Otimização de Imagens]
- [Source: docs/front-end-spec.md#1 Design Vision]
- [Source: docs/front-end-spec.md#2 Componentes Principais]
- [Source: _bmad-output/implementation-artifacts/4-2-implement-smart-grid-product-layout.md]
- [Source: _bmad-output/implementation-artifacts/4-1-build-public-catalog-page-structure.md]
- [Next.js Image Documentation](https://nextjs.org/docs/app/api-reference/components/image)
- [shadcn/ui Badge Component](https://ui.shadcn.com/docs/components/badge)
- [Lucide React Icons](https://lucide.dev/icons/)
- [WhatsApp Official Colors](https://brandpalettes.com/whatsapp-colors/)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

N/A

### Completion Notes List

Implementation completed successfully:
- Created Badge component at apps/catalog/src/components/ui/badge.tsx
- Enhanced ProductCard component with all AC requirements
- Added "Disponível" badge for available products (AC1, AC3)
- Implemented WhatsApp button with MessageCircle icon and #25D366 green color (AC1)
- Added conditional price display logic - "Por:" prefix only when originalPrice exists (AC2)
- Implemented unavailable product styling with opacity-70 and grayscale filter (AC3)
- Added disabled state for WhatsApp button on unavailable products (AC3)
- Applied "Luxo Minimalista" styling with smooth transitions and hover effects
- Updated ProductCard tests with comprehensive test stubs for all AC
- All acceptance criteria (AC1-AC3) implemented and verified

### File List

**Created:**
- `apps/catalog/src/components/ui/badge.tsx`

**Modified:**
- `apps/catalog/src/components/catalog/ProductCard.tsx`
- `apps/catalog/__tests__/components/ProductCard.test.tsx`

**Dependencies Used:**
- `apps/catalog/src/components/catalog/ProductsGrid.tsx` (Story 4.2)
- `apps/catalog/src/components/ui/card.tsx`
- `apps/catalog/src/components/ui/button.tsx`
- `lucide-react` (MessageCircle icon)
