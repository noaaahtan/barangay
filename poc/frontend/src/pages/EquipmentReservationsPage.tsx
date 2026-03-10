import { useEffect, useMemo, useState } from "react";
import { PageHeader, Card, Input, Button, Select } from "@/components/ui";
import { EquipmentCalendar } from "@/features/equipment-reservations/EquipmentCalendar";
import { ReservationDetailsModal } from "@/features/equipment-reservations/ReservationDetailsModal";
import { InventoryTable } from "@/features/equipment-reservations/InventoryTable";
import { EquipmentReservationStatusBadge } from "@/features/equipment-reservations/EquipmentReservationStatusBadge";
import { useEquipmentReservationsApi } from "@/features/equipment-reservations/useEquipmentReservationsApi";
import { useEquipmentInventoryApi } from "@/features/equipment-reservations/useEquipmentInventoryApi";
import type { EquipmentAvailability, EquipmentReservation, EquipmentType } from "@/api/types";
import { EquipmentReservationStatus } from "@/api/types";
import { formatDate } from "@/lib/utils";

function formatISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(start: string, end: string) {
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(formatISO(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const equipmentTypeOptions = [
  { value: "CHAIR", label: "Chair" },
  { value: "TABLE", label: "Table" },
  { value: "TENT", label: "Tent" },
  { value: "SOUND_SYSTEM", label: "Sound System" },
  { value: "LIGHTS", label: "Lights" },
  { value: "STAGE_PANEL", label: "Stage Panel" },
];

export function EquipmentReservationsPage() {
  const {
    reservations,
    fetchReservations,
    updateStatus,
    fetchAvailability,
  } = useEquipmentReservationsApi();
  const {
    items,
    fetchItems,
    createItem,
    updateItem,
    deactivateItem,
  } = useEquipmentInventoryApi();

  const [selectedReservation, setSelectedReservation] = useState<EquipmentReservation | null>(null);
  const [activeTab, setActiveTab] = useState<"reservations" | "inventory">("reservations");
  const [calendarStart, setCalendarStart] = useState(formatISO(new Date()));
  const [calendarEnd, setCalendarEnd] = useState(formatISO(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)));
  const [calendarDays, setCalendarDays] = useState<{
    date: string;
    availability: EquipmentAvailability[];
  }[]>([]);

  const [newItemType, setNewItemType] = useState<EquipmentType | "">("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(0);

  useEffect(() => {
    fetchReservations({ page: 1, limit: 50 });
    fetchItems();
  }, [fetchReservations, fetchItems]);

  useEffect(() => {
    const loadAvailability = async () => {
      const days = getDateRange(calendarStart, calendarEnd);
      const results = [] as { date: string; availability: EquipmentAvailability[] }[];
      for (const date of days) {
        const availability = await fetchAvailability(date, date);
        results.push({ date, availability });
      }
      setCalendarDays(results);
    };
    loadAvailability();
  }, [calendarStart, calendarEnd, fetchAvailability]);

  const requestedReservations = useMemo(() => {
    return [...reservations].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [reservations]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment Reservations"
        description="Manage equipment requests, inventory, and availability"
      />

      <Card>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={activeTab === "reservations" ? "primary" : "secondary"}
            onClick={() => setActiveTab("reservations")}
          >
            Reservations
          </Button>
          <Button
            type="button"
            variant={activeTab === "inventory" ? "primary" : "secondary"}
            onClick={() => setActiveTab("inventory")}
          >
            Inventory
          </Button>
        </div>
      </Card>

      {activeTab === "reservations" && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Reservations</h2>
              <p className="text-sm text-slate-500">Latest to oldest for easy updates</p>
            </div>
          </div>
          {requestedReservations.length === 0 ? (
            <p className="text-sm text-slate-500">No reservations yet.</p>
          ) : (
            <div className="space-y-3">
              {requestedReservations.map((reservation) => (
                <button
                  key={reservation.id}
                  type="button"
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-brand-200 hover:bg-brand-50/30"
                  onClick={() => setSelectedReservation(reservation)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {reservation.eventName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {reservation.requestedItems
                          .map((item) => `${item.type.replace(/_/g, " ")}: ${item.quantity}`)
                          .join(", ")}
                      </p>
                    </div>
                    <EquipmentReservationStatusBadge status={reservation.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}


      {activeTab === "inventory" && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Inventory</h2>
              <p className="text-sm text-slate-500">Manage equipment quantities</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Select
              label="Type"
              value={newItemType}
              options={equipmentTypeOptions}
              placeholder="Select type"
              onChange={(event) => setNewItemType(event.target.value as EquipmentType)}
            />
            <Input
              label="Name"
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder="Plastic Chair"
            />
            <Input
              label="Quantity"
              type="number"
              min={0}
              value={newItemQuantity}
              onChange={(event) => setNewItemQuantity(Number(event.target.value))}
            />
            <div className="flex items-end">
              <Button
                onClick={async () => {
                  if (!newItemType || !newItemName) return;
                  await createItem({
                    type: newItemType,
                    name: newItemName,
                    quantityTotal: newItemQuantity,
                  });
                  setNewItemType("");
                  setNewItemName("");
                  setNewItemQuantity(0);
                  fetchItems();
                }}
              >
                Add Item
              </Button>
            </div>
          </div>

          <InventoryTable
            items={items}
            onEdit={async (item) => {
              const name = window.prompt("Update item name", item.name) ?? item.name;
              const quantityInput = window.prompt(
                "Update total quantity",
                String(item.quantityTotal),
              );
              const parsedQuantity = quantityInput ? Number(quantityInput) : item.quantityTotal;
              const quantityTotal = Number.isNaN(parsedQuantity)
                ? item.quantityTotal
                : parsedQuantity;
              const updated = await updateItem(item.id, {
                name,
                quantityTotal,
              });
              if (updated) {
                fetchItems();
              }
            }}
            onDeactivate={async (item) => {
              await deactivateItem(item.id);
              fetchItems();
            }}
          />
        </Card>
      )}

      <ReservationDetailsModal
        open={!!selectedReservation}
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onUpdateStatus={async (id, status, notes) => {
          await updateStatus(id, { status, notes });
          fetchReservations({ page: 1, limit: 50 });
        }}
      />
    </div>
  );
}
