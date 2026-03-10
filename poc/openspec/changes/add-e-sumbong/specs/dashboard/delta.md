## MODIFIED Requirements

### Requirement: Dashboard Metrics (MODIFIED)

The dashboard metrics SHALL include e-sumbong statistics:

**Added metrics**:

- Total reports submitted
- Pending reports (SUBMITTED + ACKNOWLEDGED)
- Reports resolved this week
- Emergency reports requiring immediate attention

#### Scenario: Dashboard displays e-sumbong metrics (NEW)

- **WHEN** an admin views the dashboard
- **THEN** e-sumbong metrics are displayed in stat cards
- **AND** a "Recent Reports" widget shows the 5 most recent reports with status and severity

---

### Requirement: Dashboard Recent Activity (MODIFIED)

The recent activity feed SHALL include e-sumbong events:

**Added event types**:

- Report submitted (with severity badge)
- Report acknowledged by police
- Report resolved

#### Scenario: Recent activity includes reports (NEW)

- **WHEN** a citizen submits a high-severity report
- **THEN** the dashboard recent activity shows "New HIGH severity report: [title]"
- **WHEN** a police officer resolves a report
- **THEN** the dashboard shows "Report [reference] marked as resolved"

---

### Requirement: Dashboard Map Mini-View (NEW)

The dashboard SHALL include a mini-map widget showing:

- Active reports (status: SUBMITTED, ACKNOWLEDGED, INVESTIGATING) as pins
- Color-coded by severity
- Clickable pins that open report details modal
- "View Full Map" button linking to Reports Management page

This gives administrators a quick geographical overview of active incidents.

#### Scenario: Quick map overview

- **WHEN** an admin views the dashboard
- **THEN** a mini-map shows all active reports in the barangay
- **WHEN** the admin clicks on a red pin (emergency)
- **THEN** a modal opens showing the report details
