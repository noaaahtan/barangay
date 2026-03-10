# Change: Add Applications Module

## Why

The Barangay Sta Ana Government Portal needs an application system for citizens to apply for barangay requirements (barangay clearance, certificate of residency, business permits, indigency certificates, etc.) online. Currently, citizens must queue at the barangay hall. An online application system with status tracking and role-based management is a core feature described in the project context but not yet implemented.

## What Changes

- **New `Application` entity** with reference number, type, status, applicant details, purpose, notes, and timestamps
- **New `applications` module** (backend) — repository, service, controller with CRUD endpoints
- **Reference number generator** — auto-generated unique format `APP-YYYY-XXXXXX`
- **Status workflow** — strict state transitions (submitted → under review → approved → ready for pickup)
- **Role-based access** — admins manage all; citizens view/create their own
- **Audit logging** — all mutations logged via `AuditLogsService`
- **Frontend admin page** (`/applications`) — filterable table, status updates, notes
- **Frontend citizen page** (`/my-applications`) — view own applications, submit new, track status
- **Application submission form** — with document type selection and applicant info
- **Dashboard integration** — add applications metrics (total, pending, ready for pickup)
- **Sidebar navigation** — "Applications" (admin) and "My Applications" (citizen)

## Impact

- Affected specs: new `applications` capability
- Affected specs (modified): `dashboard`, `branding-theming`
- Affected code:
  - `backend/src/applications/` — new module
  - `backend/src/common/constants.ts` — enums
  - `backend/src/app.module.ts` — register module
  - `frontend/src/features/applications/` — new feature
  - `frontend/src/pages/` — ApplicationsPage, MyApplicationsPage
  - `frontend/src/layouts/Sidebar.tsx` — nav items
  - `frontend/src/App.tsx` — routes
  - `frontend/src/api/types.ts` — types
