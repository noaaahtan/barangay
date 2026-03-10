# Design: Stock History

## Backend Architecture

Follows the Controller → Service → Repository layered pattern.

| File | Responsibility |
|------|---------------|
| `backend/src/stock-history/stock-history.controller.ts` | Routes: recent activity + per-item history |
| `backend/src/stock-history/stock-history.service.ts` | Orchestration: delegates to repository |
| `backend/src/stock-history/stock-history.repository.ts` | TypeORM queries with item eager loading |
| `backend/src/stock-history/entities/stock-history.entity.ts` | Immutable audit log entity |

### Immutability

Stock history entries are write-only. There are no update or delete endpoints — entries are only created as side-effects of item creation, update, or stock adjustment (handled by `ItemsService`).

### Cross-Module Export

`StockHistoryModule` exports `StockHistoryRepository` so `ItemsService` can log stock changes without duplicating database logic.

## Frontend Architecture

| File | Responsibility |
|------|---------------|
| `frontend/src/pages/StockHistoryPage.tsx` | Page shell |
| `frontend/src/features/stock-history/useStockHistoryApi.ts` | API hook: fetchRecent, fetchByItem |
| `frontend/src/features/stock-history/StockTimeline.tsx` | Timeline UI with vertical connector line (brand-100 color) |
| `frontend/src/features/items/StockAdjustForm.tsx` | Modal form used from ItemsPage (cross-feature) |
