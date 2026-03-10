# Design: Inventory Items

## Backend Architecture

Follows the Controller → Service → Repository layered pattern.

| File | Responsibility |
|------|---------------|
| `backend/src/items/items.controller.ts` | Routes, Swagger docs, file upload interceptor, param parsing |
| `backend/src/items/items.service.ts` | Business logic: SKU uniqueness, stock logging, negative-stock guard |
| `backend/src/items/items.repository.ts` | TypeORM queries: find, create, save, remove, aggregations |
| `backend/src/items/entities/item.entity.ts` | TypeORM entity definition |
| `backend/src/items/dto/create-item.dto.ts` | Validation for create payload |
| `backend/src/items/dto/update-item.dto.ts` | `PartialType(CreateItemDto)` — no field duplication |
| `backend/src/items/dto/adjust-stock.dto.ts` | Validation for stock adjustment |
| `backend/src/items/dto/items-query.dto.ts` | Extends `PaginationQueryDto` with search + categoryId |

### Image Upload

- Uses `multer` with `diskStorage` strategy.
- Files saved to `uploads/items/` with UUID filenames to avoid collisions.
- Static file serving configured in `main.ts` via `express.static`.
- Accepted MIME types: `jpg`, `jpeg`, `png`, `gif`, `webp`.
- 5 MB file size limit enforced by multer.

### Cross-Module Dependency

`ItemsService` depends on `StockHistoryRepository` (injected) to log stock changes. The `StockHistoryModule` exports its repository for this purpose.

## Frontend Architecture

| File | Responsibility |
|------|---------------|
| `frontend/src/pages/ItemsPage.tsx` | Page shell — wires modals, toasts, search, filters |
| `frontend/src/features/items/useItemsApi.ts` | API hook: fetch, create, update, delete, adjustStock, uploadImage, getImageUrl |
| `frontend/src/features/items/ItemForm.tsx` | Create/edit form with image upload preview |
| `frontend/src/features/items/ItemsTable.tsx` | Table with columns: image, name, category, size, qty, price, status, actions |
| `frontend/src/features/items/StockAdjustForm.tsx` | Stock adjustment modal form |
| `frontend/src/features/items/LowStockBadge.tsx` | In-stock / Low Stock / Out of Stock badge |

### Image Handling

- `useItemsApi.uploadImage(itemId, file)` sends `multipart/form-data` to backend.
- `useItemsApi.getImageUrl(path)` prepends `http://localhost:3000` to the stored path.
- `ItemForm` uses a `useRef` file input with click-to-upload and preview via `URL.createObjectURL`.
