import { Badge, EmptyState } from '@/components/ui';
import type { StockHistoryEntry } from '@/api/types';
import { formatDate } from '@/lib/utils';

interface StockTimelineProps {
  entries: StockHistoryEntry[];
}

export function StockTimeline({ entries }: StockTimelineProps) {
  if (entries.length === 0) {
    return <EmptyState message="No stock history for this item." />;
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, index) => (
        <div key={entry.id} className="relative flex gap-4 pb-6">
          {/* Timeline line */}
          {index < entries.length - 1 && (
            <div className="absolute left-[11px] top-7 h-full w-px bg-brand-100" />
          )}

          {/* Dot */}
          <div
            className={`relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full border-2 ${
              entry.quantityChange > 0
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
            }`}
          />

          {/* Content */}
          <div className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={entry.quantityChange > 0 ? 'success' : 'danger'}>
                  {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange}
                </Badge>
                <span className="text-sm font-medium text-slate-700">
                  Stock: {entry.quantityAfter}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {formatDate(entry.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{entry.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
