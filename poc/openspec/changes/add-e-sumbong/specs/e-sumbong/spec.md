## ADDED Requirements

### Requirement: Report Model

The system SHALL persist citizen reports with the following fields:

| Field             | Type      | Constraints                                                         |
| ----------------- | --------- | ------------------------------------------------------------------- |
| id                | UUID      | Primary key, auto-generated                                         |
| referenceNumber   | string    | Unique, indexed, format `RPT-YYYY-XXXXXX`                           |
| type              | enum      | ReportType                                                          |
| severity          | enum      | LOW, MEDIUM, HIGH, EMERGENCY                                        |
| status            | enum      | SUBMITTED, ACKNOWLEDGED, INVESTIGATING, RESOLVED, CLOSED, DISMISSED |
| title             | string    | Required, max 200 chars                                             |
| description       | text      | Required                                                            |
| latitude          | decimal   | Required, precision (10,8)                                          |
| longitude         | decimal   | Required, precision (11,8)                                          |
| locationAddress   | string    | Optional, human-readable address                                    |
| isAnonymous       | boolean   | Defaults false                                                      |
| photoUrls         | json      | Array of strings, max 3 URLs                                        |
| userId            | UUID      | FK → User (reporter), indexed                                       |
| submittedAt       | timestamp | Auto-set                                                            |
| lastUpdatedAt     | timestamp | Auto-updated                                                        |
| resolvedAt        | timestamp | Set when status changes to RESOLVED                                 |
| resolutionDetails | text      | Optional, required when resolving                                   |

ReportType includes: CRIME, NOISE_COMPLAINT, PUBLIC_SAFETY, INFRASTRUCTURE, HEALTH_HAZARD, STRAY_ANIMALS, ILLEGAL_ACTIVITY, ENVIRONMENTAL, OTHER.

#### Scenario: Report is created with location

- **WHEN** a citizen submits a report with latitude 14.5995 and longitude 120.9842
- **THEN** the report is stored with those coordinates and can be displayed on a map

#### Scenario: Anonymous report protects identity

- **WHEN** a citizen submits a report with `isAnonymous: true`
- **THEN** the report is stored but the user's name is not displayed to other users (userId is retained for audit only)

---

### Requirement: Report Response Model

The system SHALL persist responses to reports with the following fields:

| Field        | Type      | Constraints                    |
| ------------ | --------- | ------------------------------ |
| id           | UUID      | Primary key, auto-generated    |
| reportId     | UUID      | FK → Report, indexed           |
| responderId  | UUID      | FK → User (police/admin/staff) |
| responseText | text      | Required                       |
| createdAt    | timestamp | Auto-set                       |

A report can have multiple responses forming a conversation thread.

#### Scenario: Police officer adds response

- **WHEN** a barangay police officer adds a response to a report
- **THEN** the response is saved with the officer's user ID and timestamp
- **AND** the citizen who submitted the report is notified

---

### Requirement: Reference Number Generation

The system SHALL generate unique reference numbers in the format `RPT-YYYY-XXXXXX` where `XXXXXX` is a zero-padded sequence that resets annually.

#### Scenario: Reference number is auto-generated

- **WHEN** a report is created in 2026 as the 42nd report of the year
- **THEN** the reference number is `RPT-2026-000042`

---

### Requirement: Location Pinning

The system SHALL allow citizens to select a location by:

1. Dropping a pin on an interactive map
2. Using "Use My Location" to auto-fill current coordinates
3. Manually entering latitude and longitude (optional)

The map SHALL display the selected location pin before submission for confirmation.

#### Scenario: Citizen drops pin on map

- **WHEN** a citizen clicks on a map location at coordinates (14.5995, 120.9842)
- **THEN** a pin is placed at that location
- **AND** the coordinates are populated in the form
- **WHEN** the citizen submits the form
- **THEN** those coordinates are stored with the report

---

### Requirement: Photo Attachments

The system SHALL allow citizens to upload up to 3 photos per report with the following constraints:

- Maximum file size: 5MB per image
- Allowed formats: JPEG, PNG, WEBP
- Photos are stored with the report and displayed in the report details

#### Scenario: Photos are uploaded with report

- **WHEN** a citizen uploads 2 photos with their report
- **THEN** the photos are stored in the uploads directory
- **AND** the photo URLs are saved in the report's `photoUrls` array
- **AND** the photos are visible to barangay police when viewing the report

---

### Requirement: Create Report API

The system SHALL provide `POST /api/e-sumbong/reports` accepting:

| Field           | Type    | Required | Description                     |
| --------------- | ------- | -------- | ------------------------------- |
| type            | string  | Yes      | Report type enum                |
| severity        | string  | Yes      | Severity level enum             |
| title           | string  | Yes      | Report title (max 200 chars)    |
| description     | string  | Yes      | Detailed description            |
| latitude        | number  | Yes      | Location latitude               |
| longitude       | number  | Yes      | Location longitude              |
| locationAddress | string  | No       | Human-readable address          |
| isAnonymous     | boolean | No       | Default false                   |
| photoUrls       | array   | No       | URLs of uploaded photos (max 3) |

Response: `201 Created` with report object including generated reference number.

#### Scenario: Citizen submits report

```http
POST /api/e-sumbong/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "CRIME",
  "severity": "HIGH",
  "title": "Suspicious activity near park",
  "description": "Group of individuals loitering late at night, acting suspiciously",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "locationAddress": "Near Barangay Park, Main Street",
  "isAnonymous": false,
  "photoUrls": ["uploads/reports/photo1.jpg"]
}
```

Response:

```json
{
  "id": "uuid",
  "referenceNumber": "RPT-2026-000042",
  "status": "SUBMITTED",
  "submittedAt": "2026-03-10T10:30:00Z",
  ...
}
```

---

### Requirement: List Reports API

The system SHALL provide `GET /api/e-sumbong/reports` with the following filters:

| Parameter | Type   | Description                                            |
| --------- | ------ | ------------------------------------------------------ |
| status    | string | Filter by status (comma-separated)                     |
| type      | string | Filter by report type (comma-separated)                |
| severity  | string | Filter by severity (comma-separated)                   |
| startDate | date   | Filter reports submitted after this date               |
| endDate   | date   | Filter reports submitted before this date              |
| userId    | uuid   | Filter by reporter (admin only)                        |
| bounds    | string | Geospatial bounding box: "minLat,minLng,maxLat,maxLng" |
| page      | number | Page number (default 1)                                |
| limit     | number | Results per page (default 20, max 100)                 |

**Role-based visibility**:

- Citizens: Can only see their own reports
- Barangay Police, Staff, Admin: Can see all reports

#### Scenario: Police officer views all pending reports

```http
GET /api/e-sumbong/reports?status=SUBMITTED,ACKNOWLEDGED&page=1&limit=20
Authorization: Bearer <police_token>
```

Response: Paginated list of reports with status SUBMITTED or ACKNOWLEDGED.

#### Scenario: Citizen views only their reports

```http
GET /api/e-sumbong/reports
Authorization: Bearer <citizen_token>
```

Response: Only reports where `userId` matches the authenticated citizen.

---

### Requirement: Get Report Details API

The system SHALL provide `GET /api/e-sumbong/reports/:id` returning:

- Full report details including coordinates, photos, status history
- All responses (chronologically ordered)
- Reporter information (unless anonymous)
- Status and resolution details

Citizens can only view their own reports unless they are public (future feature).

#### Scenario: Viewing report with responses

```http
GET /api/e-sumbong/reports/uuid
Authorization: Bearer <token>
```

Response:

```json
{
  "id": "uuid",
  "referenceNumber": "RPT-2026-000042",
  "type": "CRIME",
  "severity": "HIGH",
  "status": "INVESTIGATING",
  "title": "Suspicious activity near park",
  "description": "...",
  "latitude": 14.5995,
  "longitude": 120.9842,
  "locationAddress": "Near Barangay Park, Main Street",
  "isAnonymous": false,
  "photoUrls": ["uploads/reports/photo1.jpg"],
  "submittedAt": "2026-03-10T10:30:00Z",
  "lastUpdatedAt": "2026-03-10T14:15:00Z",
  "responses": [
    {
      "id": "uuid",
      "responderId": "uuid",
      "responderName": "Officer Juan Dela Cruz",
      "responseText": "We have deployed a patrol team to investigate",
      "createdAt": "2026-03-10T11:00:00Z"
    }
  ],
  "reporter": {
    "id": "uuid",
    "name": "Maria Santos"
  }
}
```

---

### Requirement: Update Report Status API

The system SHALL provide `PATCH /api/e-sumbong/reports/:id/status` accepting:

| Field  | Type   | Required | Description                          |
| ------ | ------ | -------- | ------------------------------------ |
| status | string | Yes      | New status (valid transition)        |
| notes  | string | No       | Optional notes for the status change |

**Valid status transitions**:

- SUBMITTED → ACKNOWLEDGED, DISMISSED
- ACKNOWLEDGED → INVESTIGATING, RESOLVED, DISMISSED
- INVESTIGATING → RESOLVED, DISMISSED
- RESOLVED → CLOSED
- Any status → DISMISSED (admin only)

Only users with BARANGAY_POLICE, STAFF, or ADMIN roles can update status.

#### Scenario: Police acknowledges report

```http
PATCH /api/e-sumbong/reports/uuid/status
Authorization: Bearer <police_token>
Content-Type: application/json

{
  "status": "ACKNOWLEDGED",
  "notes": "Received and assigned to patrol unit"
}
```

Response: Updated report object.

---

### Requirement: Add Response API

The system SHALL provide `POST /api/e-sumbong/reports/:id/responses` accepting:

| Field        | Type   | Required | Description      |
| ------------ | ------ | -------- | ---------------- |
| responseText | string | Yes      | Response message |

Only users with BARANGAY_POLICE, STAFF, or ADMIN roles can add responses.

When a response is added, the system SHALL notify the citizen who submitted the report.

#### Scenario: Police adds response

```http
POST /api/e-sumbong/reports/uuid/responses
Authorization: Bearer <police_token>
Content-Type: application/json

{
  "responseText": "We have investigated and increased patrols in the area. Please contact us if you notice further suspicious activity."
}
```

Response: `201 Created` with response object.

---

### Requirement: Resolve Report API

The system SHALL provide `PATCH /api/e-sumbong/reports/:id/resolve` accepting:

| Field             | Type   | Required | Description               |
| ----------------- | ------ | -------- | ------------------------- |
| resolutionDetails | string | Yes      | Description of resolution |

This updates the status to RESOLVED, sets `resolvedAt` timestamp, and saves the resolution details.

#### Scenario: Police resolves report

```http
PATCH /api/e-sumbong/reports/uuid/resolve
Authorization: Bearer <police_token>
Content-Type: application/json

{
  "resolutionDetails": "Patrol team investigated the area. No suspicious activity found at the time of inspection. Increased patrols scheduled for the next week."
}
```

Response: Updated report with status RESOLVED.

---

### Requirement: Photo Upload API

The system SHALL provide `POST /api/e-sumbong/upload-photos` accepting multipart/form-data with up to 3 image files.

**Validation**:

- Max 3 files per request
- Max 5MB per file
- Allowed MIME types: image/jpeg, image/png, image/webp

Response: Array of uploaded file URLs.

#### Scenario: Upload photos before submitting report

```http
POST /api/e-sumbong/upload-photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [photo1.jpg, photo2.jpg]
```

Response:

```json
{
  "urls": [
    "uploads/reports/202603/uuid-photo1.jpg",
    "uploads/reports/202603/uuid-photo2.jpg"
  ]
}
```

---

### Requirement: Report Analytics

The system SHALL provide `GET /api/e-sumbong/analytics` returning:

| Metric                | Description                                   |
| --------------------- | --------------------------------------------- |
| totalReports          | Total number of reports                       |
| pendingReports        | Reports with status SUBMITTED or ACKNOWLEDGED |
| resolvedThisWeek      | Reports resolved in the last 7 days           |
| emergencyReports      | Reports with severity EMERGENCY               |
| reportsByType         | Count grouped by report type                  |
| reportsByStatus       | Count grouped by status                       |
| averageResolutionTime | Average hours from submission to resolution   |

Only accessible by BARANGAY_POLICE, STAFF, or ADMIN roles.

#### Scenario: Dashboard fetches analytics

```http
GET /api/e-sumbong/analytics
Authorization: Bearer <admin_token>
```

Response:

```json
{
  "totalReports": 342,
  "pendingReports": 12,
  "resolvedThisWeek": 28,
  "emergencyReports": 3,
  "reportsByType": {
    "CRIME": 45,
    "NOISE_COMPLAINT": 89,
    "PUBLIC_SAFETY": 67,
    ...
  },
  "reportsByStatus": {
    "SUBMITTED": 5,
    "ACKNOWLEDGED": 7,
    "INVESTIGATING": 15,
    "RESOLVED": 280,
    "CLOSED": 35
  },
  "averageResolutionTime": 28.5
}
```

---

### Requirement: Map Display

The frontend SHALL display reports on an interactive map with:

- Pins color-coded by severity (green=LOW, yellow=MEDIUM, orange=HIGH, red=EMERGENCY)
- Clicking a pin opens a popup with report summary
- Filter controls to show/hide reports by status, type, or severity
- Zoom and pan controls
- Option to cluster nearby pins when zoomed out

#### Scenario: Viewing reports map

- **WHEN** a police officer opens the Reports Management page
- **THEN** an interactive map is displayed showing all reports as pins
- **AND** pins change color based on severity
- **WHEN** the officer clicks on a red pin
- **THEN** a popup shows the report title, type, and status
- **AND** clicking "View Details" opens the full report modal

---

### Requirement: Geolocation

The frontend SHALL provide "Use My Location" functionality that:

- Requests browser geolocation permission
- Auto-fills latitude and longitude fields with current location
- Places a pin at current location on the map
- Falls back gracefully if permission is denied

#### Scenario: Using current location

- **WHEN** a citizen clicks "Use My Location" while submitting a report
- **AND** grants geolocation permission
- **THEN** the map centers on their current location
- **AND** a pin is placed at that location
- **AND** the latitude and longitude fields are populated

---

### Requirement: Audit Logging

The system SHALL log the following actions:

- Report created (action: REPORT_CREATED)
- Status changed (action: REPORT_STATUS_UPDATED)
- Response added (action: REPORT_RESPONSE_ADDED)
- Report resolved (action: REPORT_RESOLVED)
- Report deleted (action: REPORT_DELETED)

All audit logs SHALL include userId, timestamp, reportId, and action details.

#### Scenario: Audit trail for report lifecycle

- **WHEN** a report is created, updated, and resolved
- **THEN** the audit logs contain entries for REPORT_CREATED, REPORT_STATUS_UPDATED (multiple), REPORT_RESPONSE_ADDED, and REPORT_RESOLVED
- **AND** each entry includes the user ID of who performed the action
