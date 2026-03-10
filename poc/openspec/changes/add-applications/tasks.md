## 1. Backend — Application Entity & Module

- [ ] 1.1 Create `Application` entity (`backend/src/applications/entities/application.entity.ts`) with id, referenceNumber, type (enum), status (enum), applicantName, applicantEmail, applicantPhone, applicantAddress, purpose, notes, userId (FK → User), reviewedBy (FK → User), submittedAt, reviewedAt, completedAt, createdAt, updatedAt
- [ ] 1.2 Create `ApplicationType` enum in `backend/src/common/constants.ts` (BARANGAY_CLEARANCE, CERTIFICATE_OF_RESIDENCY, BUSINESS_PERMIT, INDIGENCY_CERTIFICATE, CEDULA)
- [ ] 1.3 Create `ApplicationStatus` enum in `backend/src/common/constants.ts` (SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, READY_FOR_PICKUP, COMPLETED, CANCELLED)
- [ ] 1.4 Create `ApplicationsRepository` (`backend/src/applications/applications.repository.ts`) — create, findAll (with filters, pagination, role-based), findOne, findByReferenceNumber, update, remove
- [ ] 1.5 Create `ApplicationsService` (`backend/src/applications/applications.service.ts`) — create (with reference number generation), findAll (role-based filtering), findOne, updateStatus (with validation), update, cancel; inject AuditLogsService for logging
- [ ] 1.6 Create DTOs: `CreateApplicationDto`, `UpdateApplicationDto`, `UpdateApplicationStatusDto`, `ApplicationsQueryDto` (page, limit, status, type, search)
- [ ] 1.7 Create `ApplicationsController` (`backend/src/applications/applications.controller.ts`) — POST, GET (list), GET/:id, PATCH/:id/status, PATCH/:id, DELETE/:id; extract req.user and pass userId
- [ ] 1.8 Create `ApplicationsModule` — register entity, repository, service, controller; import AuditLogsModule
- [ ] 1.9 Register `ApplicationsModule` in `AppModule`
- [ ] 1.10 Add reference number generator helper function (format: APP-YYYY-XXXXXX)
- [ ] 1.11 Add status transition validation logic in service

## 2. Frontend — Applications Feature (Admin)

- [ ] 2.1 Add `Application`, `ApplicationType`, `ApplicationStatus`, `ApplicationsQuery` types to `api/types.ts`
- [ ] 2.2 Create `features/applications/useApplicationsApi.ts` — fetch, create, updateStatus, update, cancel hooks
- [ ] 2.3 Create `features/applications/ApplicationStatusBadge.tsx` — color-coded badge component (submitted: blue, under review: yellow, approved: green, rejected: red, ready: purple, completed: gray, cancelled: gray)
- [ ] 2.4 Create `features/applications/ApplicationsTable.tsx` — table with reference number, type, applicant name, status badge, submitted date, actions dropdown
- [ ] 2.5 Create `features/applications/ApplicationDetailsModal.tsx` — view/edit modal showing all details, status update dropdown, notes field, action buttons
- [ ] 2.6 Create `features/applications/ApplicationFilters.tsx` — status filter, type filter, search by reference/name
- [ ] 2.7 Create `pages/ApplicationsPage.tsx` — admin page with filters, table, pagination, modal

## 3. Frontend — My Applications Feature (Citizen)

- [ ] 3.1 Create `features/applications/ApplicationStatusStepper.tsx` — visual timeline/stepper component showing status progression
- [ ] 3.2 Create `features/applications/ApplicationCard.tsx` — card component for citizen view (reference number, type, status, date, view details button)
- [ ] 3.3 Create `features/applications/ApplicationForm.tsx` — submission form with document type dropdown, applicant fields (pre-filled from user), purpose textarea, submit button
- [ ] 3.4 Create `features/applications/ApplicationViewModal.tsx` — read-only modal for citizens to view their application details
- [ ] 3.5 Create `pages/MyApplicationsPage.tsx` — citizen page with "Apply for Document" button, list of applications, pagination

## 4. Dashboard Integration

- [ ] 4.1 Add applications metrics to dashboard API endpoint (total count, pending review count, ready for pickup count)
- [ ] 4.2 Update `DashboardPage.tsx` — add applications metric cards
- [ ] 4.3 Add recent applications widget to dashboard (shows last 5 applications with reference, applicant, status)

## 5. Navigation & Routes

- [ ] 5.1 Update `Sidebar.tsx` — add "Applications" nav item (admin/staff only) with icon
- [ ] 5.2 Update `Sidebar.tsx` — add "My Applications" nav item (citizen only) with icon
- [ ] 5.3 Update `App.tsx` — add `/applications` route (protected, admin/staff only)
- [ ] 5.4 Update `App.tsx` — add `/my-applications` route (protected, all roles)

## 6. Validation & Testing

- [ ] 6.1 Verify backend builds cleanly
- [ ] 6.2 Verify frontend builds cleanly
- [ ] 6.3 Test application submission flow (citizen creates application, receives reference number)
- [ ] 6.4 Test admin workflow (view applications, update status, add notes)
- [ ] 6.5 Test role-based access (citizens only see their own, admins see all)
- [ ] 6.6 Test status transition validation (invalid transitions are rejected)
- [ ] 6.7 Test audit logging (all mutations create audit entries)
- [ ] 6.8 Test dashboard metrics update correctly
