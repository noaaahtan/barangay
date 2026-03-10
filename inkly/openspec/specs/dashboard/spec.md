# Capability: Dashboard

## Purpose

Overview page displaying aggregated inventory statistics and recent stock activity at a glance.

## Requirements

### Requirement: Dashboard Statistics Cards

The frontend dashboard SHALL display four stat cards:

| Card | Value Source | Icon Color |
|------|-------------|------------|
| Total Stickers | `stats.totalItems` | Coral (brand) |
| Low Stock | `stats.lowStockCount` | Gold |
| Total Value | `stats.totalValue` (formatted as ₱ PHP) | Sky blue |
| Categories | `stats.totalCategories` | Default (slate) |

Each card shows a label, a formatted numeric value, and a colored icon.

#### Scenario: Dashboard loads stats
- **WHEN** the user navigates to `/` (Dashboard)
- **THEN** four stat cards are displayed with live data from `GET /api/items/stats`

#### Scenario: Currency formatting
- **WHEN** the total value is displayed
- **THEN** it is formatted as Philippine Peso (₱) using `Intl.NumberFormat('en-PH', { currency: 'PHP' })`

---

### Requirement: Recent Activity Feed

The dashboard SHALL display a "Recent Activity" section showing the 10 most recent stock changes.

Each entry shows:
- Quantity change badge (`+N` green or `-N` red).
- Item name (or "Unknown Item" if the item was deleted).
- Reason for the change.
- Resulting quantity.
- Formatted timestamp.

Data is fetched from `GET /api/stock-history/recent?limit=10`.

#### Scenario: Recent activity with entries
- **WHEN** stock changes exist
- **THEN** up to 10 recent changes are displayed in a card with item name, change badge, reason, and timestamp

#### Scenario: No recent activity
- **WHEN** no stock changes exist
- **THEN** a message "No stock changes yet." is displayed

---

### Requirement: Dashboard Data Fetching

The dashboard SHALL fetch stats and recent activity in parallel using `Promise.all`. Failures are non-critical and SHALL fail silently (no error toasts).

#### Scenario: Dashboard data loading
- **WHEN** the dashboard page mounts
- **THEN** both `GET /api/items/stats` and `GET /api/stock-history/recent` are called in parallel
- **THEN** a loading indicator is shown until both resolve

#### Scenario: API failure is graceful
- **WHEN** one of the dashboard API calls fails
- **THEN** the page does not crash; available data is still rendered
