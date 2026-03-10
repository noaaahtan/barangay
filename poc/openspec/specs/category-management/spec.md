# Capability: Category Management

## Purpose

Manage item categories — CRUD operations for grouping stickers into categories.

## Requirements

### Requirement: Category Data Model

The system SHALL persist a Category entity with the following fields:

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key, auto-generated |
| name | string | Required, unique, max 100 chars |
| createdAt | timestamp | Auto-set |
| updatedAt | timestamp | Auto-set |

A category has a one-to-many relationship with items. Deleting a category sets `categoryId` to `NULL` on associated items.

#### Scenario: Category entity is stored in PostgreSQL
- **WHEN** a new category is created
- **THEN** the `categories` table stores the fields above with correct types

---

### Requirement: Create Category

The system SHALL allow creating a category via `POST /api/categories` with `CreateCategoryDto` containing a `name` field.

- Category name MUST be unique; duplicates SHALL return `409 Conflict`.

#### Scenario: Successfully create a category
- **WHEN** `POST /api/categories` with `{ "name": "Die Cut" }` is sent
- **THEN** the category is persisted and returned with status `201`

#### Scenario: Duplicate category name
- **WHEN** a category with the same name already exists
- **THEN** the API returns `409 Conflict`

---

### Requirement: List All Categories

The system SHALL return all categories via `GET /api/categories`, ordered by name.

#### Scenario: Retrieve all categories
- **WHEN** `GET /api/categories` is called
- **THEN** all categories are returned as an array

---

### Requirement: Get Single Category

The system SHALL return a single category by ID via `GET /api/categories/:id`.

#### Scenario: Category found
- **WHEN** `GET /api/categories/<valid-uuid>` is called
- **THEN** the category is returned

#### Scenario: Category not found
- **WHEN** `GET /api/categories/<non-existent-uuid>` is called
- **THEN** the API returns `404 Not Found`

---

### Requirement: Update Category

The system SHALL allow updating a category via `PATCH /api/categories/:id` with `UpdateCategoryDto` (all fields optional).

- If name is changed, uniqueness MUST be re-validated.

#### Scenario: Update category name
- **WHEN** `PATCH /api/categories/:id` with `{ "name": "Vinyl Stickers" }` is sent
- **THEN** the name is updated

---

### Requirement: Delete Category

The system SHALL allow deleting a category via `DELETE /api/categories/:id`.

- On deletion, all items referencing this category SHALL have their `categoryId` set to `NULL` (via `ON DELETE SET NULL`).

#### Scenario: Delete a category with associated items
- **WHEN** a category that has items is deleted
- **THEN** the category is removed and those items' `categoryId` becomes `NULL`

---

### Requirement: Frontend Category Management

The frontend SHALL provide a `/categories` page with:

- A table listing all categories with name and timestamps.
- Buttons to create, edit, and delete categories.
- Modal forms for creating and editing.
- Confirmation dialog before deletion.
- Toast notifications for success and failure.

#### Scenario: Manage categories from the UI
- **WHEN** the user navigates to `/categories`
- **THEN** all categories are listed with create/edit/delete actions available
