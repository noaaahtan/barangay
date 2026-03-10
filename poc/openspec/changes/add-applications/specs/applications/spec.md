## ADDED Requirements

### Requirement: Application Data Model

The system SHALL persist an Application entity with the following fields:

| Field            | Type      | Constraints                                                                                                   |
| ---------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| id               | UUID      | Primary key, auto-generated                                                                                   |
| referenceNumber  | string    | Unique, indexed, format `APP-YYYY-XXXXXX`                                                                     |
| type             | enum      | ApplicationType: BARANGAY_CLEARANCE, CERTIFICATE_OF_RESIDENCY, BUSINESS_PERMIT, INDIGENCY_CERTIFICATE, CEDULA |
| status           | enum      | ApplicationStatus: SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, READY_FOR_PICKUP, COMPLETED, CANCELLED        |
| applicantName    | string    | Required                                                                                                      |
| applicantEmail   | string    | Required                                                                                                      |
| applicantPhone   | string    | Required                                                                                                      |
| applicantAddress | text      | Required                                                                                                      |
| purpose          | text      | Required                                                                                                      |
| notes            | text      | Optional, admin remarks                                                                                       |
| userId           | UUID      | FK → User (applicant), indexed                                                                                |
| reviewedBy       | UUID      | FK → User (reviewer), nullable                                                                                |
| submittedAt      | timestamp | Auto-set on creation                                                                                          |
| reviewedAt       | timestamp | Set when status changes to APPROVED or REJECTED                                                               |
| completedAt      | timestamp | Set when status changes to COMPLETED                                                                          |
| createdAt        | timestamp | Auto-set                                                                                                      |
| updatedAt        | timestamp | Auto-updated                                                                                                  |

Applications are soft-deletable (status becomes CANCELLED).

#### Scenario: Application is stored in PostgreSQL

- **WHEN** a citizen submits a new application
- **THEN** a new row is inserted into the `applications` table with a unique reference number and status SUBMITTED

---

### Requirement: Reference Number Generation

The system SHALL generate unique reference numbers in the format `APP-YYYY-XXXXXX` where:

- `YYYY` is the current year
- `XXXXXX` is a zero-padded sequential number starting from 000001 each year

The system SHALL ensure uniqueness via database constraint.

#### Scenario: Reference number is auto-generated

- **WHEN** an application is created in 2026 as the 42nd application of the year
- **THEN** the reference number is `APP-2026-000042`

#### Scenario: Reference numbers reset annually

- **WHEN** the first application is created in 2027
- **THEN** the reference number is `APP-2027-000001`

---

### Requirement: Application Status State Machine

The system SHALL enforce valid status transitions according to this state machine:

| Current Status   | Allowed Next Status           |
| ---------------- | ----------------------------- |
| SUBMITTED        | UNDER_REVIEW, CANCELLED       |
| UNDER_REVIEW     | APPROVED, REJECTED, CANCELLED |
| APPROVED         | READY_FOR_PICKUP, CANCELLED   |
| REJECTED         | SUBMITTED, CANCELLED          |
| READY_FOR_PICKUP | COMPLETED, CANCELLED          |
| COMPLETED        | (terminal)                    |
| CANCELLED        | (terminal)                    |

The system SHALL reject status updates that violate the state machine with a `400 Bad Request` error.

#### Scenario: Valid status transition

- **WHEN** an admin updates an application from SUBMITTED to UNDER_REVIEW
- **THEN** the status is updated successfully

#### Scenario: Invalid status transition is rejected

- **WHEN** an admin attempts to update an application from COMPLETED to SUBMITTED
- **THEN** the system returns `400 Bad Request` with error message "Invalid status transition"

---

### Requirement: Create Application API

The system SHALL provide `POST /api/applications` accepting:

| Field            | Type          | Required | Description                               |
| ---------------- | ------------- | -------- | ----------------------------------------- |
| type             | string (enum) | Yes      | Document type                             |
| applicantName    | string        | Yes      | Recommended to pre-fill from user profile |
| applicantEmail   | string        | Yes      | —                                         |
| applicantPhone   | string        | Yes      | —                                         |
| applicantAddress | text          | Yes      | —                                         |
| purpose          | text          | Yes      | Reason for application                    |

The system SHALL:

1. Generate a unique reference number
2. Set status to SUBMITTED
3. Set submittedAt to current timestamp
4. Associate with the authenticated user (req.user.id)
5. Create an audit log entry (action CREATE, entityType application)
6. Return the created application with reference number

#### Scenario: Citizen submits application

- **WHEN** an authenticated citizen POSTs to `/api/applications` with valid data
- **THEN** the application is created with status SUBMITTED and a unique reference number is returned

#### Scenario: Unauthenticated request is rejected

- **WHEN** a request is made without a valid JWT token
- **THEN** the system returns `401 Unauthorized`

---

### Requirement: List Applications API

The system SHALL provide `GET /api/applications` with role-based filtering:

**For ADMIN/STAFF:**

- Returns all applications

**For CITIZEN:**

- Returns only applications where userId matches req.user.id

Query parameters:

| Param  | Type    | Default | Description                                  |
| ------ | ------- | ------- | -------------------------------------------- |
| page   | integer | 1       | Page number                                  |
| limit  | integer | 20      | Entries per page                             |
| status | string  | —       | Filter by status                             |
| type   | string  | —       | Filter by application type                   |
| search | string  | —       | Search by reference number or applicant name |

The response SHALL include `data` (array of applications with reviewer details if applicable) and `meta` (pagination).

#### Scenario: Admin views all applications

- **WHEN** an admin calls `GET /api/applications`
- **THEN** all applications are returned with pagination

#### Scenario: Citizen views own applications

- **WHEN** a citizen calls `GET /api/applications`
- **THEN** only applications submitted by that citizen are returned

#### Scenario: Filter by status

- **WHEN** `GET /api/applications?status=READY_FOR_PICKUP` is called
- **THEN** only applications with status READY_FOR_PICKUP are returned

#### Scenario: Search by reference number

- **WHEN** `GET /api/applications?search=APP-2026-000042` is called
- **THEN** only the application with that reference number is returned

---

### Requirement: Get Single Application API

The system SHALL provide `GET /api/applications/:id` with role-based access:

**For ADMIN/STAFF:**

- Can view any application

**For CITIZEN:**

- Can only view applications where userId matches req.user.id

The system SHALL return `404 Not Found` if the application doesn't exist or the user lacks access.

#### Scenario: Admin views any application

- **WHEN** an admin requests GET `/api/applications/{id}`
- **THEN** the full application details are returned

#### Scenario: Citizen views own application

- **WHEN** a citizen requests their own application
- **THEN** the full application details are returned

#### Scenario: Citizen cannot view other's applications

- **WHEN** a citizen requests an application belonging to another user
- **THEN** the system returns `404 Not Found`

---

### Requirement: Update Application Status API

The system SHALL provide `PATCH /api/applications/:id/status` (ADMIN/STAFF only) accepting:

| Field  | Type          | Required |
| ------ | ------------- | -------- |
| status | string (enum) | Yes      |
| notes  | text          | No       |

The system SHALL:

1. Validate the status transition using the state machine
2. Set reviewedAt if status changes to APPROVED or REJECTED
3. Set reviewedBy to req.user.id if status changes to APPROVED or REJECTED
4. Set completedAt if status changes to COMPLETED
5. Update notes if provided
6. Create an audit log entry (action UPDATE, details include status change)

The system SHALL return `403 Forbidden` if a CITIZEN attempts this operation.

#### Scenario: Admin approves application

- **WHEN** an admin PATCHES `/api/applications/{id}/status` with `{ status: "APPROVED" }`
- **THEN** the status is updated, reviewedAt and reviewedBy are set, and an audit log entry is created

#### Scenario: Citizen cannot update status

- **WHEN** a citizen attempts to PATCH `/api/applications/{id}/status`
- **THEN** the system returns `403 Forbidden`

---

### Requirement: Update Application Details API

The system SHALL provide `PATCH /api/applications/:id` (ADMIN/STAFF only) accepting:

| Field            | Type   | Required |
| ---------------- | ------ | -------- |
| notes            | text   | No       |
| applicantName    | string | No       |
| applicantEmail   | string | No       |
| applicantPhone   | string | No       |
| applicantAddress | text   | No       |
| purpose          | text   | No       |

The system SHALL create an audit log entry (action UPDATE).

#### Scenario: Admin updates notes

- **WHEN** an admin PATCHES `/api/applications/{id}` with `{ notes: "Missing documents" }`
- **THEN** the notes field is updated and an audit log entry is created

---

### Requirement: Cancel Application API

The system SHALL provide `DELETE /api/applications/:id` with role-based access:

**For ADMIN/STAFF:**

- Can cancel any application

**For CITIZEN:**

- Can only cancel applications where userId matches req.user.id
- Can only cancel if status is not COMPLETED or CANCELLED

The system SHALL:

1. Change status to CANCELLED (soft delete)
2. Create an audit log entry (action DELETE)

#### Scenario: Citizen cancels own application

- **WHEN** a citizen DELETEs `/api/applications/{id}` for their own application
- **THEN** the status is changed to CANCELLED

#### Scenario: Cannot cancel completed application

- **WHEN** a citizen attempts to cancel a COMPLETED application
- **THEN** the system returns `400 Bad Request`

---

### Requirement: Frontend Admin Applications Page

The frontend SHALL provide a `/applications` page (ADMIN/STAFF only) displaying:

- A filterable table with columns: Reference Number, Type, Applicant Name, Status (badge), Submitted Date, Actions
- Filters: status dropdown, type dropdown, search input (reference/name)
- Pagination controls
- Click row → ApplicationDetailsModal (view details, update status, add notes)
- Color-coded status badges:
  - SUBMITTED: blue
  - UNDER_REVIEW: yellow
  - APPROVED: green
  - REJECTED: red
  - READY_FOR_PICKUP: purple
  - COMPLETED: gray
  - CANCELLED: gray

#### Scenario: Admin filters by status

- **WHEN** an admin selects "Ready for Pickup" in the status filter
- **THEN** only applications with that status are displayed

#### Scenario: Admin updates status

- **WHEN** an admin opens the details modal and changes status to "Approved"
- **THEN** the application status is updated and the table refreshes

---

### Requirement: Frontend Citizen My Applications Page

The frontend SHALL provide a `/my-applications` page (all authenticated users) displaying:

- "Apply for Document" button → ApplicationForm modal
- List of user's applications in card format:
  - Reference number
  - Document type
  - Status badge
  - Submitted date
  - "View Details" button
- ApplicationStatusStepper component showing visual timeline of status progression
- Click card → ApplicationViewModal (read-only details)

#### Scenario: Citizen submits new application

- **WHEN** a citizen clicks "Apply for Document" and completes the form
- **THEN** the application is submitted and the reference number is displayed

#### Scenario: Citizen views status timeline

- **WHEN** a citizen opens their application details
- **THEN** a visual stepper shows the status progression (submitted → under review → approved → ready → completed)

---

### Requirement: Application Form

The frontend SHALL provide an ApplicationForm component with:

- Document type dropdown (all ApplicationType enum values)
- Applicant name input (pre-filled from user profile)
- Email input (pre-filled)
- Phone input (pre-filled)
- Address textarea (pre-filled)
- Purpose textarea (required, minimum 10 characters)
- Submit button

Upon successful submission, the system SHALL display the reference number prominently.

#### Scenario: Form is pre-filled

- **WHEN** a citizen opens the application form
- **THEN** their name, email, phone, and address are pre-filled from their user profile

#### Scenario: Reference number is displayed on success

- **WHEN** the application is successfully submitted
- **THEN** a success message displays the reference number (e.g., "Application submitted successfully! Your reference number is APP-2026-000042")

---

### Requirement: Sidebar Navigation

The frontend SHALL add navigation items to the sidebar:

**For ADMIN/STAFF:**

- "Applications" link to `/applications` with an appropriate icon

**For CITIZEN:**

- "My Applications" link to `/my-applications` with an appropriate icon

#### Scenario: Admin sees Applications link

- **WHEN** an admin user is logged in
- **THEN** the sidebar displays "Applications" navigation item

#### Scenario: Citizen sees My Applications link

- **WHEN** a citizen user is logged in
- **THEN** the sidebar displays "My Applications" navigation item
