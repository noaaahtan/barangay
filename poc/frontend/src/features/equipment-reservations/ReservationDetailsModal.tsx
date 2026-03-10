import { useMemo, useState } from "react";
import { Modal, Button, Select, Textarea } from "@/components/ui";
import type { EquipmentReservation } from "@/api/types";
import { EquipmentReservationStatus } from "@/api/types";
import { EquipmentReservationStatusBadge } from "./EquipmentReservationStatusBadge";
import { formatDate } from "@/lib/utils";

interface ReservationDetailsModalProps {
  open: boolean;
  reservation: EquipmentReservation | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: EquipmentReservationStatus, notes?: string) => Promise<void>;
}

export function ReservationDetailsModal({
  open,
  reservation,
  onClose,
  onUpdateStatus,
}: ReservationDetailsModalProps) {
  const [status, setStatus] = useState<EquipmentReservationStatus | "">("");
  const [notes, setNotes] = useState("");

  const statusOptions = useMemo(
    () =>
      [
        { value: EquipmentReservationStatus.FOR_DELIVERY, label: "Mark For Delivery" },
        { value: EquipmentReservationStatus.REJECTED, label: "Reject" },
        { value: EquipmentReservationStatus.COMPLETED, label: "Mark Completed" },
        { value: EquipmentReservationStatus.CANCELLED, label: "Cancel" },
      ] as { value: EquipmentReservationStatus; label: string }[],
    [],
  );

  if (!reservation) {
    return null;
  }

  const requestedItems = reservation.requestedItems
    .map((item) => `${item.type.replace(/_/g, " ")}: ${item.quantity}`)
    .join(", ");

  return (
    <Modal open={open} onClose={onClose} title="Reservation Details">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">Reference</p>
          <p className="font-mono text-sm text-brand-600">{reservation.referenceNumber}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">{reservation.eventName}</p>
            <p className="text-xs text-slate-500">{reservation.eventLocation}</p>
          </div>
          <EquipmentReservationStatusBadge status={reservation.status} />
        </div>
        <div className="text-xs text-slate-500">
          {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
        </div>
        <div className="text-sm text-slate-600">
          <span className="font-medium text-slate-700">Requested:</span> {requestedItems}
        </div>

        <Select
          label="Update Status"
          value={status}
          options={statusOptions}
          placeholder="Select action"
          onChange={(event) => setStatus(event.target.value as EquipmentReservationStatus)}
        />
        <Textarea
          label="Notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add notes for this update"
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} type="button">
            Close
          </Button>
          <Button
            onClick={async () => {
              if (!status) return;
              await onUpdateStatus(reservation.id, status, notes || undefined);
              setStatus("");
              setNotes("");
              onClose();
            }}
            disabled={!status}
          >
            Apply Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}
