import { Card, Badge } from '@/components/ui';
import type { StockHistoryEntry } from '@/api/types';
import { formatDate } from '@/lib/utils';

interface RecentActivityProps {
  activity: StockHistoryEntry[];
}

export function RecentActivity({ activity }: RecentActivityProps) {
  if (activity.length === 0) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
        <p className="mt-4 text-sm text-slate-500">No stock changes yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Activity</h2>
      <div className="space-y-3">
        {activity.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 transition-colors hover:bg-brand-50/30"
          >
            <div className="flex items-center gap-3">
              <Badge variant={entry.quantityChange > 0 ? 'success' : 'danger'}>
                {entry.quantityChange > 0 ? `+${entry.quantityChange}` : entry.quantityChange}
              </Badge>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {entry.item?.name || 'Unknown Item'}
                </p>
                <p className="text-xs text-slate-500">{entry.reason}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono text-slate-700">
                Qty: {entry.quantityAfter}
              </p>
              <p className="text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
