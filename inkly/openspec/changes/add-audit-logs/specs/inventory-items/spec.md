## MODIFIED Requirements

### Requirement: Create Item

The system SHALL allow creating a new item via `POST /api/items` with a JSON body matching `CreateItemDto`.

- SKU MUST be unique; duplicate SKUs SHALL return `409 Conflict`.
- If `quantity > 0`, an initial stock history entry SHALL be logged with reason `"Initial stock"`.
- An audit log entry SHALL be created with action `CREATE`, entityType `item`, and the acting user's ID.

#### Scenario: Successfully create an item
- **WHEN** a valid `CreateItemDto` is sent by an authenticated user
- **THEN** the item is persisted, returned with status `201`, and an audit log entry is created attributing the action to the user

#### Scenario: Duplicate SKU
- **WHEN** a `CreateItemDto` is sent with an existing SKU
- **THEN** the API returns `409 Conflict` with a descriptive message

---

### Requirement: Update Item

The system SHALL allow partial updates via `PATCH /api/items/:id` with `UpdateItemDto` (all fields optional, derived from `PartialType(CreateItemDto)`).

- If SKU is changed, uniqueness MUST be re-validated.
- If `quantity` changes, a stock history entry SHALL be logged with reason `"Manual quantity update"`.
- An audit log entry SHALL be created with action `UPDATE`, entityType `item`, and the acting user's ID.

#### Scenario: Update item name
- **WHEN** `PATCH /api/items/:id` with `{ "name": "New Name" }` is sent
- **THEN** only the name is updated; other fields remain unchanged; an audit log entry is created

#### Scenario: Update with duplicate SKU
- **WHEN** `PATCH /api/items/:id` with a SKU that already exists on another item
- **THEN** the API returns `409 Conflict`

---

### Requirement: Delete Item

The system SHALL allow deleting an item via `DELETE /api/items/:id`.

- Cascading: associated stock history entries are also removed.
- An audit log entry SHALL be created with action `DELETE`, entityType `item`, preserving the item name, and the acting user's ID.

#### Scenario: Delete an existing item
- **WHEN** `DELETE /api/items/<valid-uuid>` is called by an authenticated user
- **THEN** the item and its stock history are removed; status `200` is returned; an audit log entry is created

---

### Requirement: Adjust Stock

The system SHALL allow stock adjustments via `POST /api/items/:id/adjust-stock` with `AdjustStockDto`:

| Field | Type | Description |
|-------|------|-------------|
| quantityChange | integer | Positive to add, negative to remove |
| reason | string | Required, max 500 chars |

- The new quantity MUST NOT go below 0; otherwise `400 Bad Request`.
- A stock history entry SHALL be logged for every adjustment.
- An audit log entry SHALL be created with action `UPDATE`, entityType `item`, details including the quantity change and reason, and the acting user's ID.

#### Scenario: Add stock
- **WHEN** `POST /api/items/:id/adjust-stock` with `{ "quantityChange": 50, "reason": "Restock" }`
- **THEN** item quantity increases by 50, a history entry is created, and an audit log entry is created

#### Scenario: Remove stock
- **WHEN** `POST /api/items/:id/adjust-stock` with `{ "quantityChange": -5, "reason": "Sold" }`
- **THEN** item quantity decreases by 5, a history entry is created, and an audit log entry is created

#### Scenario: Prevent negative stock
- **WHEN** adjustment would result in negative quantity
- **THEN** the API returns `400 Bad Request`
