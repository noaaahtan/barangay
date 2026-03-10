import type { ReportStatus } from '@/api/types';

const statusConfig: Record<
  ReportStatus,
  { label: string; color: string; bgColor: string }
> = {
  SUBMITTED: { label: 'Submitted', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  ACKNOWLEDGED: { label: 'Acknowledged', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  INVESTIGATING: { label: 'Ongoing', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  RESOLVED: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
  CLOSED: { label: 'Closed', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  DISMISSED: { label: 'Dismissed', color: 'text-red-700', bgColor: 'bg-red-100' },
};

interface ReportStatusBadgeProps {
  status: ReportStatus;
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
}
