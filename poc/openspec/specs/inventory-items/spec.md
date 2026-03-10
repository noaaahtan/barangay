# Capability: Inventory Items

## Purpose

Manage sticker inventory items — full CRUD, physical dimensions, pricing, image uploads, stock adjustment, low-stock alerts, and search/filter/pagination.

## Requirements

### Requirement: Item Data Model

The system SHALL persist an Item entity with the following fields:

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key, auto-generated |
| name | string | Required, max 200 chars |
| sku | string | Required, unique, max 50 chars |
| description | text | Optional, max 1000 chars |
| quantity | integer | Default 0, min 0 |
| price | decimal(10,2) | Default 0, min 0 |
| lowStockThreshold | integer | Default 10, min 0 |
| width | decimal(8,2) | Optional — sticker width |
| height | decimal(8,2) | Optional — sticker height |
| sizeUnit | varchar(10) | Default `'in'`, one of `in`, `cm`, `mm` |
| imageUrl | text | Optional — path to uploaded product image |
| categoryId | UUID | Optional, FK → Category (SET NULL on delete) |
| createdAt | timestamp | Auto-set |
| updatedAt | timestamp | Auto-set |

#### Scenario: Item entity is stored in PostgreSQL
- **WHEN** a new item is created via the API
- **THEN** the `items` table stores all fields above with correct types and defaults

---

### Requirement: Create Item

The system SHALL allow creating a new item via `POST /api/items` with a JSON body matching `CreateItemDto`.

- SKU MUST be unique; duplicate SKUs SHALL return `409 Conflict`.
- If `quantity > 0`, an initial stock history entry SHALL be logged with reason `"Initial stock"`.

#### Scenario: Successfully create an item
- **WHEN** a valid `CreateItemDto` is sent
- **THEN** the item is persisted and returned with status `201`

#### Scenario: Duplicate SKU
- **WHEN** a `CreateItemDto` is sent with an existing SKU
- **THEN** the API returns `409 Conflict` with a descriptive message

---

### Requirement: Read Items (List)

The system SHALL allow listing items via `GET /api/items` with optional query parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 20 | Items per page |
| search | string | — | Fuzzy search on `name` or `sku` |
| categoryId | UUID | — | Filter by category |

The response SHALL include `data` (array of items with category relation) and `meta` (pagination: `total`, `page`, `limit`, `totalPages`).

#### Scenario: List all items with pagination
- **WHEN** `GET /api/items?page=1&limit=10` is called
- **THEN** the first 10 items are returned with correct pagination meta

#### Scenario: Search items by name
- **WHEN** `GET /api/items?search=cat` is called
- **THEN** only items whose name or SKU contains "cat" are returned

#### Scenario: Filter by category
- **WHEN** `GET /api/items?categoryId=<uuid>` is called
- **THEN** only items belonging to that category are returned

---

### Requirement: Read Single Item

The system SHALL return a single item by ID via `GET /api/items/:id`.

- If the item does not exist, the API SHALL return `404 Not Found`.

#### Scenario: Get item by ID
- **WHEN** `GET /api/items/<valid-uuid>` is called
- **THEN** the full item object (with category relation) is returned

#### Scenario: Item not found
- **WHEN** `GET /api/items/<non-existent-uuid>` is called
- **THEN** the API returns `404 Not Found`

---

### Requirement: Update Item

The system SHALL allow partial updates via `PATCH /api/items/:id` with `UpdateItemDto` (all fields optional, derived from `PartialType(CreateItemDto)`).

- If SKU is changed, uniqueness MUST be re-validated.
- If `quantity` changes, a stock history entry SHALL be logged with reason `"Manual quantity update"`.

#### Scenario: Update item name
- **WHEN** `PATCH /api/items/:id` with `{ "name": "New Name" }` is sent
- **THEN** only the name is updated; other fields remain unchanged

#### Scenario: Update with duplicate SKU
- **WHEN** `PATCH /api/items/:id` with a SKU that already exists on another item
- **THEN** the API returns `409 Conflict`

---

### Requirement: Delete Item

The system SHALL allow deleting an item via `DELETE /api/items/:id`.

- Cascading: associated stock history entries are also removed.

#### Scenario: Delete an existing item
- **WHEN** `DELETE /api/items/<valid-uuid>` is called
- **THEN** the item and its stock history are removed; status `200` is returned

---

### Requirement: Adjust Stock

The system SHALL allow stock adjustments via `POST /api/items/:id/adjust-stock` with `AdjustStockDto`:

| Field | Type | Description |
|-------|------|-------------|
| quantityChange | integer | Positive to add, negative to remove |
| reason | string | Required, max 500 chars |

- The new quantity MUST NOT go below 0; otherwise `400 Bad Request`.
- A stock history entry SHALL be logged for every adjustment.

#### Scenario: Add stock
- **WHEN** `POST /api/items/:id/adjust-stock` with `{ "quantityChange": 50, "reason": "Restock" }`
- **THEN** item quantity increases by 50 and a history entry is created

#### Scenario: Remove stock
- **WHEN** `POST /api/items/:id/adjust-stock` with `{ "quantityChange": -5, "reason": "Sold" }`
- **THEN** item quantity decreases by 5 and a history entry is created

#### Scenario: Prevent negative stock
- **WHEN** adjustment would result in negative quantity
- **THEN** the API returns `400 Bad Request`

---

### Requirement: Low Stock Alerts

The system SHALL provide `GET /api/items/low-stock` which returns all items where `quantity <= lowStockThreshold`.

#### Scenario: Retrieve low-stock items
- **WHEN** `GET /api/items/low-stock` is called
- **THEN** only items at or below their threshold are returned

---

### Requirement: Image Upload

The system SHALL allow uploading a product image via `POST /api/items/:id/upload-image` as `multipart/form-data`.

- Accepted formats: JPG, JPEG, PNG, GIF, WEBP.
- Maximum file size: 5 MB.
- Files are stored on disk under `uploads/items/` with UUID filenames.
- The item's `imageUrl` field is updated to `/uploads/items/<filename>`.
- Static files are served from the `/uploads` path.

#### Scenario: Upload a valid image
- **WHEN** a PNG file under 5 MB is uploaded
- **THEN** the file is saved, `imageUrl` is updated, and the URL is returned

#### Scenario: Reject non-image file
- **WHEN** a `.pdf` file is uploaded
- **THEN** the API returns `400 Bad Request`

#### Scenario: Reject oversized file
- **WHEN** an image exceeding 5 MB is uploaded
- **THEN** the API returns `400 Bad Request`

---

### Requirement: Inventory Statistics

The system SHALL provide `GET /api/items/stats` returning aggregated data:

| Stat | Description |
|------|-------------|
| totalItems | Count of all items |
| lowStockCount | Count of items where `quantity <= lowStockThreshold` |
| totalValue | Sum of `price × quantity` across all items |
| totalCategories | Count of distinct categories |

#### Scenario: Retrieve stats
- **WHEN** `GET /api/items/stats` is called
- **THEN** the four aggregated statistics are returned

---

### Requirement: Frontend Item List View

The frontend SHALL display a table of all items showing: thumbnail image, name + SKU, category, size (width × height unit), quantity, price (₱ PHP), low-stock status badge, and action buttons (adjust stock, edit, delete).

- The table supports search by name/SKU and filtering by category via dropdowns.
- Empty state shows a message encouraging the user to add their first sticker.

#### Scenario: View items table
- **WHEN** the user navigates to `/items`
- **THEN** a paginated table of items is displayed with all columns

#### Scenario: Search items
- **WHEN** the user types in the search box
- **THEN** the table filters items by name or SKU with a 300ms debounce

---

### Requirement: Frontend Item Form

The frontend SHALL provide a modal form for creating and editing items with fields: name, SKU, description, image upload with preview, quantity, price, low stock alert threshold, sticker size (width, height, unit dropdown), and category dropdown.

- Image upload shows a drag-and-drop area with preview and remove button.
- Size fields are grouped in a bordered fieldset labeled "Sticker Size".
- Validation: name and SKU are required; numeric fields must be ≥ 0.

#### Scenario: Create a new item
- **WHEN** the user fills the form and clicks "Create Sticker"
- **THEN** the item is created, image is uploaded (if provided), and a success toast appears

#### Scenario: Edit an existing item
- **WHEN** the user clicks edit on an item
- **THEN** the form pre-fills with item data including image preview
