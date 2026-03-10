## MODIFIED Requirements

### Requirement: Sidebar Navigation

The sidebar SHALL display navigation links for: Dashboard, Items, Categories, Stock History, and Audit Logs.

Each link shows an icon and label. The active page link is highlighted with brand colors and a subtle shadow. Inactive links show a hover effect.

The sidebar footer displays the logged-in user's name, email, and a logout button.

| Link | Icon | Path |
|------|------|------|
| Dashboard | Grid squares | `/` |
| Items | Cube | `/items` |
| Categories | Tag | `/categories` |
| Stock History | Clock | `/stock-history` |
| Audit Logs | Clipboard/Shield | `/audit-logs` |

#### Scenario: Navigate between pages
- **WHEN** the user clicks a sidebar link
- **THEN** the corresponding page is rendered and the link is highlighted as active
