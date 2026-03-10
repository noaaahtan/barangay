## ADDED Requirements

### Requirement: Equipment Inventory Model

The system SHALL persist equipment inventory items with the following fields:

| Field         | Type      | Constraints                 |
| ------------- | --------- | --------------------------- |
| id            | UUID      | Primary key, auto-generated |
| type          | enum      | EquipmentType               |
| name          | string    | Required                    |
| quantityTotal | integer   | Required, min 0             |
| isActive      | boolean   | Defaults true               |
| createdAt     | timestamp | Auto-set                    |
| updatedAt     | timestamp | Auto-updated                |

EquipmentType includes: CHAIR, TABLE, TENT, SOUND_SYSTEM, LIGHTS, STAGE_PANEL.

#### Scenario: Equipment item is created

- **WHEN** an admin adds an equipment item with type CHAIR and quantityTotal 200
- **THEN** the item is stored and appears in the inventory list

---

### Requirement: Equipment Reservation Model

The system SHALL persist equipment reservations with the following fields:

| Field           | Type      | Constraints                                                              |
| --------------- | --------- | ------------------------------------------------------------------------ |
| id              | UUID      | Primary key, auto-generated                                              |
| referenceNumber | string    | Unique, indexed, format `EQP-YYYY-XXXXXX`                                |
| status          | enum      | SUBMITTED, FOR_DELIVERY, COMPLETED, REJECTED, CANCELLED                  |
| eventType       | enum      | BIRTHDAY, WEDDING, BURIAL, COMMUNITY_EVENT, SPORTS_EVENT, MEETING, OTHER |
| eventName       | string    | Required                                                                 |
| eventLocation   | string    | Required                                                                 |
| startDate       | date      | Required                                                                 |
| endDate         | date      | Required, must be >= startDate                                           |
| requestedItems  | json      | Required list of `{ type, quantity }`                                    |
| approvedItems   | json      | Optional list of `{ type, quantity }`                                    |
| notes           | text      | Optional                                                                 |
| userId          | UUID      | FK → User (requester), indexed                                           |
| reviewedBy      | UUID      | FK → User (reviewer), nullable                                           |
| reviewedAt      | timestamp | Set on approve or decline                                                |
| fulfilledAt     | timestamp | Set on fulfill                                                           |
| createdAt       | timestamp | Auto-set                                                                 |
| updatedAt       | timestamp | Auto-updated                                                             |

Reservations with status BLOCKED are created by admins to block equipment for barangay use or maintenance.

#### Scenario: Reservation is stored

- **WHEN** a citizen submits a reservation
- **THEN** a new reservation is created with status REQUESTED and a unique reference number

---

### Requirement: Reference Number Generation

The system SHALL generate unique reference numbers in the format `EQP-YYYY-XXXXXX` where `XXXXXX` is a zero-padded sequence that resets annually.

#### Scenario: Reference number is auto-generated

- **WHEN** a reservation is created in 2026 as the 7th reservation of the year
- **THEN** the reference number is `EQP-2026-000007`

---

### Requirement: Availability Validation

The system SHALL prevent overbooking by validating requested quantities against existing approved or blocked reservations that overlap the requested date range.

Overlap is defined as any reservation where `startDate <= requestedEndDate` AND `endDate >= requestedStartDate`.

#### Scenario: Overbooking is rejected

- **WHEN** chairs available are 100 and a new request asks for 120 chairs on the same date range
- **THEN** the system returns `400 Bad Request` with a message indicating insufficient availability

#### Scenario: Availability allows partial approval

- **WHEN** a request asks for 50 chairs and 10 tables but only 5 tables are available
- **THEN** an admin can approve with adjusted quantities in `approvedItems`

---

### Requirement: Create Reservation API

The system SHALL provide `POST /api/equipment-reservations` accepting:

| Field          | Type   | Required | Description                  |
| -------------- | ------ | -------- | ---------------------------- |
| eventType      | string | Yes      | Event type enum              |
| eventName      | string | Yes      | Event title                  |
| eventLocation  | string | Yes      | Event address or venue       |
| startDate      | date   | Yes      | Reservation start            |
| endDate        | date   | Yes      | Reservation end              |
| requestedItems | json   | Yes      | List of `{ type, quantity }` |

The system SHALL:

1. Validate availability
2. Set status to SUBMITTED
3. Associate with the authenticated user (req.user.id)
4. Create an audit log entry (action CREATE, entityType equipment_reservation)
5. Return the created reservation with reference number

#### Scenario: Citizen submits reservation

- **WHEN** an authenticated citizen POSTs to `/api/equipment-reservations`
- **THEN** the reservation is created with status SUBMITTED

---

### Requirement: List Reservations API

The system SHALL provide `GET /api/equipment-reservations` with role-based filtering:

**For ADMIN/STAFF:**

- Returns all reservations

**For CITIZEN:**

- Returns only reservations where userId matches req.user.id

Query parameters:

| Param  | Type    | Default | Description                      |
| ------ | ------- | ------- | -------------------------------- |
| page   | integer | 1       | Page number                      |
| limit  | integer | 20      | Entries per page                 |
| status | string  | —       | Filter by status                 |
| search | string  | —       | Search by reference or eventName |

#### Scenario: Citizen sees own reservations

- **WHEN** a citizen calls `GET /api/equipment-reservations`
- **THEN** only their reservations are returned

---

### Requirement: Update Reservation Status API

The system SHALL provide `PATCH /api/equipment-reservations/:id/status` (ADMIN/STAFF only) accepting:

| Field         | Type          | Required |
| ------------- | ------------- | -------- |
| status        | string (enum) | Yes      |
| approvedItems | json          | No       |
| notes         | text          | No       |

The system SHALL:

1. Allow transitions: REQUESTED → APPROVED/DECLINED/CANCELLED; APPROVED → FULFILLED/CANCELLED; BLOCKED → CANCELLED
2. Set reviewedAt and reviewedBy on approve or decline
3. Set fulfilledAt on fulfill
4. Create an audit log entry (action UPDATE)

#### Scenario: Admin approves a reservation

- **WHEN** an admin PATCHES `/api/equipment-reservations/{id}/status` with status APPROVED
- **THEN** the reservation status is updated and audit log entry is created

---

### Requirement: Cancel Reservation API

The system SHALL provide `DELETE /api/equipment-reservations/:id` with role-based access:

**For ADMIN/STAFF:**

- Can cancel any reservation

**For CITIZEN:**

- Can cancel reservations where userId matches req.user.id
- Can only cancel if status is REQUESTED or APPROVED

The system SHALL set status to CANCELLED and create an audit log entry (action DELETE).

#### Scenario: Citizen cancels own reservation

- **WHEN** a citizen DELETEs `/api/equipment-reservations/{id}`
- **THEN** the reservation status is changed to CANCELLED

---

### Requirement: Equipment Availability API

The system SHALL provide `GET /api/equipment/availability?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` returning available quantities per equipment type.

#### Scenario: Availability is returned

- **WHEN** a user requests availability for a date range
- **THEN** the response includes available quantities per equipment type

---

### Requirement: Inventory Management API

The system SHALL provide admin-only endpoints:

- `GET /api/equipment` — list equipment items
- `POST /api/equipment` — create equipment item
- `PATCH /api/equipment/:id` — update quantityTotal or name
- `DELETE /api/equipment/:id` — deactivate equipment item

All mutations SHALL create audit log entries.

#### Scenario: Admin updates quantity

- **WHEN** an admin PATCHES `/api/equipment/{id}` with a new quantity
- **THEN** the quantity is updated and an audit log entry is created

---

### Requirement: Calendar Booking UI

The frontend SHALL provide a calendar view that displays equipment availability per day and highlights dates with approved or blocked reservations.

#### Scenario: Calendar shows availability

- **WHEN** the admin opens the equipment reservations page
- **THEN** each day shows availability badges for chairs, tables, and tents

---

### Requirement: Citizen Reservation Page

The frontend SHALL provide a `/my-reservations` page with:

- ReservationForm (date range, requested items, event details)
- List of reservations with status badges and date range
- Ability to cancel eligible reservations

#### Scenario: Citizen creates reservation

- **WHEN** a citizen submits the reservation form
- **THEN** the reservation appears in their list with status REQUESTED

---

### Requirement: Admin Reservations Page

The frontend SHALL provide a `/equipment-reservations` page for ADMIN/STAFF with:

- Calendar view of availability
- List of pending requests with approve/decline actions
- Inventory management table

#### Scenario: Admin approves reservation

- **WHEN** an admin approves a pending request
- **THEN** the reservation status updates to APPROVED and the calendar refreshes
