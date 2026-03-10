## 1. Backend — E-Sumbong Core

- [ ] 1.1 Add enums in `backend/src/common/constants.ts`: `ReportType` (CRIME, NOISE_COMPLAINT, PUBLIC_SAFETY, INFRASTRUCTURE, HEALTH_HAZARD, STRAY_ANIMALS, ILLEGAL_ACTIVITY, ENVIRONMENTAL, OTHER), `ReportStatus` (SUBMITTED, ACKNOWLEDGED, INVESTIGATING, RESOLVED, CLOSED, DISMISSED), `ReportSeverity` (LOW, MEDIUM, HIGH, EMERGENCY)
- [ ] 1.2 Create `Report` entity (`backend/src/e-sumbong/entities/report.entity.ts`) with id, referenceNumber, type (enum), severity (enum), status (enum), title, description, latitude, longitude, locationAddress, isAnonymous (boolean), photoUrls (json array), userId (FK), submittedAt, lastUpdatedAt, resolvedAt, resolutionDetails
- [ ] 1.3 Create `ReportResponse` entity (`backend/src/e-sumbong/entities/report-response.entity.ts`) with id, reportId (FK), responderId (FK), responseText, createdAt
- [ ] 1.4 Create `ReportsRepository` with create, findAll (with filters: status, type, severity, userId, dateRange + pagination + role-based visibility), findOne, update, delete, and geospatial queries
- [ ] 1.5 Create `ReportResponsesRepository` with create, findByReportId, update, delete
- [ ] 1.6 Create `ESumbongService` with create (generate reference number), findAll, findOne, updateStatus, addResponse, resolve, delete; inject `AuditLogsService` for tracking; handle anonymous vs. public logic
- [ ] 1.7 Create DTOs: `CreateReportDto`, `UpdateReportDto`, `UpdateReportStatusDto`, `AddResponseDto`, `ResolveReportDto`, `ReportsQueryDto` (with geospatial filters like bounds or radius)
- [ ] 1.8 Create `ESumbongController` with POST /reports, GET /reports (list with filters), GET /reports/:id, PATCH /reports/:id/status, POST /reports/:id/responses, PATCH /reports/:id/resolve, DELETE /reports/:id; pass `req.user.id` and enforce role-based access (citizens see only their own, police/admin see all)
- [ ] 1.9 Create `ESumbongModule` and register in `AppModule`
- [ ] 1.10 Add reference number generator helper (format: RPT-YYYY-XXXXXX)
- [ ] 1.11 Extend uploads service to handle report photo uploads with validation (max 3 files, 5MB each, image types only)

## 2. Backend — User Role Extension

- [ ] 2.1 Add `BARANGAY_POLICE` role to `UserRole` enum in `backend/src/common/constants.ts` if not already present
- [ ] 2.2 Update role guards to allow BARANGAY_POLICE access to report management endpoints
- [ ] 2.3 Update seed data to include sample barangay police user for testing

## 3. Frontend — Map Integration

- [ ] 3.1 Install Leaflet: `pnpm add leaflet react-leaflet` and `pnpm add -D @types/leaflet`
- [ ] 3.2 Create `components/Map/LocationPicker.tsx` — interactive map component with pin drop functionality, "Use My Location" button
- [ ] 3.3 Create `components/Map/ReportsMap.tsx` — map view displaying multiple report pins with popups showing report summary, clickable to open details
- [ ] 3.4 Add Leaflet CSS import to `index.css` or main layout

## 4. Frontend — Citizen Report Submission

- [ ] 4.1 Add types to `api/types.ts`: `Report`, `ReportResponse`, `ReportType`, `ReportStatus`, `ReportSeverity`, `CreateReportDto`, `ReportsQueryDto`
- [ ] 4.2 Create `api/e-sumbong.ts` with API functions: createReport, getMyReports, getReportById, uploadReportPhotos
- [ ] 4.3 Create `features/e-sumbong/ReportForm.tsx` — form with type dropdown, severity dropdown, title/description inputs, LocationPicker map, photo upload (max 3), anonymous checkbox
- [ ] 4.4 Create `features/e-sumbong/ReportCard.tsx` — display report with status badge, location map thumbnail, photos
- [ ] 4.5 Create `pages/ESumbongPage.tsx` — citizen page to submit new report
- [ ] 4.6 Create `pages/MyReportsPage.tsx` — citizen page to view their submitted reports with status tracking

## 5. Frontend — Police/Admin Report Management

- [ ] 5.1 Create `api/e-sumbong-admin.ts` with admin API functions: getAllReports, updateReportStatus, addResponse, resolveReport, deleteReport
- [ ] 5.2 Create `features/e-sumbong/ReportsMap.tsx` — full-screen map with all reports pinned, filters sidebar (status, type, severity, date range)
- [ ] 5.3 Create `features/e-sumbong/ReportDetailsModal.tsx` — view full report details, photos, location map, response history, add response form, status update controls
- [ ] 5.4 Create `features/e-sumbong/ReportsList.tsx` — table/list view with filters, search by reference number
- [ ] 5.5 Create `features/e-sumbong/ResponseForm.tsx` — textarea for response with submit button
- [ ] 5.6 Create `pages/ReportsManagementPage.tsx` — police/admin dashboard with map view and list view toggle, statistics cards (total reports, pending, resolved today)

## 6. Frontend — Notifications & Real-Time Updates

- [ ] 6.1 Add notification system for report status changes (can use polling or WebSocket if available)
- [ ] 6.2 Display toast notifications when report status is updated
- [ ] 6.3 Add badge/counter in sidebar showing pending reports for police/admin users

## 7. Dashboard Integration

- [ ] 7.1 Add e-sumbong metrics to dashboard API endpoint (total reports, pending response, resolved this week, emergency reports)
- [ ] 7.2 Update `DashboardPage.tsx` to display e-sumbong metrics, recent reports widget, and map mini-view of active incidents

## 8. Navigation & Routes

- [ ] 8.1 Update `Sidebar.tsx` — add "E-Sumbong" nav group with "Submit Report" (citizen), "My Reports" (citizen), "Manage Reports" (police/admin/staff)
- [ ] 8.2 Update `App.tsx` — add `/e-sumbong/submit`, `/e-sumbong/my-reports`, `/e-sumbong/manage` routes with role-based protection

## 9. Validation & Testing

- [ ] 9.1 Verify backend builds cleanly
- [ ] 9.2 Verify frontend builds cleanly
- [ ] 9.3 Test report creation with location pinning and photo uploads
- [ ] 9.4 Test anonymous vs. public report visibility
- [ ] 9.5 Test barangay police response workflow and status transitions
- [ ] 9.6 Test citizen notification on status updates
- [ ] 9.7 Test map display with multiple reports and filters
- [ ] 9.8 Test geolocation "Use My Location" functionality
- [ ] 9.9 Test audit logging for all report actions
- [ ] 9.10 Verify role-based access control (citizens can't see other citizens' reports unless public)
