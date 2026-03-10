## ADDED Requirements

### Requirement: Seed Command

The system SHALL provide a seed script runnable via `pnpm --filter backend run seed` that populates the database with initial user records.

The script MUST be idempotent — if a user with the same email already exists, it SHALL be skipped.

#### Scenario: Run seed on empty database
- **WHEN** `pnpm --filter backend run seed` is run against an empty `users` table
- **THEN** four users are created and the script logs each created user

#### Scenario: Run seed when users already exist
- **WHEN** `pnpm --filter backend run seed` is run and one or more seed users already exist
- **THEN** existing users are skipped and only missing users are created

---

### Requirement: Seed Users

The seed script SHALL create the following four users with a shared default password (`inkly2024`):

| Name | Email |
|------|-------|
| Noah | noah@inkly.ph |
| Fatima | fatima@inkly.ph |
| Geelane | geelane@inkly.ph |
| Marco | marco@inkly.ph |

All passwords MUST be bcrypt-hashed before insertion.

#### Scenario: Verify seed user credentials
- **WHEN** `POST /api/auth/login` is called with `{ "email": "noah@inkly.ph", "password": "inkly2024" }`
- **THEN** a valid JWT is returned

#### Scenario: All four users exist after seeding
- **WHEN** the seed script completes successfully
- **THEN** querying `GET /api/users` returns all four users (Noah, Fatima, Geelane, Marco)
