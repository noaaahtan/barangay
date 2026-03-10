import { formatDate } from "@/lib/utils";
import type { EquipmentAvailability } from "@/api/types";

interface DayAvailability {
  date: string;
  availability: EquipmentAvailability[];
}

interface EquipmentCalendarProps {
  days: DayAvailability[];
}

function formatDayLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function EquipmentCalendar({ days }: EquipmentCalendarProps) {
  if (days.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
        Select a date range to view availability.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {days.map((day) => (
        <div
          key={day.date}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              {formatDayLabel(day.date)}
            </span>
            <span className="text-xs text-slate-400">
              {formatDate(day.date).split(",")[0]}
            </span>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            {Array.isArray(day.availability) && day.availability.length > 0 ? (
              day.availability.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">{item.type.replace(/_/g, " ")}</span>
                  <span className={item.available > 0 ? "text-green-600" : "text-red-500"}>
                    {item.available}/{item.total}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-slate-400">No inventory data</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
