## MODIFIED Requirements

### Requirement: User Roles (MODIFIED)

**Added role**:

- `BARANGAY_POLICE` — Has permissions to view all reports, update status, add responses, and resolve reports. Cannot manage users or system configuration.

The UserRole enum SHALL include:

- CITIZEN
- STAFF
- ADMIN
- **BARANGAY_POLICE** (NEW)

#### Scenario: Barangay police role permissions (NEW)

- **WHEN** a user with BARANGAY_POLICE role logs in
- **THEN** they can access the Reports Management page
- **AND** they can view all submitted reports
- **AND** they can update report status and add responses
- **AND** they cannot access user management or system configuration

---

### Requirement: Role-Based Access Control (MODIFIED)

**Added permissions for BARANGAY_POLICE**:

- Read all reports (regardless of submitter)
- Update report status
- Add responses to reports
- Resolve reports
- View report analytics

**Restrictions**:

- Cannot create/edit/delete users
- Cannot modify system settings
- Cannot delete reports (admin only)

#### Scenario: BARANGAY_POLICE accesses protected routes (NEW)

- **WHEN** a BARANGAY_POLICE user attempts to access `/e-sumbong/manage`
- **THEN** access is granted
- **WHEN** they attempt to access `/admin/users`
- **THEN** access is denied with `403 Forbidden`
