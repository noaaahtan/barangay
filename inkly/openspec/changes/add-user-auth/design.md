# Design: Add User Authentication

## Context

The Inkly Inventory app is currently fully public (noted as "No authentication in v1" in `project.md`). This change introduces JWT-based authentication and seeds four team members as initial users.

## Goals / Non-Goals

**Goals:**
- Protect all API endpoints behind authentication.
- Provide a login page with email/password.
- Seed four users so the team can log in immediately.
- Keep the implementation minimal — no registration, password reset, or role-based access control in this iteration.

**Non-Goals:**
- User self-registration (admin seeds users manually or via the seed command).
- Password reset / forgot-password flow.
- Role-based access control (RBAC) — all authenticated users have equal permissions for now.
- Refresh tokens — single JWT access token only (short TTL acceptable for internal tool).
- OAuth / social login.

## Decisions

### 1. JWT Strategy (Passport.js + `@nestjs/jwt`)

- **Decision**: Use `@nestjs/passport` with `passport-jwt` and `@nestjs/jwt`.
- **Alternatives considered**:
  - Session-based auth: Adds server-side state, more complexity for a single-page app.
  - Custom JWT middleware: Passport is the NestJS standard and integrates with guards.
- **Rationale**: Passport is the de-facto NestJS auth solution with built-in guard support. Stateless JWT fits the SPA architecture.

### 2. Password Hashing (bcrypt)

- **Decision**: Use `bcryptjs` (pure JS, no native compilation issues) to hash passwords with 10 salt rounds.
- **Rationale**: Industry standard, widely supported, no native build dependency.

### 3. Token Storage (localStorage)

- **Decision**: Store JWT in `localStorage`. Attach via Axios request interceptor.
- **Alternatives considered**:
  - `httpOnly` cookie: More secure against XSS but adds CSRF complexity and backend cookie handling.
- **Rationale**: This is an internal business tool, not a public-facing app. `localStorage` is simpler and sufficient. The Axios interceptor pattern is already established in `api/client.ts`.

### 4. Global Guard with Public Decorator

- **Decision**: Apply `JwtAuthGuard` globally via `APP_GUARD`. Use a `@Public()` custom decorator to exempt the login endpoint.
- **Rationale**: Secure-by-default. New endpoints are automatically protected without developer action.

### 5. User Entity & Seed Script

- **Decision**: Create a `User` entity with `id (UUID)`, `name`, `email (unique)`, `password (hashed)`, `createdAt`, `updatedAt`. A TypeORM seed script creates 4 users.
- **Seed users**: Noah, Fatima, Geelane, Marco — all with a default password (e.g., `inkly2024`).

### 6. Frontend Auth Flow

```
App mounts → AuthProvider checks localStorage for token
  ├─ Token exists → GET /api/auth/me → success → render app
  │                                   → 401 → clear token → redirect /login
  └─ No token → redirect /login

LoginPage → POST /api/auth/login → success → store token → redirect /
                                  → 401 → show error
```

- `AuthContext` provides `user`, `login()`, `logout()`, `isAuthenticated`.
- `ProtectedRoute` wrapper checks `isAuthenticated`; redirects to `/login` if false.
- Axios response interceptor catches `401` → calls `logout()` → redirects to `/login`.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Token in localStorage vulnerable to XSS | Internal tool; sanitize inputs; migrate to httpOnly cookies later if needed |
| No refresh token — users re-login when token expires | Set generous TTL (24h) for internal use; add refresh flow later |
| Hardcoded default password for seed users | Document in README; users should change on first login (future feature) |

## Open Questions

- Should the seed script clear existing users before seeding, or skip if users exist? **Proposed**: Skip if email already exists (idempotent).
- Token expiration time? **Proposed**: 24 hours for an internal tool.
