# Design: Category Management

## Backend Architecture

Follows the Controller → Service → Repository layered pattern.

| File | Responsibility |
|------|---------------|
| `backend/src/categories/categories.controller.ts` | Routes and Swagger docs |
| `backend/src/categories/categories.service.ts` | Business logic: name uniqueness validation |
| `backend/src/categories/categories.repository.ts` | TypeORM queries |
| `backend/src/categories/entities/category.entity.ts` | TypeORM entity with `OneToMany` to items |
| `backend/src/categories/dto/create-category.dto.ts` | Validation: name required, max 100 chars |
| `backend/src/categories/dto/update-category.dto.ts` | `PartialType(CreateCategoryDto)` |

### Cascade Behavior

- Deleting a category sets `categoryId = NULL` on all associated items via `ON DELETE SET NULL` on the foreign key.

## Frontend Architecture

| File | Responsibility |
|------|---------------|
| `frontend/src/pages/CategoriesPage.tsx` | Page shell with table, modals, toasts |
| `frontend/src/features/categories/useCategoriesApi.ts` | API hook: fetch, create, update, delete |
| `frontend/src/features/categories/CategoryForm.tsx` | Simple name-only form |
| `frontend/src/features/categories/CategoriesTable.tsx` | Table with name, timestamps, and action buttons |

### Cross-Feature Usage

`useCategoriesApi` is also used by `ItemsPage` to populate the category dropdown in the item form and the category filter.
