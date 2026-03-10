# Design: Dashboard

## Frontend Architecture

| File | Responsibility |
|------|---------------|
| `frontend/src/pages/DashboardPage.tsx` | Thin page shell — composes StatCards + RecentActivity |
| `frontend/src/features/dashboard/useDashboardApi.ts` | Parallel fetch of stats + recent activity via `Promise.all` |
| `frontend/src/features/dashboard/StatCards.tsx` | Four `StatCard` components with brand color accents |
| `frontend/src/features/dashboard/RecentActivity.tsx` | Recent stock changes card with change badges |

### Data Sources

- Stats: `GET /api/items/stats` — served by `ItemsController.getStats()` → `ItemsRepository.getStats()`
- Recent activity: `GET /api/stock-history/recent?limit=10` — served by `StockHistoryController`

### Error Handling

Dashboard is non-critical. API failures are caught silently — no error toasts or crash. Whatever data is available is rendered.
