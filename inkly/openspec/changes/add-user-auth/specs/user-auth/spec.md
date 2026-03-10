## ADDED Requirements

### Requirement: User Data Model

The system SHALL persist a User entity with the following fields:

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key, auto-generated |
| name | string | Required, max 100 chars |
| email | string | Required, unique, valid email format |
| password | string | Required, bcrypt-hashed, never returned in API responses |
| createdAt | timestamp | Auto-set |
| updatedAt | timestamp | Auto-set |

The password field MUST be excluded from all API responses using `class-transformer` `@Exclude()`.

#### Scenario: User entity is stored in PostgreSQL
- **WHEN** a user record is created
- **THEN** the `users` table stores all fields with correct types and the password is bcrypt-hashed

---

### Requirement: Login Endpoint

The system SHALL provide `POST /api/auth/login` accepting `{ email, password }` and returning a JWT access token.

- On valid credentials, the response SHALL include `{ accessToken }`.
- On invalid email or password, the API SHALL return `401 Unauthorized`.
- The JWT payload SHALL contain `{ sub: user.id, email: user.email }`.
- The JWT SHALL expire after 24 hours.
- The login endpoint MUST be publicly accessible (exempt from the global auth guard).

#### Scenario: Successful login
- **WHEN** `POST /api/auth/login` with valid email and password is sent
- **THEN** a `200` response with `{ accessToken: "<jwt>" }` is returned

#### Scenario: Invalid password
- **WHEN** `POST /api/auth/login` with a valid email but wrong password is sent
- **THEN** a `401 Unauthorized` response is returned

#### Scenario: Non-existent email
- **WHEN** `POST /api/auth/login` with an email that does not exist is sent
- **THEN** a `401 Unauthorized` response is returned

---

### Requirement: Current User Endpoint

The system SHALL provide `GET /api/auth/me` returning the authenticated user's profile (id, name, email, timestamps). This endpoint requires a valid JWT.

#### Scenario: Retrieve current user
- **WHEN** `GET /api/auth/me` is called with a valid JWT in the Authorization header
- **THEN** the user profile (excluding password) is returned

#### Scenario: No token provided
- **WHEN** `GET /api/auth/me` is called without an Authorization header
- **THEN** a `401 Unauthorized` response is returned

---

### Requirement: Global JWT Authentication Guard

The system SHALL apply a `JwtAuthGuard` globally to all API routes. Endpoints decorated with a `@Public()` decorator SHALL be exempt.

- Protected endpoints MUST receive a valid `Authorization: Bearer <token>` header.
- Invalid or expired tokens SHALL return `401 Unauthorized`.

#### Scenario: Access protected endpoint with valid token
- **WHEN** any protected endpoint is called with a valid JWT
- **THEN** the request proceeds normally

#### Scenario: Access protected endpoint without token
- **WHEN** any protected endpoint is called without an Authorization header
- **THEN** a `401 Unauthorized` response is returned

#### Scenario: Access protected endpoint with expired token
- **WHEN** any protected endpoint is called with an expired JWT
- **THEN** a `401 Unauthorized` response is returned

---

### Requirement: Swagger Bearer Authentication

Swagger UI SHALL include a `Bearer` authentication scheme so developers can test authenticated endpoints from the docs page.

#### Scenario: Authenticate in Swagger
- **WHEN** a developer clicks "Authorize" in Swagger UI and enters a valid JWT
- **THEN** subsequent API calls from Swagger include the `Authorization: Bearer` header

---

### Requirement: Frontend Login Page

The frontend SHALL provide a `/login` page with an email and password form. On successful login, the user is redirected to the dashboard (`/`).

- The login page MUST NOT show the sidebar or app layout.
- Invalid credentials SHALL display an inline error message.
- The form MUST validate that email and password are not empty before submitting.

#### Scenario: Successful login from UI
- **WHEN** the user enters valid credentials and clicks "Sign In"
- **THEN** the JWT is stored, the user is redirected to `/`, and the sidebar shows the user's name

#### Scenario: Failed login from UI
- **WHEN** the user enters invalid credentials and clicks "Sign In"
- **THEN** an error message is displayed on the login page

---

### Requirement: Frontend Auth Context

The frontend SHALL provide an `AuthProvider` context that manages authentication state:

- `user` — the current user object (or `null`).
- `isAuthenticated` — boolean.
- `login(email, password)` — calls the login API, stores the token, fetches the user.
- `logout()` — clears the token and user, redirects to `/login`.

On app mount, if a token exists in `localStorage`, the provider SHALL call `GET /api/auth/me` to validate it. If invalid, the token is cleared.

#### Scenario: Persist session across refresh
- **WHEN** the user refreshes the page with a valid token in localStorage
- **THEN** the user remains authenticated and the app renders normally

#### Scenario: Expired token on refresh
- **WHEN** the user refreshes the page with an expired token in localStorage
- **THEN** the token is cleared and the user is redirected to `/login`

---

### Requirement: Protected Frontend Routes

All application routes (dashboard, items, categories, stock history) SHALL be wrapped in a `ProtectedRoute` component that redirects to `/login` if the user is not authenticated.

#### Scenario: Unauthenticated user visits protected route
- **WHEN** an unauthenticated user navigates to `/items`
- **THEN** they are redirected to `/login`

#### Scenario: Authenticated user visits protected route
- **WHEN** an authenticated user navigates to `/items`
- **THEN** the items page renders normally

---

### Requirement: Axios Auth Interceptor

The Axios API client SHALL attach the JWT from `localStorage` to every outgoing request as an `Authorization: Bearer <token>` header. If a `401` response is received, the interceptor SHALL clear the token and redirect to `/login`.

#### Scenario: Token attached to API requests
- **WHEN** the frontend makes any API call while authenticated
- **THEN** the `Authorization: Bearer <token>` header is included

#### Scenario: 401 response triggers logout
- **WHEN** any API call returns `401`
- **THEN** the token is cleared from localStorage and the user is redirected to `/login`

---

### Requirement: Sidebar User Display

The sidebar SHALL display the logged-in user's name at the bottom (above the version footer) and provide a logout button.

#### Scenario: User name shown in sidebar
- **WHEN** a user is authenticated
- **THEN** their name appears in the sidebar footer area

#### Scenario: Logout from sidebar
- **WHEN** the user clicks the logout button in the sidebar
- **THEN** the token is cleared and the user is redirected to `/login`
