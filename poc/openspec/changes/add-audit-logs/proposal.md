# Change: Add Audit Logs

## Why

The application needs a general audit trail showing **who** performed **what** action and **when**. With authentication now in place, every mutating action (create, update, delete on applications, equipment reservations, e-sumbong reports) can be attributed to a user. An Audit Logs page in the sidebar will give administrators full visibility into system activity.

## What Changes

- **New `AuditLog` entity** — `id`, `action` (enum: `CREATE`, `UPDATE`, `DELETE`), `entityType` (e.g. `application`, `equipment`, `esumbong`), `entityId`, `entityName` (human-readable snapshot), `userId`, `details` (JSON diff or summary), `createdAt`.
- **New `audit-logs` module** (backend) — `AuditLogsRepository`, `AuditLogsService`, `AuditLogsController` (`GET /api/audit-logs` with pagination + filters).
- **Automatic logging** — all services call `AuditLogsService.log()` on create/update/delete operations.
- **Frontend `/audit-logs` page** — a filterable, paginated timeline showing action, entity, user name, details, and timestamp.
- **Sidebar** — "Audit Logs" nav item with a clipboard icon (admin only).
- **AGENTS.md** — updated to state that any new feature with mutations MUST create audit log entries.

## Impact

- Affected specs: new `audit-logs` capability
- Affected specs (modified): `branding-theming` (sidebar includes audit logs nav item)
- Affected code:
  - `backend/src/audit-logs/` — audit logs module
  - All service modules — inject `AuditLogsService`, call on create/update/delete
  - All controllers — pass `req.user` to service methods
  - `frontend/src/features/audit-logs/` — audit logs feature
  - `frontend/src/pages/AuditLogsPage.tsx` — audit logs page
  - `frontend/src/layouts/Sidebar.tsx` — audit logs nav item
  - `frontend/src/App.tsx` — audit logs route
  - `frontend/src/api/types.ts` — `AuditLog` type
  - `openspec/AGENTS.md` — audit log convention
