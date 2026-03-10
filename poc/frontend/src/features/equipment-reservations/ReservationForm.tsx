import { useMemo, useState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import type { CreateEquipmentReservationPayload, EquipmentItem, EventType } from "@/api/types";
import { EventType as EventTypeEnum } from "@/api/types";

interface ReservationFormProps {
  items: EquipmentItem[];
  onSubmit: (payload: CreateEquipmentReservationPayload) => Promise<void>;
}

const EVENT_TYPE_OPTIONS = [
  { value: EventTypeEnum.BIRTHDAY, label: "Birthday" },
  { value: EventTypeEnum.WEDDING, label: "Wedding" },
  { value: EventTypeEnum.BURIAL, label: "Burial" },
  { value: EventTypeEnum.COMMUNITY_EVENT, label: "Community Event" },
  { value: EventTypeEnum.SPORTS_EVENT, label: "Sports Event" },
  { value: EventTypeEnum.MEETING, label: "Meeting" },
  { value: EventTypeEnum.OTHER, label: "Other" },
];

export function ReservationForm({ items, onSubmit }: ReservationFormProps) {
  const [eventType, setEventType] = useState<EventType | "">(""); 
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const itemsByType = useMemo(() => {
    const map = new Map<string, EquipmentItem>();
    for (const item of items) {
      map.set(item.type, item);
    }
    return map;
  }, [items]);

  const requestedItems = useMemo(
    () =>
      items
        .map((item) => ({
          type: item.type,
          quantity: quantities[item.type] ?? 0,
        }))
        .filter((item) => item.quantity > 0),
    [items, quantities],
  );

  const selectedItems = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([type, quantity]) => ({
          type,
          quantity,
          label: itemsByType.get(type)?.name ?? type.replace(/_/g, " "),
        })),
    [itemsByType, quantities],
  );

  const availableItemOptions = useMemo(
    () =>
      items.filter((item) => (quantities[item.type] ?? 0) === 0),
    [items, quantities],
  );

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!eventType || !eventName || !eventLocation || !startDate || !endDate) {
          return;
        }
        if (requestedItems.length === 0) {
          return;
        }
        setSubmitting(true);
        await onSubmit({
          eventType,
          eventName,
          eventLocation,
          startDate,
          endDate,
          requestedItems,
        });
        setSubmitting(false);
        setEventType("");
        setEventName("");
        setEventLocation("");
        setStartDate("");
        setEndDate("");
        setNotes("");
        setSelectedItemType("");
        setSelectedQuantity(1);
        setQuantities({});
      }}
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Event Type <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          value={eventType}
          onChange={(event) => setEventType(event.target.value as EventType)}
          required
        >
          <option value="">Select event type...</option>
          {EVENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Event Name"
        value={eventName}
        onChange={(event) => setEventName(event.target.value)}
        placeholder="e.g., John's 50th Birthday"
        required
      />
      <Input
        label="Event Location"
        value={eventLocation}
        onChange={(event) => setEventLocation(event.target.value)}
        placeholder="Barangay Hall"
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          required
        />
      </div>
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">Requested Items</p>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">
            No equipment items are available yet. Please check back later.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[200px] flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Item</label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  value={selectedItemType}
                  onChange={(event) => setSelectedItemType(event.target.value)}
                >
                  <option value="">Select item...</option>
                  {availableItemOptions.map((item) => (
                    <option key={item.id} value={item.type}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-28">
                <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                <Input
                  type="number"
                  min={1}
                  className="w-full"
                  value={selectedQuantity}
                  onChange={(event) => setSelectedQuantity(Number(event.target.value))}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!selectedItemType || selectedQuantity <= 0}
                  onClick={() => {
                    if (!selectedItemType || selectedQuantity <= 0) return;
                    setQuantities((prev) => ({
                      ...prev,
                      [selectedItemType]: selectedQuantity,
                    }));
                    setSelectedItemType("");
                    setSelectedQuantity(1);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {selectedItems.length === 0 ? (
              <p className="text-sm text-slate-500">No items selected yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Item</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedItems.map((item) => (
                      <tr key={item.type}>
                        <td className="px-3 py-2 text-slate-800">{item.label}</td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {item.type.replace(/_/g, " ")}
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={1}
                            className="w-24"
                            value={item.quantity}
                            onChange={(event) =>
                              setQuantities((prev) => ({
                                ...prev,
                                [item.type]: Number(event.target.value),
                              }))
                            }
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                              setQuantities((prev) => ({
                                ...prev,
                                [item.type]: 0,
                              }))
                            }
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      <Textarea
        label="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Optional notes about your reservation"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Reservation"}
        </Button>
      </div>
    </form>
  );
}
