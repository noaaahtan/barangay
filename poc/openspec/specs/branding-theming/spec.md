# Capability: Branding & Theming

## Purpose

Barangay Sta Ana Government Portal brand identity, color palette, reusable UI component library, and application shell.

## Requirements

### Requirement: Brand Color Palette

The application SHALL use a custom Tailwind CSS color palette defined via the `@theme` directive in `index.css`:

| Token | Purpose | Example |
|-------|---------|---------|
| `brand-50` to `brand-900` | Primary coral/red gradient for government portal | `brand-400: #f87171` |
| `sky-brand-50` to `sky-brand-600` | Sky blue accent | `sky-brand-500: #0ea5e9` |
| `gold-50` to `gold-600` | Gold accent | `gold-500: #f59e0b` |

The body background SHALL use `bg-brand-50/40` with `text-slate-900 antialiased`.

#### Scenario: Custom colors are available in Tailwind classes
- **WHEN** a component uses `bg-brand-400` or `text-sky-brand-500`
- **THEN** the correct brand color is applied

---

### Requirement: Application Logo

The sidebar SHALL display the Barangay Sta Ana logo (`/sta-ana-logo.png`) in a 40-unit-tall container with `object-contain` scaling. The logo also serves as the browser favicon.

#### Scenario: Logo is displayed in sidebar
- **WHEN** the user opens the app
- **THEN** the Barangay Sta Ana logo appears at the top of the sidebar (height: `h-36`, container: `h-40`)

#### Scenario: Favicon uses logo
- **WHEN** the browser tab is viewed
- **THEN** the favicon shows the Barangay Sta Ana logo

---

### Requirement: Sidebar Navigation

The application SHALL have a fixed left sidebar (`w-60`) with navigation links:

| Route | Label | Icon |
|-------|-------|------|
| `/` | Dashboard | `HiOutlineSquares2X2` |
| `/items` | Applications | `HiOutlineCube` |
| `/categories` | Categories | `HiOutlineTag` |
| `/stock-history` | Stock History | `HiOutlineClock` |

Active links use `bg-brand-100 text-brand-700`. Hover state uses `bg-brand-50 text-brand-700`.

#### Scenario: Navigate between pages
- **WHEN** the user clicks a sidebar link
- **THEN** the corresponding page loads and the link is highlighted as active

---

### Requirement: Reusable UI Component Library

The frontend SHALL provide a set of generic, project-agnostic UI components in `components/ui/`:

| Component | Purpose |
|-----------|---------|
| `Button` | Variants: primary (brand coral), secondary, danger, ghost. Sizes: sm, md. |
| `Input` | Labeled text/number input with error display. Focus ring: `brand-400`. |
| `Select` | Labeled dropdown with custom chevron icon (native arrow hidden via `appearance-none`). Focus ring: `brand-400`. |
| `Textarea` | Labeled multiline input with error display. |
| `Badge` | Variants: default, success, warning, danger. Small label chips. |
| `Card` / `StatCard` | Content container. `StatCard` adds icon + label + value layout with configurable icon color (coral, sky, gold, default). |
| `Table` | Generic data table with column definitions, row hover (`brand-50/30`), and empty state. |
| `Modal` | Overlay dialog with title bar and close button. Close button hover: `brand-50`. |
| `ConfirmDialog` | Modal with confirm/cancel actions for destructive operations. |
| `Toast` | Temporary notification (success/error). |
| `SearchInput` | Magnifying-glass-prefixed search input. |
| `PageHeader` | Page title, description, and optional action button. |
| `EmptyState` | Centered icon + message for empty data sets. Icon color: `brand-200`. |

All UI components:
- MUST NOT import from `features/`, `pages/`, or `api/`.
- SHALL use `cn()` (clsx + tailwind-merge) for conditional class merging.
- SHALL use `forwardRef` where DOM refs are expected (Input, Select, Textarea).
- ARE exported from `components/ui/index.ts` barrel file.

#### Scenario: UI components render correctly
- **WHEN** a page composes UI components (e.g., Button, Table, Modal)
- **THEN** each component renders with brand-consistent styling

---

### Requirement: Currency Formatting

All monetary values SHALL be formatted as Philippine Peso (₱) using:

```typescript
new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
```

The utility function `formatCurrency()` in `lib/utils.ts` encapsulates this.

#### Scenario: Prices display in PHP
- **WHEN** an item price or total value is displayed
- **THEN** it is formatted as `₱1,234.56`

---

### Requirement: Page Title

The browser tab title SHALL be `"Barangay Sta Ana — Government Portal"`.

#### Scenario: Page title is set
- **WHEN** the application loads
- **THEN** the browser tab shows "Barangay Sta Ana — Government Portal"

---

### Requirement: Consistent API Response Shape

All backend API responses SHALL be wrapped in a consistent shape by the `TransformInterceptor`:

```json
{
  "data": <payload>,
  "meta": { ... }  // optional, present for paginated responses
}
```

#### Scenario: API responses are wrapped
- **WHEN** any API endpoint returns data
- **THEN** it is wrapped in `{ "data": ... }` format

---

### Requirement: Global Validation

The backend SHALL apply a global `ValidationPipe` with:
- `whitelist: true` — strips unknown properties.
- `forbidNonWhitelisted: true` — rejects unknown properties with `400`.
- `transform: true` — auto-transforms payloads to DTO instances.

#### Scenario: Unknown property rejected
- **WHEN** an API request includes a field not in the DTO
- **THEN** a `400 Bad Request` is returned

---

### Requirement: Swagger / OpenAPI Documentation

The backend SHALL expose interactive API documentation at `GET /api/docs` via Swagger UI. All endpoints, DTOs, and entities are annotated with `@Api*` decorators.

#### Scenario: Access Swagger docs
- **WHEN** a developer navigates to `http://localhost:3000/api/docs`
- **THEN** the full interactive API documentation is displayed
