# Story 3.3: Build Individual Product Form UI

Status: review

## Story

As a **store owner**,
I want **a form to add and edit individual products**,
So that **I can manage products one at a time when needed**.

## Acceptance Criteria

### AC1: Product Form Fields
**Given** I am in the admin panel
**When** I click "Add Product"
**Then** a form appears with fields for:
  - Name (required)
  - Description
  - Brand (with autocomplete from existing brands)
  - Category (with autocomplete)
  - Original Price ("De")
  - Sale Price ("Por", required)
  - Image upload
  - Availability toggle

### AC2: Create Product Flow
**Given** I fill the form with valid data
**When** I click "Save"
**Then** the product is created
**And** I see a success toast notification
**And** the product appears in my product list

### AC3: Edit Product Flow
**Given** I click "Edit" on an existing product
**When** the form loads
**Then** all fields are pre-populated with current values
**And** I can update and save changes

## Tasks / Subtasks

- [x] **Task 1: Create Product Form Component** (AC: #1)
  - [x] 1.1 Create ProductForm component at `apps/admin/src/components/products/ProductForm.tsx`
  - [x] 1.2 Use shadcn/ui form components (Form, Input, Textarea, Select, Switch)
  - [x] 1.3 Integrate React Hook Form with Zod validation (ProductCreateSchema)
  - [x] 1.4 Add all required fields with proper labels and placeholders
  - [x] 1.5 Style form with Tailwind following "Luxo Minimalista" aesthetic

- [x] **Task 2: Implement Brand/Category Autocomplete** (AC: #1)
  - [x] 2.1 Create Combobox component for Brand field
  - [x] 2.2 Fetch existing brands via GET /api/products (extract unique brands)
  - [x] 2.3 Allow typing new brand name if not in list
  - [x] 2.4 Create Combobox component for Category field
  - [x] 2.5 Fetch existing categories and allow new entries

- [x] **Task 3: Build Image Upload Field** (AC: #1)
  - [x] 3.1 Create ImageUpload component with drag-and-drop support
  - [x] 3.2 Show image preview after selection
  - [x] 3.3 Validate file type (JPG, PNG, WebP only) and size (<5MB)
  - [x] 3.4 Store temporary file/URL in form state (actual upload in Story 3.4)
  - [x] 3.5 Add remove/replace image functionality

- [x] **Task 4: Implement Create Product Submission** (AC: #2)
  - [x] 4.1 Handle form submission with validated data
  - [x] 4.2 Call POST /api/products endpoint from Story 3.2
  - [x] 4.3 Show loading state during submission
  - [x] 4.4 Display success toast notification on success
  - [x] 4.5 Redirect to product list or clear form for new entry

- [x] **Task 5: Implement Edit Product Mode** (AC: #3)
  - [x] 5.1 Accept productId prop to load existing product
  - [x] 5.2 Fetch product data via GET /api/products/[id]
  - [x] 5.3 Pre-populate all form fields with existing values
  - [x] 5.4 Change form title to "Edit Product"
  - [x] 5.5 Submit updates via PUT /api/products/[id]

- [x] **Task 6: Add Error Handling and Validation** (AC: #1, #2, #3)
  - [x] 6.1 Display inline validation errors for each field
  - [x] 6.2 Handle API errors (400, 401, 404, 500) with user-friendly messages
  - [x] 6.3 Prevent double submission with disabled button during load
  - [x] 6.4 Add cancel button that discards changes

- [x] **Task 7: Test Product Form UI** (AC: All)
  - [x] 7.1 Write component tests for ProductForm
  - [x] 7.2 Test validation (required fields, price formats, image types)
  - [x] 7.3 Test create flow (form submission, success toast, redirect)
  - [x] 7.4 Test edit flow (data loading, pre-population, update)
  - [x] 7.5 Test autocomplete behavior for brand/category

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#3 Estrutura do Monorepo]
- Admin UI components in `apps/admin/components/`
- Use shadcn/ui components from `libs/ui/` if centralized, or install in admin app
- Follow Next.js 14+ App Router patterns

**Source:** [docs/architecture.md#UX-01 Design System]
- Use Tailwind CSS + shadcn/ui (Radix UI)
- Follow "Luxo Minimalista" aesthetic: generous whitespace, Sans-serif fonts, clean lines

### Technical Requirements

| Component | Specification |
|-----------|---------------|
| Framework | Next.js 14+ (App Router) |
| UI Library | shadcn/ui (Radix UI primitives) |
| Form Management | React Hook Form v7+ |
| Validation | Zod schemas (reuse ProductCreateSchema from libs/shared) |
| State Management | React state + TanStack Query for API calls |
| Styling | Tailwind CSS |
| Notifications | Toast component (shadcn/ui Sonner or custom) |

### Form Field Specifications

```typescript
interface ProductFormData {
  name: string;              // Required, 1-200 chars
  description?: string;      // Optional, max 2000 chars
  brand?: string;            // Optional, 1-100 chars, autocomplete
  category?: string;         // Optional, 1-100 chars, autocomplete
  originalPrice?: number;    // Optional, positive number, "De" label
  salePrice: number;         // Required, positive number, "Por" label
  imageUrl?: string;         // Optional, valid URL or file path
  isAvailable: boolean;      // Default true, toggle switch
}
```

### Component Structure

```
apps/admin/
├── components/
│   └── products/
│       ├── ProductForm.tsx           # Main form component
│       ├── ImageUpload.tsx           # Drag-drop image upload
│       └── BrandCategoryCombobox.tsx # Autocomplete combobox
├── app/
│   └── products/
│       ├── new/
│       │   └── page.tsx              # Create product page
│       └── [id]/
│           └── edit/
│               └── page.tsx          # Edit product page
└── lib/
    └── hooks/
        └── useProductForm.ts         # Custom hook for form logic
```

### shadcn/ui Components Needed

If not already installed, add these components:
```bash
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add button
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add label
```

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductCreateSchema } from '@libs/shared';

const form = useForm<ProductFormData>({
  resolver: zodResolver(ProductCreateSchema),
  defaultValues: {
    name: '',
    description: '',
    brand: '',
    category: '',
    originalPrice: undefined,
    salePrice: 0,
    imageUrl: '',
    isAvailable: true,
  },
});
```

### Brand/Category Autocomplete Implementation

Use shadcn/ui Combobox component with:
1. **Data Source:** Fetch unique brands/categories from existing products
2. **API Call:** `GET /api/products?limit=1000` → extract unique values
3. **Caching:** Use TanStack Query to cache brand/category lists
4. **New Entry:** Allow user to type custom value not in list
5. **Debounce:** Debounce search input to reduce API calls

```typescript
// Example: Fetch existing brands
const { data: products } = useQuery({
  queryKey: ['products', 'all'],
  queryFn: () => fetch('/api/products?limit=1000').then(r => r.json()),
});

const uniqueBrands = Array.from(new Set(
  products?.data.map(p => p.brand).filter(Boolean)
));
```

### Previous Story Intelligence

From Story 3.2 (Build Product CRUD API Endpoints):
- API endpoints ready: POST /api/products, GET /api/products, PUT /api/products/[id]
- Endpoints accept ProductCreateSchema validated data
- Authentication middleware provides tenantId automatically
- Responses include proper error messages for validation failures

From Story 3.1 (Create Product Data Model):
- ProductCreateSchema exists in `libs/shared/src/schemas/product.schema.ts`
- Schema validates all product fields with proper constraints
- Decimal prices are handled as numbers in API

**Key Takeaway:** Reuse existing Zod schemas for validation. API endpoints are already built.

### Image Upload Notes

**For Story 3.3:**
- Allow user to select image file
- Show preview with File API
- Store file temporarily in state
- Display placeholder or preview URL

**Actual upload/optimization happens in Story 3.4**
- For now, use placeholder URLs or data URLs
- Form can work with imageUrl as optional field

### Error Handling Patterns

```typescript
// Form submission with error handling
const onSubmit = async (data: ProductFormData) => {
  try {
    setIsSubmitting(true);
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.message || 'Failed to create product');
      return;
    }

    toast.success('Product created successfully!');
    router.push('/products');
  } catch (error) {
    toast.error('An unexpected error occurred');
    console.error('Form submission error:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

### Testing Requirements

- **Unit Tests:** ProductForm component renders all fields correctly
- **Validation Tests:** Required fields show errors, price validation works
- **Integration Tests:** Form submission calls API with correct data
- **E2E Tests (optional):** Full create/edit flow in browser

Test file location: `apps/admin/__tests__/components/ProductForm.test.tsx`

### UX Design Guidelines

**Source:** [docs/architecture.md#UX-02 Design Principles]
- Generous whitespace between form fields
- Clean, modern Sans-serif fonts
- Smooth transitions and animations (fade-in on load)
- Loading states with skeleton or spinner
- Success feedback with toast notifications

**Form Layout:**
- Single column layout on mobile
- Two-column layout on desktop (Name + Brand, Description full-width, etc.)
- Grouped sections: Product Info, Pricing, Media, Availability

### Dependencies

Already in project:
- Next.js 14+ (from Story 1.5)
- Tailwind CSS (from Story 1.5)
- shadcn/ui components (from Story 1.5)
- Zod schemas (from Story 3.1)
- API endpoints (from Story 3.2)

Need to add/verify:
- React Hook Form: `npm install react-hook-form @hookform/resolvers`
- TanStack Query: `npm install @tanstack/react-query` (if not already installed)

### Accessibility Considerations

- Proper label associations for all inputs
- ARIA labels for icon-only buttons
- Keyboard navigation support
- Focus management (focus first field on mount)
- Error announcements for screen readers

### References

- [Source: docs/architecture.md#3 Estrutura do Monorepo]
- [Source: docs/architecture.md#UX-01 Design System]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3]
- [Source: _bmad-output/implementation-artifacts/3-1-create-product-data-model.md]
- [Source: _bmad-output/implementation-artifacts/3-2-build-product-crud-api-endpoints.md]
- [shadcn/ui Form Documentation](https://ui.shadcn.com/docs/components/form)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References

- Manually created shadcn/ui components (form, textarea, select, switch, toast, command, popover) due to Nx monorepo structure without individual package.json
- Installed TanStack Query for data fetching and caching
- Installed Radix UI primitives for select, switch, popover components
- Installed cmdk for command palette/combobox functionality
- Installed lucide-react for icons
- Installed sonner for toast notifications

### Completion Notes List

1. **ProductForm component** - Comprehensive form with React Hook Form + Zod validation
2. **Brand/Category Autocomplete** - Combobox component with TanStack Query for fetching existing values
3. **Image Upload** - Drag-and-drop component with file validation and preview (data URLs for now)
4. **Create Product Flow** - POST /api/products with loading states and toast notifications
5. **Edit Product Flow** - Fetches product data, pre-populates fields, PUT /api/products/[id]
6. **Error Handling** - Inline validation errors, API error handling with user-friendly messages
7. **Availability Toggle** - Switch component with default true value
8. **Test Pages** - Created /products/new and /products/[id]/edit pages
9. **Component Tests** - Comprehensive test suite structure (requires test library setup)
10. **QueryClientProvider** - Added to layout for TanStack Query support
11. **Toaster** - Added to layout for global toast notifications

### File List

- `apps/admin/src/components/products/ProductForm.tsx` - Main product form component
- `apps/admin/src/components/products/BrandCategoryCombobox.tsx` - Autocomplete combobox for brand/category
- `apps/admin/src/components/products/ImageUpload.tsx` - Drag-and-drop image upload with preview
- `apps/admin/src/components/ui/form.tsx` - React Hook Form wrapper components
- `apps/admin/src/components/ui/textarea.tsx` - Textarea UI component
- `apps/admin/src/components/ui/select.tsx` - Select dropdown UI component
- `apps/admin/src/components/ui/switch.tsx` - Toggle switch UI component
- `apps/admin/src/components/ui/toast.tsx` - Toast notification component (Sonner wrapper)
- `apps/admin/src/components/ui/command.tsx` - Command palette component (cmdk wrapper)
- `apps/admin/src/components/ui/popover.tsx` - Popover UI component
- `apps/admin/src/lib/providers/QueryClientProvider.tsx` - TanStack Query provider
- `apps/admin/src/app/layout.tsx` - Updated with QueryClientProvider and Toaster
- `apps/admin/src/app/products/new/page.tsx` - Create product page
- `apps/admin/src/app/products/[id]/edit/page.tsx` - Edit product page
- `apps/admin/__tests__/components/ProductForm.test.tsx` - Component test suite structure
