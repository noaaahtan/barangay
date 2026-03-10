# Capability: Stock History

## Purpose

Immutable audit log of every stock quantity change, providing full traceability of inventory movements.

## Requirements

### Requirement: Stock History Data Model

The system SHALL persist a StockHistory entity with the following fields:

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key, auto-generated |
| itemId | UUID | Required, FK → Item |
| quantityChange | integer | Positive (add) or negative (remove) |
| quantityAfter | integer | Resulting quantity after the change |
| reason | string | Required, max 500 chars |
| createdAt | timestamp | Auto-set |

Stock history entries are immutable — they are created but never updated or individually deleted.

#### Scenario: Stock history entry is stored in PostgreSQL
- **WHEN** a stock change occurs on any item
- **THEN** a new row is inserted into the `stock_history` table

---

### Requirement: Automatic Stock Logging

The system SHALL automatically create stock history entries when:

1. An item is created with `quantity > 0` → reason: `"Initial stock"`
2. An item's `quantity` is updated via `PATCH /api/items/:id` → reason: `"Manual quantity update"`
3. Stock is adjusted via `POST /api/items/:id/adjust-stock` → reason: user-provided

#### Scenario: Initial stock logged on item creation
- **WHEN** an item is created with `quantity: 50`
- **THEN** a stock history entry is created with `quantityChange: 50`, `quantityAfter: 50`, `reason: "Initial stock"`

#### Scenario: Manual update logged
- **WHEN** an item's quantity is changed from 50 to 80 via PATCH
- **THEN** a stock history entry is created with `quantityChange: 30`, `quantityAfter: 80`, `reason: "Manual quantity update"`

#### Scenario: Adjust stock logged
- **WHEN** stock is adjusted with `quantityChange: -5, reason: "Sold 5 units"`
- **THEN** a stock history entry is created with `quantityChange: -5`, `quantityAfter: 45`, `reason: "Sold 5 units"`

---

### Requirement: Recent Stock History

The system SHALL provide `GET /api/stock-history/recent?limit=N` returning the most recent stock history entries across all items, ordered by `createdAt DESC`, with the related item eagerly loaded.

Default limit: 20.

#### Scenario: Retrieve recent activity
- **WHEN** `GET /api/stock-history/recent?limit=10` is called
- **THEN** the 10 most recent stock history entries (with item data) are returned

---

### Requirement: Item Stock History

The system SHALL provide `GET /api/stock-history/:itemId` returning all stock history entries for a specific item, ordered by `createdAt DESC`.

#### Scenario: Retrieve stock history for a specific item
- **WHEN** `GET /api/stock-history/<item-uuid>` is called
- **THEN** all stock history entries for that item are returned in reverse chronological order

---

### Requirement: Frontend Stock History Page

The frontend SHALL provide a `/stock-history` page displaying a timeline view of recent stock changes.

Each timeline entry shows:
- Badge with `+N` (green) or `-N` (red) for the quantity change.
- Item name.
- Reason for the change.
- Resulting quantity after the change.
- Formatted timestamp.

The timeline uses a vertical line connecting entries for visual continuity.

#### Scenario: View stock history timeline
- **WHEN** the user navigates to `/stock-history`
- **THEN** a timeline of recent stock changes is displayed

---

### Requirement: Frontend Stock Adjustment Form

The frontend SHALL provide a modal form (triggered from the items table) to adjust stock on a specific item, showing:

- Current stock quantity in an info panel.
- Input for quantity change (positive or negative integer).
- Input for reason (required).
- Preview of new quantity after adjustment.

#### Scenario: Adjust stock via UI
- **WHEN** the user clicks the adjust-stock button on an item row
- **THEN** a modal opens with the current quantity, and the user can submit an adjustment with a reason
