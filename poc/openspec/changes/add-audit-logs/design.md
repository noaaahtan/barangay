## Context

With JWT authentication now implemented, every API request carries user identity. The team wants to see **who** performed each action (created an item, updated a category, adjusted stock, deleted a record) in a dedicated Audit Logs page.

The existing `stock_history` table already logs stock quantity changes but does not record **who** made the change, and it only covers quantity — not general CRUD operations on items or categories.

## Goals / Non-Goals

**Goals:**
- Log every create, update, and delete on items and categories with the acting user.
- Log stock adjustments as audit entries (in addition to the existing `stock_history` entry).
- Provide a paginated, filterable API endpoint and frontend page.
- Add a sidebar link to the Audit Logs page.
- Document in AGENTS.md that new features MUST include audit log entries for mutations.

**Non-Goals:**
- Retroactively backfill audit logs for actions that happened before this feature.
- Replace the existing `stock_history` table — it remains for domain-specific stock tracking.
- Log read operations (GET requests).
- Full diff storage (store a short summary, not a field-by-field JSON diff).

## Decisions

### 1. Dedicated `audit_logs` Table

- **Decision**: Create a standalone `audit_logs` table rather than extending `stock_history`.
- **Rationale**: Stock history is domain-specific (stock quantities). Audit logs are cross-cutting (any entity, any action). Mixing concerns would violate SRP.

### 2. Entity Design

```
AuditLog {
  id: UUID (PK)
  action: enum('CREATE', 'UPDATE', 'DELETE')
  entityType: string (e.g. 'item', 'category')
  entityId: UUID
  entityName: string  // snapshot of the entity name at the time of action
  userId: UUID (FK → User)
  details: text | null  // optional human-readable summary (e.g. "Changed quantity from 10 to 25")
  createdAt: timestamp
}
```

- `entityName` is denormalized for display purposes — if the entity is later deleted, the name is still visible.
- `details` is a short text summary, not a full JSON diff. Keeps implementation simple.

### 3. Service-Level Logging (not interceptor)

- **Decision**: Services explicitly call `AuditLogsService.log()` after successful mutations.
- **Alternatives considered**:
  - NestJS interceptor: Would require parsing request/response generically — fragile and hard to get entity names from.
  - TypeORM subscriber: Works for entity-level events but doesn't have access to the HTTP request user.
- **Rationale**: Explicit calls in the service layer give full control over what's logged and ensure the user context is passed cleanly.

### 4. Passing User to Services

- **Decision**: Controllers extract `req.user` and pass `userId` as a parameter to service methods that mutate data.
- **Rationale**: Controllers already have access to `@Request()`. Services stay testable (no implicit HTTP dependency).

### 5. Frontend Page

- A simple paginated table with columns: Action (badge), Entity Type, Entity Name, User, Details, Timestamp.
- Filter by entity type (dropdown) and search by entity name.
- Uses the same `Table`, `Badge`, `SearchInput`, `Select` reusable components.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Audit log table grows indefinitely | Acceptable for an internal tool; add retention/archival later if needed |
| Extra DB write per mutation | Single insert per action; negligible overhead |
| Service method signatures change (add `userId` param) | Straightforward refactor; controllers already have `req.user` |

## Open Questions

- Should login/logout be logged as audit events? **Proposed**: Not in this iteration — focus on data mutations only.
