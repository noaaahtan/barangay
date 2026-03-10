## MODIFIED Requirements

### Requirement: Sidebar Navigation Items

The sidebar navigation SHALL include role-based menu items for equipment reservations:

**For users with role ADMIN or STAFF:**

- "Equipment Reservations" menu item linking to `/equipment-reservations`
- Icon: calendar or chair icon

**For users with role CITIZEN:**

- "My Reservations" menu item linking to `/my-reservations`
- Icon: calendar or chair icon

#### Scenario: Admin sees Equipment Reservations in sidebar

- **WHEN** a user with role ADMIN is logged in
- **THEN** the sidebar displays "Equipment Reservations" menu item

#### Scenario: Citizen sees My Reservations in sidebar

- **WHEN** a user with role CITIZEN is logged in
- **THEN** the sidebar displays "My Reservations" menu item
