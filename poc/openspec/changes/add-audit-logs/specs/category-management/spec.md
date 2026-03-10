## MODIFIED Requirements

### Requirement: Create Category

The system SHALL allow creating a new category via `POST /api/categories` with `CreateCategoryDto` (name required, unique).

- Duplicate names SHALL return `409 Conflict`.
- An audit log entry SHALL be created with action `CREATE`, entityType `category`, and the acting user's ID.

#### Scenario: Successfully create a category
- **WHEN** a valid `CreateCategoryDto` is sent by an authenticated user
- **THEN** the category is persisted, returned with status `201`, and an audit log entry is created attributing the action to the user

#### Scenario: Duplicate category name
- **WHEN** a `CreateCategoryDto` is sent with a name that already exists
- **THEN** the API returns `409 Conflict`

---

### Requirement: Update Category

The system SHALL allow updating a category via `PATCH /api/categories/:id` with `UpdateCategoryDto`.

- Name uniqueness MUST be re-validated if changed.
- An audit log entry SHALL be created with action `UPDATE`, entityType `category`, and the acting user's ID.

#### Scenario: Update category name
- **WHEN** `PATCH /api/categories/:id` with `{ "name": "New Name" }` is sent
- **THEN** the category name is updated and an audit log entry is created

---

### Requirement: Delete Category

The system SHALL allow deleting a category via `DELETE /api/categories/:id`.

- Associated items have their `categoryId` set to `NULL` (cascade SET NULL).
- An audit log entry SHALL be created with action `DELETE`, entityType `category`, preserving the category name, and the acting user's ID.

#### Scenario: Delete a category with associated items
- **WHEN** a category with associated items is deleted
- **THEN** the category is removed, items' `categoryId` becomes `NULL`, and an audit log entry is created
