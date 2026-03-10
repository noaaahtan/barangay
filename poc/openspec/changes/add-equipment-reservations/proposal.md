# Change: Add Equipment Reservations

## Why

Citizens need a way to reserve barangay equipment (chairs, tables, tents, etc.) for community events without visiting the barangay hall. A calendar-style booking system with availability checks will reduce scheduling conflicts and make reservations transparent for both citizens and administrators.

## What Changes

- **New equipment catalog** with equipment types (chairs, tables, tents, sound system, lights, stage panels, etc.), quantities, and availability status.
- **New equipment reservation workflow** with event type selection (birthday, wedding, burial, community event, sports event, meeting, other), date range selection, requested quantities, event details, and status tracking (submitted, for_delivery, completed, rejected, cancelled).
- **Availability rules** that prevent overbooking by validating quantities against existing reservations with FOR_DELIVERY or COMPLETED status in the selected date range.
- **Calendar booking UI** that shows availability per day and reserved dates.
- **Admin management** for equipment inventory, reservation approvals (marking as for_delivery or rejected), and pre-approved reservations for barangay use.
- **Audit logging** for all create/update/delete reservation actions.
- **Frontend pages** for citizens (reserve equipment with event type dropdown, view my reservations) and admins (calendar view, approve/reject, manage inventory).

## Impact

- Affected specs: new `equipment-reservations` capability
- Affected specs (modified): `dashboard`, `branding-theming`
- Affected code:
  - `backend/src/equipment-reservations/` — new module (entity, repository, service, controller)
  - `backend/src/common/constants.ts` — enums for reservation status and equipment type
  - `backend/src/app.module.ts` — register module
  - `frontend/src/features/equipment-reservations/` — new feature
  - `frontend/src/pages/EquipmentReservationsPage.tsx` — admin calendar + approvals
  - `frontend/src/pages/MyReservationsPage.tsx` — citizen view
  - `frontend/src/layouts/Sidebar.tsx` — nav items
  - `frontend/src/App.tsx` — routes
  - `frontend/src/api/types.ts` — types
