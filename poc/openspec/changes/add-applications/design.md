## Context

The Barangay Sta Ana Government Portal is described in `project.md` as providing citizens a way to apply for barangay requirements online, with status tracking and notifications. However, the application module does not exist yet. With authentication and audit logging now in place, we can implement the full application workflow.

## Goals / Non-Goals

**Goals:**

- Enable citizens to submit applications for various barangay documents online
- Provide status tracking from submission through ready for pickup
- Give administrators full management capabilities (review, approve, reject, add notes)
- Integrate with existing audit logging system
- Add applications metrics to the dashboard
- Ensure role-based access (citizens see only their own; admins see all)

**Non-Goals:**

- File attachments for applications (accept text-only in this iteration)
- Email/SMS notifications (can be added later)
- Payment processing for document fees
- Printed document generation (handled offline)
- Historical migration of paper-based applications

## Decisions

### 1. Reference Number Format

- **Decision**: Use format `APP-YYYY-XXXXXX` (e.g., `APP-2026-000001`)
- **Rationale**: Year-based numbering resets annually (common for government documents). Six digits allows 999,999 applications per year. Format is easily recognizable and communicable over phone/in-person.
- **Implementation**: Generate by counting applications created in the current year and padding with zeros.

### 2. Application Entity Design

```typescript
Application {
  id: UUID (PK)
  referenceNumber: string (unique, indexed)
  type: enum ApplicationType
  status: enum ApplicationStatus
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  applicantAddress: text
  purpose: text
  notes: text | null  // admin remarks
  userId: UUID (FK → User, the applicant)
  reviewedBy: UUID | null (FK → User, the reviewer)
  submittedAt: timestamp
  reviewedAt: timestamp | null
  completedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

- **Denormalized applicant data**: Store name, email, phone, address directly rather than relying only on the User FK. Rationale: Citizens may not have accounts, or their profile may change; the application should preserve original submission data.
- **Separate timestamp fields**: `submittedAt`, `reviewedAt`, `completedAt` enable precise SLA tracking and reporting.
- **reviewedBy**: Optional FK to User who approved/rejected; null if still pending.

### 3. Application Types

```typescript
enum ApplicationType {
  BARANGAY_CLEARANCE = "BARANGAY_CLEARANCE",
  CERTIFICATE_OF_RESIDENCY = "CERTIFICATE_OF_RESIDENCY",
  BUSINESS_PERMIT = "BUSINESS_PERMIT",
  INDIGENCY_CERTIFICATE = "INDIGENCY_CERTIFICATE",
  CEDULA = "CEDULA",
}
```

- **Extensible**: New document types can be added by extending the enum.
- **No custom types**: Only predefined types accepted (simplifies processing).

### 4. Application Status & State Machine

```typescript
enum ApplicationStatus {
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
```

**Valid transitions:**

- `SUBMITTED` → `UNDER_REVIEW`, `CANCELLED`
- `UNDER_REVIEW` → `APPROVED`, `REJECTED`, `CANCELLED`
- `APPROVED` → `READY_FOR_PICKUP`, `CANCELLED`
- `REJECTED` → `SUBMITTED` (allow resubmission)
- `READY_FOR_PICKUP` → `COMPLETED`, `CANCELLED`
- `COMPLETED` → (terminal state)
- `CANCELLED` → (terminal state)

**Rationale:**

- Enforce valid business logic transitions in the service layer
- Prevent invalid state changes (e.g., COMPLETED → SUBMITTED)
- Allow cancellation at any non-terminal stage

### 5. Role-Based Access Control

| Role    | Create | View All | View Own | Update Status | Update Details | Cancel       |
| ------- | ------ | -------- | -------- | ------------- | -------------- | ------------ |
| ADMIN   | ✓      | ✓        | ✓        | ✓             | ✓              | ✓            |
| STAFF   | ✓      | ✓        | ✓        | ✓             | ✓              | ✓            |
| CITIZEN | ✓      | ✗        | ✓        | ✗             | ✗              | ✓ (own only) |

- **Implementation**: Service layer checks `req.user.role`. Citizens filter by `userId`.
- **Rationale**: Citizens should only manage their own applications; staff/admins have full access.

### 6. Audit Logging Integration

- **Decision**: Log all application mutations via `AuditLogsService.log()`.
- **Log points**:
  - `CREATE` when application submitted
  - `UPDATE` when status changes (details include old → new status)
  - `UPDATE` when notes/details modified
  - `DELETE` when cancelled
- **Rationale**: Accountability for all actions; audit log provides full trail.

### 7. Frontend Architecture

**Admin View** (`/applications`):

- Filterable table (status, type, date range)
- Search by reference number or applicant name
- Click row → ApplicationDetailsModal (view details, update status, add notes)

**Citizen View** (`/my-applications`):

- Card-based layout showing own applications
- Status stepper visualization (shows progress through workflow)
- "Apply for Document" button → ApplicationForm modal
- Click card → ApplicationViewModal (read-only details)

**Shared Components**:

- `ApplicationStatusBadge` (color-coded badges)
- Reuse existing UI components (Button, Input, Select, Modal, Table)

### 8. Dashboard Integration

Add metrics:

- Total applications count
- Pending review count (SUBMITTED + UNDER_REVIEW)
- Ready for pickup count
- Recent applications widget (last 5 with status)

**Rationale**: Admins need at-a-glance visibility into application pipeline.

## Risks / Trade-offs

| Risk                                                  | Mitigation                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------- |
| High volume of applications during peak periods       | Pagination and indexing on referenceNumber, status, userId             |
| Duplicate reference numbers if concurrent submissions | Use database-level uniqueness constraint; handle conflict gracefully   |
| Citizens submit spam applications                     | Add rate limiting later if needed; currently authenticated users only  |
| Status transitions become more complex over time      | Current state machine logic is explicit and testable; extend as needed |

## Open Questions

- Should citizens be able to edit submitted applications? **Proposed**: No — they can cancel and resubmit instead.
- Should there be an "on hold" status? **Proposed**: Use notes field to indicate holds; don't add new status to keep workflow simple.
- Should we show estimated processing time? **Proposed**: Not in this iteration — add as enhancement later.
