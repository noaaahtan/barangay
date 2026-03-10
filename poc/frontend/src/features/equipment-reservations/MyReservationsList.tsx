import type { EquipmentReservation } from "@/api/types";
import { ReservationCard } from "./ReservationCard";

interface MyReservationsListProps {
  reservations: EquipmentReservation[];
  onCancel: (id: string) => void;
}

export function MyReservationsList({ reservations, onCancel }: MyReservationsListProps) {
  if (reservations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        No reservations yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
