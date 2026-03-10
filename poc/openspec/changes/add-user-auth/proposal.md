# Change: Add User Authentication & Seed Users

## Why

The application currently has no authentication — all endpoints are public. Adding login protects barangay data and enables per-user accountability. Seed users are needed so barangay staff and citizens can log in immediately after deployment.

## What Changes

- **New `User` entity** with `id`, `name`, `email`, `password` (bcrypt-hashed), `role`, and timestamps.
- **New `auth` module** with `POST /api/auth/login` (returns JWT) and `GET /api/auth/me` (returns current user).
- **New `users` module** with `GET /api/users` (admin-only list) for future user management.
- **JWT-based authentication**: access token stored in `localStorage`; Axios interceptor attaches `Authorization: Bearer <token>` header.
- **Global `JwtAuthGuard`** applied to all routes except login; unauthenticated requests receive `401`.
- **Swagger** updated with `Bearer` auth scheme so docs can test authenticated endpoints.
- **Database seed command** (`pnpm --filter backend run seed`) creates four users: Noah, Fatima, Geelane, Marco.
- **Frontend login page** at `/login` with email + password form; redirect to dashboard on success.
- **Frontend auth context** (`AuthProvider`) manages token, current user, and logout. Protected routes redirect to `/login` when unauthenticated.
- **Sidebar** shows the logged-in user's name and a logout button.

## Impact

- Affected specs: new `user-auth` capability, new `user-seeding` capability
- Affected specs (modified): `branding-theming` (Swagger bearer auth, sidebar user display)
- Affected code:
  - `backend/src/auth/` — new module
  - `backend/src/users/` — new module
  - `backend/src/common/guards/` — new JWT guard
  - `backend/src/main.ts` — Swagger bearer config, global guard
  - `backend/src/app.module.ts` — register new modules
  - `frontend/src/api/client.ts` — Axios auth interceptor
  - `frontend/src/contexts/AuthContext.tsx` — new
  - `frontend/src/pages/LoginPage.tsx` — new
  - `frontend/src/features/auth/` — new
  - `frontend/src/App.tsx` — protected routes
  - `frontend/src/layouts/Sidebar.tsx` — user info + logout
