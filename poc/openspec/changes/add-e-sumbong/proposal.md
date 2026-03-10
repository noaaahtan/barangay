# Change: Add E-Sumbong (Electronic Complaint System)

## Why

Citizens need a fast, accessible way to report incidents, complaints, and concerns to the barangay without visiting the barangay hall. An electronic reporting system with location pinning and responses from barangay police/officials will improve response times, increase transparency, and provide a traceable record of community issues.

## What Changes

- **New complaint/report module** with incident types (crime, noise complaint, public safety, infrastructure, health hazard, stray animals, illegal activity, environmental issue, other), severity levels (low, medium, high, emergency), and status tracking (submitted, acknowledged, investigating, resolved, closed, dismissed).
- **Location pinning** via interactive map where citizens can drop a pin to mark the exact location of the incident, with coordinates stored and displayed on admin maps.
- **Photo attachments** for evidence (up to 3 images per report).
- **Privacy controls** allowing citizens to submit reports anonymously or with their name attached.
- **Barangay police response workflow** where authorized officials (barangay police, admins, staff) can:
  - View all reports on a map dashboard
  - Acknowledge reports and change status
  - Add response notes and updates
  - Mark reports as resolved with resolution details
- **Real-time notifications** to citizens when their report status changes or receives a response.
- **Public report feed** (optional) showing non-anonymous resolved reports to demonstrate barangay responsiveness.
- **Audit logging** for all report actions (submit, status change, response add, close).
- **Frontend pages** for:
  - Citizens: Submit report with map pin, view my reports, track status
  - Barangay Police/Staff: Map view of all reports, filter by status/type/severity, respond to reports
  - Admin: Full management dashboard with analytics

## Impact

- Affected specs: new `e-sumbong` capability
- Affected specs (modified): `dashboard`, `branding-theming`, `user-auth` (add barangay_police role)
- Affected code:
  - `backend/src/e-sumbong/` — new module (entities, repository, service, controller)
  - `backend/src/common/constants.ts` — enums for report type, status, severity
  - `backend/src/app.module.ts` — register module
  - `backend/src/uploads/` — extend to support report photos
  - `frontend/src/features/e-sumbong/` — new feature with map integration
  - `frontend/src/pages/ESumbongPage.tsx` — citizen report submission with map
  - `frontend/src/pages/MyReportsPage.tsx` — citizen view of their reports
  - `frontend/src/pages/ReportsManagementPage.tsx` — barangay police/admin dashboard with map
  - `frontend/src/layouts/Sidebar.tsx` — nav items
  - `frontend/src/App.tsx` — routes
  - `frontend/src/api/types.ts` — types
  - Map library integration (Leaflet or Google Maps API) for pin location selection and display

## Technical Considerations

- **Map API**: Use Leaflet (open-source) with OpenStreetMap tiles for free map integration, or Google Maps API if budget allows for better barangay mapping.
- **Geolocation**: Store coordinates as `latitude` and `longitude` decimal fields for precise location tracking.
- **Photo storage**: Use existing uploads directory with file size limits (max 5MB per image).
- **Anonymous reports**: Store `isAnonymous` boolean; if true, mask user identity from public view but retain userId in backend for audit purposes.
- **Response tracking**: Allow multiple response notes per report (one-to-many relationship) with timestamps and responder identity.
- **Security**: Barangay police role can view all reports; citizens can only view their own reports unless report is public.

## User Journey

### Citizen Submits Report

1. Citizen navigates to "Submit E-Sumbong" page
2. Fills out form: incident type, severity, description
3. Clicks map to drop pin at incident location (or uses "Use My Location" button)
4. Optionally uploads up to 3 photos
5. Chooses to submit anonymously or with name
6. Submits report and receives unique reference number

### Barangay Police Responds

1. Police officer logs into system, sees map with pinned reports
2. Clicks on a report pin to view details
3. Acknowledges report (status → ACKNOWLEDGED)
4. Investigates and adds response note
5. Updates status to INVESTIGATING or RESOLVED
6. Citizen receives notification of status change and response

## Success Metrics

- Average response time from submission to acknowledgment
- Percentage of reports resolved within 7 days
- Citizen satisfaction ratings (optional feedback on resolution)
- Number of reports by type/location (helps identify problem areas)
