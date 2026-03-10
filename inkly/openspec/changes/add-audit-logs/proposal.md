# Change: Add Audit Logs

## Why

The application tracks stock changes but has no general audit trail showing **who** performed **what** action and **when**. With authentication now in place, every mutating action (create, update, delete on items and categories; stock adjustments) can be attributed to a user. An Audit Logs page in the sidebar will give the team full visibility into who created, edited, or deleted records.

## What Changes

- **New `AuditLog` entity** — `id`, `action` (enum: `CREATE`, `UPDATE`, `DELETE`), `entityType` (e.g. `item`, `category`), `entityId`, `entityName` (human-readable snapshot), `userId`, `details` (JSON diff or summary), `createdAt`.
- **New `audit-logs` module** (backend) — `AuditLogsRepository`, `AuditLogsService`, `AuditLogsController` (`GET /api/audit-logs` with pagination + filters).
- **Automatic logging** — item and category services call `AuditLogsService.log()` on create/update/delete. Stock adjustments also produce audit entries.
- **Frontend `/audit-logs` page** — a filterable, paginated timeline showing action, entity, user name, details, and timestamp.
- **Sidebar** — new "Audit Logs" nav item with a shield/clipboard icon.
- **AGENTS.md** — updated to state that any new feature with mutations MUST create audit log entries.

## Impact

- Affected specs: new `audit-logs` capability
- Affected specs (modified): `inventory-items` (services log audit entries), `category-management` (services log audit entries), `stock-history` (stock adjustments log audit entries), `branding-theming` (sidebar gains new nav item)
- Affected code:
  - `backend/src/audit-logs/` — new module
  - `backend/src/items/items.service.ts` — inject `AuditLogsService`, call on create/update/delete
  - `backend/src/categories/categories.service.ts` — inject `AuditLogsService`, call on create/update/delete
  - `backend/src/items/items.controller.ts` — pass `req.user` to service methods
  - `backend/src/categories/categories.controller.ts` — pass `req.user` to service methods
  - `frontend/src/features/audit-logs/` — new feature
  - `frontend/src/pages/AuditLogsPage.tsx` — new page
  - `frontend/src/layouts/Sidebar.tsx` — add nav item
  - `frontend/src/App.tsx` — add route
  - `frontend/src/api/types.ts` — add `AuditLog` type
  - `openspec/AGENTS.md` — add audit log convention
