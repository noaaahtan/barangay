## MODIFIED Requirements

### Requirement: Dashboard Metrics

The dashboard SHALL display the following equipment reservation metrics:

| Metric             | Description                                           |
| ------------------ | ----------------------------------------------------- |
| Total Reservations | Count of all equipment reservations                   |
| Pending Approval   | Count of reservations with status REQUESTED           |
| Upcoming This Week | Count of APPROVED reservations starting within 7 days |

The dashboard SHALL also display a "Recent Reservations" widget showing the last 5 reservations with:

- Reference number
- Event name
- Status (badge)
- Date range

#### Scenario: Dashboard shows reservation metrics

- **WHEN** an admin views the dashboard
- **THEN** reservation metric cards display current counts

#### Scenario: Recent reservations are displayed

- **WHEN** an admin views the dashboard
- **THEN** the 5 most recent reservations are shown in the recent reservations widget
