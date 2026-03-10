import type { EquipmentReservation } from "@/api/types";
import { EquipmentReservationStatusBadge } from "./EquipmentReservationStatusBadge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui";

interface ReservationCardProps {
  reservation: EquipmentReservation;
  onCancel?: (id: string) => void;
}

export function ReservationCard({ reservation, onCancel }: ReservationCardProps) {
  const items = reservation.requestedItems
    .map((item) => `${item.type.replace(/_/g, " ")}: ${item.quantity}`)
    .join(", ");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{reservation.eventName}</p>
          <p className="text-xs text-slate-500">{reservation.eventLocation}</p>
          <p className="mt-1 text-xs text-slate-500">
            {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
          </p>
          <p className="mt-2 text-xs text-slate-600">{items}</p>
        </div>
        <EquipmentReservationStatusBadge status={reservation.status} />
      </div>
      {onCancel && (
        <div className="mt-3 flex justify-end">
          <Button size="sm" variant="danger" onClick={() => onCancel(reservation.id)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
