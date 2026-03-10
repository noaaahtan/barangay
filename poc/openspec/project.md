# Project Context

## Purpose
Barangay Sta Ana Government Portal — digital platform for citizens to apply for barangay requirements, reserve equipment, and submit reports (e-sumbong). Citizens can track application status and receive notifications when documents are ready for pickup.

## Tech Stack
- **Backend**: NestJS, TypeORM, PostgreSQL, Swagger/OpenAPI
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, React Router, Axios
- **Monorepo**: pnpm workspaces (`backend/`, `frontend/`)

## Project Conventions

### Code Style
- TypeScript strict mode in both backend and frontend
- Prefer `const` over `let`; never use `var`
- Use descriptive names — no abbreviations except widely known ones (DTO, API, URL, etc.)
- One export per file for classes and components; barrel exports via `index.ts` for groups

### DRY Principle
- Never duplicate logic. Extract shared code into:
  - **Backend**: `common/` folder (shared DTOs, interceptors, constants, utilities)
  - **Frontend**: `components/ui/` (generic UI), `hooks/` (shared hooks), `lib/utils.ts` (helpers)
- Backend DTOs: `UpdateXxxDto` always extends `PartialType(CreateXxxDto)` — never duplicate fields
- Frontend: reusable UI components must be **project-agnostic** (no domain knowledge)

### Architecture Patterns

#### Backend — Controller / Service / Repository

Every NestJS module follows a strict three-layer architecture:

| Layer | File | Responsibility |
|-------|------|---------------|
| **Controller** | `*.controller.ts` | HTTP concerns only: route decorators, param parsing, Swagger docs. Delegates to service. No business logic. |
| **Service** | `*.service.ts` | Business logic: validation rules, orchestration, error handling (`NotFoundException`, `ConflictException`, etc.). Never calls TypeORM directly — delegates all DB access to the repository. |
| **Repository** | `*.repository.ts` | Database access only: queries, inserts, updates, deletes via TypeORM. No business logic, no HTTP exceptions. Returns raw data or `null`. |

Rules:
- Controllers must never import repositories or TypeORM
- Services must never use `createQueryBuilder`, `find`, `save`, `remove`, or any TypeORM method — all DB access goes through the repository
- Repositories must never throw HTTP exceptions — they return data or `null`; the service decides what to do with `null`
- Each module registers its repository as a provider and injects it into the service

Example flow:
```
Controller.create(dto)
  → Service.create(dto)         // validates uniqueness, applies business rules
    → Repository.findBySku(sku) // checks DB
    → Repository.create(item)   // persists to DB
```

#### Frontend — Pages / Features / UI

| Layer | Location | Responsibility |
|-------|----------|---------------|
| **UI Components** | `components/ui/` | Generic, reusable, project-agnostic. Accept props for customization (variants, sizes). Know nothing about inventory, items, or categories. |
| **Feature Components** | `features/<domain>/` | Domain-specific. Compose UI components with domain data. Each feature has a `useXxxApi.ts` hook that encapsulates API calls + loading/error state. |
| **Pages** | `pages/` | Thin wrappers. Import feature components and hooks. Wire up modals, toasts, and state. Minimal logic. |
| **Layouts** | `layouts/` | App shell (sidebar, main content area). Used by React Router `<Outlet>`. |

Rules:
- UI components must never import from `features/`, `pages/`, or `api/`
- Feature hooks (`useXxxApi`) encapsulate all API interaction — pages never call `apiClient` directly
- All API types live in `api/types.ts` — one source of truth for TypeScript interfaces
- Use `@/` path alias for all imports (maps to `src/`)
- Use `cn()` from `lib/utils.ts` for conditional Tailwind class merging

### Audit Logging Convention
- Every new feature that introduces **mutations** (create, update, delete) MUST create audit log entries via `AuditLogsService.log()`.
- Controllers extract `req.user.id` and pass it as `userId` to service mutation methods.
- The audit log captures: action (`CREATE` / `UPDATE` / `DELETE`), entity type, entity ID, entity name (snapshot), user ID, and optional details.
- Read operations (GET) are NOT logged.

### Testing Strategy
- (To be defined — not yet implemented)

### Git Workflow
- (To be defined)

## Domain Context

This is **Barangay Sta Ana Government Portal**, a digital platform for citizens to access barangay services.

- **Barangay Requirements**: Applications for various barangay documents and services (e.g., barangay clearance, certificate of residency, business permit). Citizens can submit applications online and track their status until ready for pickup.
- **Equipment Reservation**: Booking system for barangay equipment such as tables, chairs, tents, and other event equipment. Citizens can reserve equipment for their events and track availability.
- **E-Sumbong**: Citizen reporting system for emergencies, incidents, and community issues (e.g., broken streetlights, disputes, safety concerns). Reports are submitted with details and can be tracked through resolution.
- **Application Status**: Real-time tracking of application progress from submission to approval to ready for pickup. Citizens receive notifications when their applications are ready.
- **Dashboard**: Aggregated overview for administrators — total applications, pending reviews, equipment availability, active reports, and recent activity.
- **Audit Log**: Cross-cutting log of every create, update, and delete operation. Records the action, entity, acting user, optional details, and timestamp. Browsable on a dedicated page with search, entity-type filter, and pagination.

## Important Constraints
- JWT-based authentication — all API endpoints require a valid Bearer token except `POST /api/auth/login`
- `synchronize: true` in TypeORM for development — must use migrations before production
- Frontend assumes backend runs on `http://localhost:3000/api`
- Seed users with `pnpm --filter backend run seed` (default password: `barangay2026`)

## External Dependencies
- PostgreSQL must be running locally on port 5432 with a database named `barangay_sta_ana`
