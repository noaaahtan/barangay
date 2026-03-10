# Design: Branding & Theming

## Color System

Custom brand colors are defined via Tailwind CSS `@theme` directive in `frontend/src/index.css`. Three palettes:

- **Brand (coral/red)**: Primary. Used for active navigation, buttons, focus rings, hover states.
- **Sky brand (blue)**: Accent. Used for stat card icon backgrounds.
- **Gold**: Accent. Used for low-stock warning stat card.

All components reference `brand-*`, `sky-brand-*`, and `gold-*` tokens — changing the values in `@theme` updates the entire app.

## Application Shell

| File | Responsibility |
|------|---------------|
| `frontend/src/layouts/AppLayout.tsx` | `<Sidebar /> + <Outlet />` with `ml-60` main content offset |
| `frontend/src/layouts/Sidebar.tsx` | Fixed sidebar with logo, nav links, version footer |
| `frontend/src/router.tsx` | React Router config: `AppLayout` wraps all routes |

## UI Component Library

All 14 components live in `frontend/src/components/ui/` and are exported from a barrel `index.ts`.

Design decisions:
- **`cn()` utility**: Uses `clsx` + `tailwind-merge` to safely merge conditional classes.
- **`forwardRef`**: Applied to `Input`, `Select`, `Textarea` for DOM ref forwarding.
- **Variant pattern**: `Button` and `Badge` use a `variantStyles` record mapped from props.
- **`Select` custom arrow**: Native `appearance-none` + `HiChevronDown` icon absolutely positioned at `right-3`.
- **`StatCard` icon colors**: Configurable via `iconColor` prop with mapped Tailwind classes.

## Backend Middleware

| Middleware | File | Purpose |
|------------|------|---------|
| `TransformInterceptor` | `backend/src/common/interceptors/transform.interceptor.ts` | Wraps all responses in `{ data }` |
| `ValidationPipe` | `backend/src/main.ts` (global) | Whitelist, transform, forbid non-whitelisted |
| CORS | `backend/src/main.ts` | Allows `http://localhost:5175` |
| Static files | `backend/src/main.ts` | Serves `/uploads` directory |
| Swagger | `backend/src/main.ts` | Interactive docs at `/api/docs` |

## Monorepo Structure

```
business/
├── package.json            # Root: `pnpm run dev` runs both apps
├── pnpm-workspace.yaml     # Declares backend/ and frontend/ as packages
├── backend/                # NestJS app (port 3000)
├── frontend/               # React + Vite app (port 5175)
└── openspec/               # Spec-driven development docs
```

`pnpm run dev` uses `--parallel` flag to start both `backend` and `frontend` dev servers concurrently.
