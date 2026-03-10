import { useEffect, useState } from "react";
import { PageHeader, Card, Button } from "@/components/ui";
import { useEquipmentReservationsApi } from "@/features/equipment-reservations/useEquipmentReservationsApi";
import { useEquipmentInventoryApi } from "@/features/equipment-reservations/useEquipmentInventoryApi";
import { ReservationForm } from "@/features/equipment-reservations/ReservationForm";
import { MyReservationsList } from "@/features/equipment-reservations/MyReservationsList";

export function MyReservationsPage() {
  const {
    reservations,
    fetchReservations,
    createReservation,
    cancelReservation,
  } = useEquipmentReservationsApi();
  const { items, fetchItems } = useEquipmentInventoryApi();
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReservations({ page: 1, limit: 10 });
    fetchItems();
  }, [fetchReservations, fetchItems]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reservations"
        description="Reserve barangay equipment and track your requests"
      />

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">New Reservation</h2>
          <Button
            variant="primary"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? "Hide Form" : "Create Request"}
          </Button>
        </div>
        {showForm && (
          <div className="mt-4">
            <ReservationForm
              items={items}
              onSubmit={async (payload) => {
                setSubmitting(true);
                await createReservation(payload);
                setSubmitting(false);
                setShowForm(false);
                fetchReservations({ page: 1, limit: 10 });
              }}
            />
            {submitting && (
              <p className="mt-2 text-xs text-slate-500">Submitting reservation...</p>
            )}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">My Requests</h2>
        <MyReservationsList
          reservations={reservations}
          onCancel={async (id) => {
            await cancelReservation(id);
            fetchReservations({ page: 1, limit: 10 });
          }}
        />
      </Card>
    </div>
  );
}
