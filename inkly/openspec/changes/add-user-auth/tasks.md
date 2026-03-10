## 1. Backend — User Entity & Module

- [x] 1.1 Install dependencies: `@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`, `bcryptjs`, and their type definitions
- [x] 1.2 Create `User` entity (`backend/src/users/entities/user.entity.ts`) with id, name, email, password (excluded from responses), timestamps
- [x] 1.3 Create `UsersRepository` (`backend/src/users/users.repository.ts`) — findByEmail, findById, create, findAll
- [x] 1.4 Create `UsersService` (`backend/src/users/users.service.ts`) — findByEmail, findById, validatePassword
- [x] 1.5 Create `UsersController` (`backend/src/users/users.controller.ts`) — `GET /api/users` (list all users, passwords excluded)
- [x] 1.6 Create `UsersModule` — register entity, repository, service, controller; export service

## 2. Backend — Auth Module (JWT)

- [x] 2.1 Create `@Public()` decorator in `backend/src/common/decorators/public.decorator.ts`
- [x] 2.2 Create `JwtStrategy` (`backend/src/auth/strategies/jwt.strategy.ts`) — extracts and validates JWT from Bearer header
- [x] 2.3 Create `JwtAuthGuard` (`backend/src/common/guards/jwt-auth.guard.ts`) — respects `@Public()` decorator
- [x] 2.4 Create `LoginDto` (`backend/src/auth/dto/login.dto.ts`) — email (required, email format), password (required)
- [x] 2.5 Create `AuthService` (`backend/src/auth/auth.service.ts`) — validateUser, login (returns JWT)
- [x] 2.6 Create `AuthController` (`backend/src/auth/auth.controller.ts`) — `POST /api/auth/login` (@Public), `GET /api/auth/me`
- [x] 2.7 Create `AuthModule` — register JwtModule (secret, 24h expiry), PassportModule, import UsersModule
- [x] 2.8 Register `AuthModule` and `UsersModule` in `AppModule`
- [x] 2.9 Register `JwtAuthGuard` as global `APP_GUARD` in `AuthModule`
- [x] 2.10 Update Swagger config in `main.ts` — add `addBearerAuth()` to DocumentBuilder

## 3. Backend — Database Seed

- [x] 3.1 Create seed script (`backend/src/seeds/seed-users.ts`) — connects to DB, hashes passwords, inserts 4 users (idempotent)
- [x] 3.2 Add `"seed"` script to `backend/package.json` — `ts-node src/seeds/seed-users.ts`

## 4. Frontend — Auth Context & API

- [x] 4.1 Add `User` and `LoginPayload` types to `api/types.ts`
- [x] 4.2 Update `api/client.ts` — add request interceptor (attach token) and response interceptor (handle 401)
- [x] 4.3 Create `contexts/AuthContext.tsx` — AuthProvider with user, isAuthenticated, login, logout; validates token on mount
- [x] 4.4 Create `features/auth/useAuthApi.ts` — login and fetchCurrentUser API calls

## 5. Frontend — Login Page & Routing

- [x] 5.1 Create `pages/LoginPage.tsx` — email + password form, error display, Inkly branding
- [x] 5.2 Create `components/ProtectedRoute.tsx` — wraps routes, redirects to `/login` if not authenticated
- [x] 5.3 Update `App.tsx` — wrap app in `AuthProvider`, add `/login` route outside layout, protect all other routes
- [x] 5.4 Update `layouts/Sidebar.tsx` — show user name and logout button in footer area

## 6. Validation & Cleanup

- [x] 6.1 Backend builds cleanly (`pnpm --filter backend run build`)
- [x] 6.2 Frontend builds cleanly (`pnpm --filter frontend run build`)
- [x] 6.3 Update `project.md` — remove "No authentication in v1" constraint
