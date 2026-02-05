# Story 2.3: Configure WhatsApp Contact Numbers

Status: review

## Story

As a **store owner**,
I want **to configure my WhatsApp numbers for customer contact**,
So that **customers can reach me directly from the catalog**.

## Acceptance Criteria

### AC1: WhatsApp Configuration Section
**Given** I am in the brand settings
**When** I access the WhatsApp configuration section
**Then** I see input fields for primary and secondary WhatsApp numbers
**And** I can see my current saved numbers (if any)

### AC2: Primary WhatsApp Number
**Given** I am on the WhatsApp configuration section
**When** I add a primary WhatsApp number
**Then** I can enter a phone number with country code (e.g., +5511999999999)
**And** the number is validated for correct format
**And** the number is saved to the Tenant record

### AC3: Secondary WhatsApp Number
**Given** I am on the WhatsApp configuration section
**When** I add a secondary WhatsApp number
**Then** I can optionally enter a second number for offers/groups
**And** the secondary number is also validated
**And** both numbers are saved to the Tenant record

### AC4: Phone Number Validation
**Given** an invalid phone format is entered
**When** I try to save
**Then** a clear validation error message is displayed
**And** the save is blocked until the format is corrected

### AC5: Phone Format Help
**Given** I am entering a WhatsApp number
**When** I focus on the input field
**Then** I see a hint about the expected format (+CCNNNNNNNNN)
**And** I see an example (e.g., +5511999999999)

## Tasks / Subtasks

- [x] **Task 1: Create WhatsApp Settings API** (AC: #1, #2, #3)
  - [x] 1.1 Create `GET /api/tenant/whatsapp` endpoint
  - [x] 1.2 Create `PATCH /api/tenant/whatsapp` endpoint
  - [x] 1.3 Validate phone number format with Zod

- [x] **Task 2: Add WhatsApp Service Functions** (AC: #2, #3)
  - [x] 2.1 Create `getWhatsAppSettings` function
  - [x] 2.2 Create `updateWhatsAppSettings` function
  - [x] 2.3 Add phone number formatting utility

- [x] **Task 3: Create WhatsApp Settings UI** (AC: #1, #2, #3, #5)
  - [x] 3.1 Create `WhatsAppSettings` component
  - [x] 3.2 Add phone input with WhatsApp icon
  - [x] 3.3 Add format hints and examples
  - [x] 3.4 Integrate into brand-settings page

- [x] **Task 4: Implement Validation Feedback** (AC: #4)
  - [x] 4.1 Display inline validation errors
  - [x] 4.2 Show success message on save
  - [x] 4.3 Block save on invalid format

- [x] **Task 5: Test WhatsApp Configuration** (AC: #1-#5)
  - [x] 5.1 Test valid phone formats
  - [x] 5.2 Test invalid phone formats
  - [x] 5.3 Test save and persistence

## Dev Notes

### Architecture Compliance

**Source:** [docs/architecture.md#4.2 Engine de Temas Dinâmicos]
- WhatsApp numbers stored in Tenant model
- Used by catalog app for click-to-WhatsApp feature

### Technical Requirements

| Component | Specification |
|-----------|---------------|
| Phone Format | International format with country code |
| Validation | Regex: `^\+[1-9]\d{10,14}$` |
| Primary Number | Required for WhatsApp integration |
| Secondary Number | Optional (for offers/promotions) |

### WhatsApp Settings Schema

```typescript
// Already exists in libs/shared/src/schemas/tenant.schema.ts
const WhatsAppConfigSchema = z.object({
  whatsappPrimary: z
    .string()
    .regex(/^\+[1-9]\d{10,14}$/, 'Formato: +CCNNNNNNNNN')
    .optional()
    .nullable(),
  whatsappSecondary: z
    .string()
    .regex(/^\+[1-9]\d{10,14}$/, 'Formato: +CCNNNNNNNNN')
    .optional()
    .nullable(),
});
```

### Phone Number Validation Examples

| Input | Valid | Reason |
|-------|-------|--------|
| `+5511999999999` | ✅ | Brazil mobile |
| `+14155551234` | ✅ | US format |
| `11999999999` | ❌ | Missing country code |
| `+551199999` | ❌ | Too short |
| `+0123456789` | ❌ | Invalid country code |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenant/whatsapp` | Get WhatsApp settings |
| PATCH | `/api/tenant/whatsapp` | Update WhatsApp numbers |

### Dependencies

Already installed from previous stories:
- `react-hook-form`
- `@hookform/resolvers`
- `zod`

### Previous Story Learnings

From Story 2.2:
- Brand settings page at `apps/admin/src/app/brand-settings/page.tsx`
- Tenant model has `whatsappPrimary` and `whatsappSecondary` fields
- API uses `?tenantId=X` query param for auth (temporary)

### Integration Point

The WhatsApp settings section should be integrated into the existing brand-settings page:

```
apps/admin/src/app/brand-settings/page.tsx
├── Logo Upload Card (existing)
├── Colors Card (existing)
├── Border Radius Card (existing)
└── WhatsApp Settings Card (NEW)
```

### Project Structure After Implementation

```
apps/admin/src/
├── app/
│   ├── brand-settings/
│   │   └── page.tsx              # Add WhatsApp section
│   └── api/
│       └── tenant/
│           └── whatsapp/
│               └── route.ts      # GET/PATCH WhatsApp
├── components/
│   └── whatsapp/
│       └── WhatsAppSettings.tsx  # WhatsApp config component
```

### Testing Requirements

1. **Valid Format Test:** Enter +5511999999999, verify save
2. **Invalid Format Test:** Enter 11999999999, verify error
3. **Optional Secondary Test:** Save with only primary number
4. **Persistence Test:** Reload page, verify numbers loaded
5. **Error Messages Test:** Verify clear error messages

### References

- [Source: docs/architecture.md#4.2 Engine de Temas Dinâmicos]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Prisma: libs/database/prisma/schema.prisma#WhatsApp Configuration]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5

### Debug Log References

- No issues encountered during implementation
- Used existing WhatsAppConfigSchema from tenant.schema.ts
- Integrated into existing brand-settings page seamlessly

### Completion Notes List

1. All 5 tasks completed successfully
2. WhatsApp API (GET/PATCH) implemented with Zod validation
3. Phone validation regex: `^\+[1-9]\d{10,14}$`
4. Custom PhoneInput component with WhatsApp icon and format hints
5. Real-time validation on input change
6. Success/error feedback messages

### File List

- `libs/shared/src/schemas/tenant.schema.ts` - Added WhatsAppSettingsData type
- `libs/shared/src/services/tenant.service.ts` - Added getWhatsAppSettings, updateWhatsAppSettings, formatPhoneNumber
- `apps/admin/src/app/api/tenant/whatsapp/route.ts` - GET/PATCH WhatsApp API
- `apps/admin/src/components/ui/phone-input.tsx` - Phone input component
- `apps/admin/src/components/whatsapp/WhatsAppSettings.tsx` - WhatsApp config component
- `apps/admin/src/app/brand-settings/page.tsx` - Integrated WhatsAppSettings component

