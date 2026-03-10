## MODIFIED Requirements

### Requirement: Navigation Menu (MODIFIED)

The navigation sidebar SHALL include e-sumbong menu items:

**For CITIZEN role**:

- "E-Sumbong" section with:
  - "Submit Report" (icon: plus/flag)
  - "My Reports" (icon: list/document)

**For BARANGAY_POLICE, STAFF, ADMIN roles**:

- "E-Sumbong Management" section with:
  - "Reports Dashboard" (icon: map-pin)
  - "All Reports" (icon: list)
  - Badge showing count of pending reports (SUBMITTED + ACKNOWLEDGED)

#### Scenario: Citizen sees report submission menu (NEW)

- **WHEN** a citizen user views the sidebar navigation
- **THEN** they see "E-Sumbong" section with "Submit Report" and "My Reports" links
- **WHEN** they click "Submit Report"
- **THEN** they are navigated to `/e-sumbong/submit`

#### Scenario: Police sees management menu with badge (NEW)

- **WHEN** a barangay police officer views the sidebar navigation
- **THEN** they see "E-Sumbong Management" section
- **AND** a badge displays the number of pending reports (e.g., "12")
- **WHEN** they click "Reports Dashboard"
- **THEN** they are navigated to `/e-sumbong/manage` showing the map view

---

### Requirement: Report Status Badges (NEW)

The system SHALL use consistent status badge colors:

| Status        | Color  | Background   |
| ------------- | ------ | ------------ |
| SUBMITTED     | blue   | light blue   |
| ACKNOWLEDGED  | purple | light purple |
| INVESTIGATING | orange | light orange |
| RESOLVED      | green  | light green  |
| CLOSED        | gray   | light gray   |
| DISMISSED     | red    | light red    |

#### Scenario: Status badges are color-coded

- **WHEN** viewing a list of reports
- **THEN** each report displays a color-coded status badge matching the color scheme above

---

### Requirement: Severity Indicators (NEW)

The system SHALL use consistent severity indicators:

| Severity  | Color  | Icon          |
| --------- | ------ | ------------- |
| LOW       | green  | info          |
| MEDIUM    | yellow | warning       |
| HIGH      | orange | alert         |
| EMERGENCY | red    | alert-octagon |

Map pins SHALL use these colors for visual identification.

#### Scenario: Emergency reports are visually distinct

- **WHEN** viewing a report with EMERGENCY severity
- **THEN** the severity badge is red with an alert-octagon icon
- **AND** the map pin for that report is red
