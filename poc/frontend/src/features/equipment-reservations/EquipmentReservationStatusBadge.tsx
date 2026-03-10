import { Badge } from "@/components/ui";
import { EquipmentReservationStatus } from "@/api/types";

const STATUS_CONFIG: Record<EquipmentReservationStatus, { label: string; variant: "success" | "danger" | "warning" | "info" | "default" }> = {
  [EquipmentReservationStatus.SUBMITTED]: { label: "Submitted", variant: "info" },
  [EquipmentReservationStatus.FOR_DELIVERY]: { label: "For Delivery", variant: "warning" },
  [EquipmentReservationStatus.REJECTED]: { label: "Rejected", variant: "danger" },
  [EquipmentReservationStatus.CANCELLED]: { label: "Cancelled", variant: "default" },
  [EquipmentReservationStatus.COMPLETED]: { label: "Completed", variant: "success" },
};

export function EquipmentReservationStatusBadge({ status }: { status: EquipmentReservationStatus }) {
  const style = STATUS_CONFIG[status];
  return <Badge variant={style.variant}>{style.label}</Badge>;
}
