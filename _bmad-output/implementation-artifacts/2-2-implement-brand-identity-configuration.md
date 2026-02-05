# Story 2.2: Implement Brand Identity Configuration

Status: review

## Story

As a **store owner**,
I want **to configure my brand colors, logo, and fonts**,
So that **my catalog reflects my brand identity**.

## Acceptance Criteria

### AC1: Brand Settings Page Access
**Given** I am logged into the admin panel
**When** I access the brand settings page
**Then** I see my current brand configuration
**And** I can edit all brand settings

### AC2: Logo Upload
**Given** I am on the brand settings page
**When** I upload a logo image
**Then** I can select PNG or JPG files (max 2MB)
**And** the image is previewed before saving
**And** the logo URL is saved to my Tenant record

### AC3: Color Configuration
**Given** I am on the brand settings page
**When** I configure brand colors
**Then** I can select a primary color via color picker
**And** I can select a secondary color via color picker
**And** colors are validated as hex format

### AC4: Border Radius Style
**Given** I am on the brand settings page
**When** I choose border radius style
**Then** I can select from: Sharp (0rem), Soft (0.5rem), Rounded (1rem), Pill (9999px)
**And** my selection is saved to the Tenant record

### AC5: Live Preview
**Given** I am configuring brand settings
**When** I change any value
**Then** a preview panel shows the changes immediately
**And** I can see how colors apply to UI elements

### AC6: Save Brand Settings
**Given** I have made changes to my brand settings
**When** I click save
**Then** all changes are persisted to the database
**And** a success message is displayed
**And** onboardingComplete is set to true

## Tasks / Subtasks

- [x] **Task 1: Create Brand Settings API** (AC: #1, #6)
  - [x] 1.1 Create `GET /api/tenant/brand` endpoint
  - [x] 1.2 Create `PATCH /api/tenant/brand` endpoint
  - [x] 1.3 Add Zod validation for brand settings
  - [x] 1.4 Handle authentication/authorization (using tenantId query param)

- [x] **Task 2: Create Logo Upload API** (AC: #2)
  - [x] 2.1 Create `POST /api/tenant/logo` endpoint
  - [x] 2.2 Implement file validation (type, size)
  - [x] 2.3 Save file to public/uploads directory
  - [x] 2.4 Return logo URL after upload

- [x] **Task 3: Create Brand Settings Page** (AC: #1, #3, #4)
  - [x] 3.1 Create `apps/admin/src/app/brand-settings/page.tsx`
  - [x] 3.2 Build form with React Hook Form (state-based)
  - [x] 3.3 Add color picker component
  - [x] 3.4 Add border radius selector
  - [x] 3.5 Add logo upload component

- [x] **Task 4: Create Live Preview Component** (AC: #5)
  - [x] 4.1 Create `BrandPreview` component
  - [x] 4.2 Apply CSS variables dynamically
  - [x] 4.3 Show sample UI elements (buttons, cards)
  - [x] 4.4 Update preview on form changes

- [x] **Task 5: Add UI Components** (AC: #3)
  - [x] 5.1 Create ColorPicker component
  - [x] 5.2 Create RadioGroup component (for border radius)
  - [x] 5.3 Create FileUpload component

- [x] **Task 6: Verify Brand Configuration Flow** (AC: #1-#6)
  - [x] 6.1 Test logo upload
  - [x] 6.2 Test color selection
  - [x] 6.3 Test border radius selection
  - [x] 6.4 Test save and persistence

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#4.2 Engine de Temas Dinâmicos]
- Lojista define cores e logos no admin
- App catalog busca dados via slug
- Valores aplicados no :root do CSS via variáveis Tailwind

### Technical Requirements

| Component | Specification |
|-----------|---------------|
| File Upload | Max 2MB, PNG/JPG only |
| Color Format | Hex (#RRGGBB) |
| Border Radius | 0rem, 0.5rem, 1rem, 9999px |
| Storage | Local file system (public/uploads) |

### Brand Settings Schema

```typescript
// Zod schema for brand settings update
const BrandSettingsSchema = z.object({
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  borderRadius: z.enum(['0rem', '0.5rem', '1rem', '9999px']),
});
```

### Border Radius Options

| Option | Value | Visual |
|--------|-------|--------|
| Sharp | `0rem` | Square corners |
| Soft | `0.5rem` | Slightly rounded |
| Rounded | `1rem` | Notably rounded |
| Pill | `9999px` | Fully rounded (pills) |

### File Upload Flow

```
1. User selects file
2. Client validates type and size
3. File sent to POST /api/tenant/logo
4. Server validates and saves to public/uploads/{tenantId}/logo.{ext}
5. Returns URL: /uploads/{tenantId}/logo.{ext}
6. URL saved to Tenant.logoUrl on brand settings save
```

### Preview Component CSS Variables

```css
.brand-preview {
  --preview-primary: var(--form-primary);
  --preview-secondary: var(--form-secondary);
  --preview-radius: var(--form-radius);
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenant/brand` | Get current brand settings |
| PATCH | `/api/tenant/brand` | Update brand settings |
| POST | `/api/tenant/logo` | Upload logo image |

### Dependencies

Already installed from Story 2.1:
- `react-hook-form`
- `@hookform/resolvers`
- `zod`

New dependencies needed:
```bash
npm install react-colorful
```

### Previous Story Learnings

From Story 2.1:
- Tenant model already has brand fields (logoUrl, primaryColor, secondaryColor, borderRadius)
- Tenant service at `libs/shared/src/services/tenant.service.ts`
- Auth layout at `apps/admin/src/app/(auth)/layout.tsx`
- shadcn/ui components: Button, Card, Input, Label

### Project Structure After Implementation

```
apps/admin/src/
├── app/
│   ├── brand-settings/
│   │   └── page.tsx              # Brand settings page
│   └── api/
│       └── tenant/
│           ├── brand/
│           │   └── route.ts      # GET/PATCH brand settings
│           └── logo/
│               └── route.ts      # POST logo upload
├── components/
│   ├── brand/
│   │   ├── BrandPreview.tsx      # Live preview component
│   │   └── BrandSettingsForm.tsx # Form component
│   └── ui/
│       ├── color-picker.tsx      # Color picker component
│       ├── radio-group.tsx       # Radio group component
│       └── file-upload.tsx       # File upload component
```

### Testing Requirements

1. **Logo Upload Test:** Upload PNG/JPG, verify size limit
2. **Color Test:** Select colors via picker, verify hex format
3. **Radius Test:** Select each option, verify saved value
4. **Preview Test:** Changes reflect immediately in preview
5. **Persistence Test:** Settings saved and loaded correctly

### References

- [Source: docs/architecture.md#4.2 Engine de Temas Dinâmicos]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2]
- [Prisma: libs/database/prisma/schema.prisma#Brand Configuration]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- No major issues encountered during implementation
- Used react-colorful for color picker (HexColorPicker, HexColorInput)
- Used @radix-ui/react-radio-group for border radius selection
- File upload saves to public/uploads/{tenantId}/logo.{ext}

### Completion Notes List

1. All 6 tasks completed successfully
2. Brand settings API (GET/PATCH) implemented with Zod validation
3. Logo upload API with file type and size validation
4. Live preview component updates dynamically on form changes
5. Border radius options: 0rem, 0.5rem, 1rem, 9999px
6. onboardingComplete automatically set to true when saving settings

### File List

- `libs/shared/src/schemas/tenant.schema.ts` - Added BrandSettingsData type
- `libs/shared/src/services/tenant.service.ts` - Added getBrandSettings, updateBrandSettings, updateTenantLogo
- `apps/admin/src/app/api/tenant/brand/route.ts` - GET/PATCH brand settings API
- `apps/admin/src/app/api/tenant/logo/route.ts` - POST logo upload API
- `apps/admin/src/app/brand-settings/page.tsx` - Brand settings page
- `apps/admin/src/components/brand/BrandPreview.tsx` - Live preview component
- `apps/admin/src/components/ui/color-picker.tsx` - Color picker component
- `apps/admin/src/components/ui/radio-group.tsx` - Radio group component
- `apps/admin/src/components/ui/file-upload.tsx` - File upload component

