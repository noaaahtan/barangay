## 1. Backend — Equipment Catalog & Reservations

- [ ] 1.1 Create `EquipmentItem` entity (`backend/src/equipment-reservations/entities/equipment-item.entity.ts`) with id, type (enum), name, quantityTotal, quantityAvailable (derived or stored), isActive, createdAt, updatedAt
- [ ] 1.2 Create `EquipmentReservation` entity (`backend/src/equipment-reservations/entities/equipment-reservation.entity.ts`) with id, referenceNumber, status (enum), eventName, eventLocation, startDate, endDate, requestedItems (JSON list of type + quantity), approvedItems (JSON list), notes, userId (FK), reviewedBy (FK), reviewedAt, fulfilledAt, createdAt, updatedAt
- [ ] 1.3 Add enums in `backend/src/common/constants.ts`: `EquipmentType` (CHAIR, TABLE, TENT, SOUND_SYSTEM, LIGHTS, STAGE_PANEL), `EquipmentReservationStatus` (REQUESTED, APPROVED, DECLINED, CANCELLED, FULFILLED, BLOCKED)
- [ ] 1.4 Create `EquipmentReservationsRepository` with create, findAll (filters + pagination + role-based), findOne, update, remove, and overlap queries by date range
- [ ] 1.5 Create `EquipmentReservationsService` with create (availability validation), approve/decline, cancel, fulfill, and availability lookup; inject `AuditLogsService`
- [ ] 1.6 Create DTOs: `CreateEquipmentReservationDto`, `UpdateEquipmentReservationDto`, `UpdateReservationStatusDto`, `EquipmentReservationsQueryDto`, `AvailabilityQueryDto`
- [ ] 1.7 Create `EquipmentReservationsController` with POST, GET list, GET/:id, PATCH/:id/status, PATCH/:id, DELETE/:id; pass `req.user.id`
- [ ] 1.8 Create `EquipmentInventoryRepository` and `EquipmentInventoryService` for CRUD on equipment items (admin only)
- [ ] 1.9 Create `EquipmentInventoryController` with GET list, POST, PATCH/:id, DELETE/:id
- [ ] 1.10 Create `EquipmentReservationsModule` and register in `AppModule`
- [ ] 1.11 Add reference number generator helper (format: EQP-YYYY-XXXXXX)
- [ ] 1.12 Implement availability calculation: sum approved + blocked quantities overlapping the date range per equipment type; reject overbooking

## 2. Frontend — Equipment Reservations (Admin)

- [ ] 2.1 Add types to `api/types.ts`: `EquipmentItem`, `EquipmentReservation`, `EquipmentReservationStatus`, `EquipmentType`, `EquipmentAvailability`
- [ ] 2.2 Create `features/equipment-reservations/useEquipmentReservationsApi.ts` — list, approve, decline, cancel, fulfill, availability lookup
- [ ] 2.3 Create `features/equipment-reservations/useEquipmentInventoryApi.ts` — CRUD equipment items
- [ ] 2.4 Create `features/equipment-reservations/EquipmentCalendar.tsx` — calendar grid with availability badges per day
- [ ] 2.5 Create `features/equipment-reservations/ReservationDetailsModal.tsx` — view reservation, approve/decline, edit notes
- [ ] 2.6 Create `features/equipment-reservations/InventoryTable.tsx` — manage equipment quantities and active status
- [ ] 2.7 Create `pages/EquipmentReservationsPage.tsx` — admin page with calendar, requests list, inventory panel

## 3. Frontend — My Reservations (Citizen)

- [ ] 3.1 Create `features/equipment-reservations/ReservationForm.tsx` — date range picker, item quantity inputs, event details
- [ ] 3.2 Create `features/equipment-reservations/ReservationCard.tsx` — status badge, date range, requested items
- [ ] 3.3 Create `features/equipment-reservations/MyReservationsList.tsx` — list with pagination
- [ ] 3.4 Create `pages/MyReservationsPage.tsx` — citizen page to create and track reservations

## 4. Dashboard Integration

- [ ] 4.1 Add equipment reservation metrics to dashboard API endpoint (total reservations, pending approval, upcoming this week)
- [ ] 4.2 Update `DashboardPage.tsx` to display equipment reservation metrics and a recent reservations widget

## 5. Navigation & Routes

- [ ] 5.1 Update `Sidebar.tsx` — add "Equipment Reservations" nav item (admin/staff) and "My Reservations" (citizen)
- [ ] 5.2 Update `App.tsx` — add `/equipment-reservations` and `/my-reservations` routes

## 6. Validation & Testing

- [ ] 6.1 Verify backend builds cleanly
- [ ] 6.2 Verify frontend builds cleanly
- [ ] 6.3 Test availability rules (overbooking rejected)
- [ ] 6.4 Test admin approval workflow and status transitions
- [ ] 6.5 Test citizen reservation creation and cancellation
- [ ] 6.6 Test audit logging for all mutations
