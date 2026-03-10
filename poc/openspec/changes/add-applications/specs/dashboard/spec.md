## MODIFIED Requirements

### Requirement: Dashboard Metrics

The dashboard SHALL display the following application metrics:

| Metric             | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| Total Applications | Count of all applications regardless of status              |
| Pending Review     | Count of applications with status SUBMITTED or UNDER_REVIEW |
| Ready for Pickup   | Count of applications with status READY_FOR_PICKUP          |

The dashboard SHALL also display a "Recent Applications" widget showing the last 5 applications with:

- Reference number
- Applicant name
- Status (badge)
- Submitted date

#### Scenario: Dashboard shows application metrics

- **WHEN** an admin views the dashboard
- **THEN** application metric cards display current counts

#### Scenario: Recent applications are displayed

- **WHEN** an admin views the dashboard
- **THEN** the 5 most recent applications are shown in the recent applications widget
