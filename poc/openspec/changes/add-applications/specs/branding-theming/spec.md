## MODIFIED Requirements

### Requirement: Sidebar Navigation Items

The sidebar navigation SHALL include role-based menu items for applications:

**For users with role ADMIN or STAFF:**

- "Applications" menu item linking to `/applications`
- Icon: clipboard or file icon

**For users with role CITIZEN:**

- "My Applications" menu item linking to `/my-applications`
- Icon: clipboard or file icon

#### Scenario: Admin sees Applications in sidebar

- **WHEN** a user with role ADMIN is logged in
- **THEN** the sidebar displays "Applications" menu item

#### Scenario: Citizen sees My Applications in sidebar

- **WHEN** a user with role CITIZEN is logged in
- **THEN** the sidebar displays "My Applications" menu item
