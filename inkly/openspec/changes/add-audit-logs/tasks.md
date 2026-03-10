## 1. Backend — Audit Log Entity & Module

- [x] 1.1 Create `AuditLog` entity (`backend/src/audit-logs/entities/audit-log.entity.ts`) with id, action (enum), entityType, entityId, entityName, userId (FK → User), details, createdAt
- [x] 1.2 Create `AuditLogsRepository` (`backend/src/audit-logs/audit-logs.repository.ts`) — create, findAll (paginated, filterable by entityType, searchable by entityName)
- [x] 1.3 Create `AuditLogsService` (`backend/src/audit-logs/audit-logs.service.ts`) — `log(action, entityType, entityId, entityName, userId, details?)`, `findAll(query)`
- [x] 1.4 Create `AuditLogsQueryDto` for pagination + filters (page, limit, entityType, search)
- [x] 1.5 Create `AuditLogsController` (`backend/src/audit-logs/audit-logs.controller.ts`) — `GET /api/audit-logs` with pagination + filters
- [x] 1.6 Create `AuditLogsModule` — register entity, repository, service, controller; export service
- [x] 1.7 Register `AuditLogsModule` in `AppModule`

## 2. Backend — Integrate Audit Logging into Existing Services

- [x] 2.1 Update `ItemsController` — extract `req.user.id` and pass `userId` to service methods (`create`, `update`, `remove`, `adjustStock`)
- [x] 2.2 Update `ItemsService` — accept `userId` param on `create`, `update`, `remove`, `adjustStock`; call `AuditLogsService.log()` after each successful mutation
- [x] 2.3 Import `AuditLogsModule` in `ItemsModule`
- [x] 2.4 Update `CategoriesController` — extract `req.user.id` and pass `userId` to service methods
- [x] 2.5 Update `CategoriesService` — accept `userId` param on `create`, `update`, `remove`; call `AuditLogsService.log()` after each successful mutation
- [x] 2.6 Import `AuditLogsModule` in `CategoriesModule`

## 3. Frontend — Audit Logs Feature

- [x] 3.1 Add `AuditLog` type and `AuditLogsQuery` to `api/types.ts`
- [x] 3.2 Create `features/audit-logs/useAuditLogsApi.ts` — fetch paginated audit logs with filters
- [x] 3.3 Create `features/audit-logs/AuditLogsTable.tsx` — table component showing action badge, entity, user, details, timestamp
- [x] 3.4 Create `pages/AuditLogsPage.tsx` — page with search, entity type filter, and paginated table
- [x] 3.5 Update `App.tsx` — add `/audit-logs` route
- [x] 3.6 Update `Sidebar.tsx` — add "Audit Logs" nav item with icon

## 4. Documentation & Validation

- [x] 4.1 Update `project.md` — add convention that new features with mutations MUST create audit log entries
- [x] 4.2 Verify backend builds cleanly
- [x] 4.3 Verify frontend builds cleanly
- [x] 4.4 End-to-end: create/update/delete items and categories, verify audit logs appear on the page
