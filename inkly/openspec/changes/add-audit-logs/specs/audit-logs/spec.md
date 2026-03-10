## ADDED Requirements

### Requirement: Audit Log Data Model

The system SHALL persist an AuditLog entity with the following fields:

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key, auto-generated |
| action | enum | `CREATE`, `UPDATE`, `DELETE` |
| entityType | string | e.g. `item`, `category` |
| entityId | UUID | ID of the affected entity |
| entityName | string | Snapshot of entity name at time of action |
| userId | UUID | FK → User, the acting user |
| details | text | Optional summary of the change |
| createdAt | timestamp | Auto-set |

Audit log entries are immutable — they are created but never updated or deleted.

#### Scenario: Audit log entry is stored in PostgreSQL
- **WHEN** a mutation (create, update, or delete) occurs on an item or category
- **THEN** a new row is inserted into the `audit_logs` table with the acting user's ID

---

### Requirement: Audit Log API

The system SHALL provide `GET /api/audit-logs` returning paginated audit log entries ordered by `createdAt DESC`, with the related user eagerly loaded (name only, no password).

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Entries per page |
| entityType | string | — | Filter by entity type (`item`, `category`) |
| search | string | — | Search by entity name |

The response SHALL include `data` (array of audit log entries with user name) and `meta` (pagination).

#### Scenario: List all audit logs with pagination
- **WHEN** `GET /api/audit-logs?page=1&limit=10` is called
- **THEN** the 10 most recent audit log entries are returned with pagination meta

#### Scenario: Filter by entity type
- **WHEN** `GET /api/audit-logs?entityType=item` is called
- **THEN** only audit entries for items are returned

#### Scenario: Search by entity name
- **WHEN** `GET /api/audit-logs?search=holographic` is called
- **THEN** only audit entries whose entity name contains "holographic" are returned

---

### Requirement: Automatic Audit Logging on Item Mutations

The system SHALL create audit log entries when:
1. An item is created → action `CREATE`, entityType `item`
2. An item is updated → action `UPDATE`, entityType `item`, details summarize changed fields
3. An item is deleted → action `DELETE`, entityType `item`
4. Stock is adjusted → action `UPDATE`, entityType `item`, details include quantity change and reason

#### Scenario: Item creation logged
- **WHEN** a user creates a new item named "Holographic Cat"
- **THEN** an audit log entry is created with action `CREATE`, entityType `item`, entityName `Holographic Cat`, and the user's ID

#### Scenario: Item update logged
- **WHEN** a user updates an item's price
- **THEN** an audit log entry is created with action `UPDATE` and details describing the change

#### Scenario: Item deletion logged
- **WHEN** a user deletes an item
- **THEN** an audit log entry is created with action `DELETE` and the item's name is preserved in `entityName`

#### Scenario: Stock adjustment logged
- **WHEN** a user adjusts stock with reason "Restocked 50 units"
- **THEN** an audit log entry is created with action `UPDATE`, details including the quantity change and reason

---

### Requirement: Automatic Audit Logging on Category Mutations

The system SHALL create audit log entries when:
1. A category is created → action `CREATE`, entityType `category`
2. A category is updated → action `UPDATE`, entityType `category`
3. A category is deleted → action `DELETE`, entityType `category`

#### Scenario: Category creation logged
- **WHEN** a user creates a category named "Die Cut"
- **THEN** an audit log entry is created with action `CREATE`, entityType `category`, entityName `Die Cut`

#### Scenario: Category deletion logged
- **WHEN** a user deletes a category
- **THEN** an audit log entry is created with action `DELETE` and the category name is preserved

---

### Requirement: Frontend Audit Logs Page

The frontend SHALL provide a `/audit-logs` page displaying a paginated table of audit log entries.

Each row shows:
- Action badge (`Created` green, `Updated` blue, `Deleted` red)
- Entity type and name
- User name (who performed the action)
- Details (if any)
- Formatted timestamp

The page supports:
- Filtering by entity type via a dropdown
- Searching by entity name
- Pagination

#### Scenario: View audit logs page
- **WHEN** the user navigates to `/audit-logs`
- **THEN** a paginated table of audit log entries is displayed with user attribution

#### Scenario: Filter audit logs by entity type
- **WHEN** the user selects "Item" from the entity type dropdown
- **THEN** only item-related audit entries are shown

---

### Requirement: Sidebar Audit Logs Link

The sidebar navigation SHALL include an "Audit Logs" link that navigates to `/audit-logs`.

#### Scenario: Audit Logs link in sidebar
- **WHEN** the user views the sidebar
- **THEN** an "Audit Logs" navigation item is visible and navigates to `/audit-logs`
