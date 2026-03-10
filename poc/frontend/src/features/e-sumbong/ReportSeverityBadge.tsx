import type { ReportSeverity } from '@/api/types';

const severityConfig: Record<
  ReportSeverity,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  LOW: { label: 'Low', color: 'text-green-700', bgColor: 'bg-green-100', icon: 'ℹ️' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '⚠️' },
  HIGH: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: '⚠️' },
  EMERGENCY: { label: 'Emergency', color: 'text-red-700', bgColor: 'bg-red-100', icon: '🚨' },
};

interface ReportSeverityBadgeProps {
  severity: ReportSeverity;
}

export function ReportSeverityBadge({ severity }: ReportSeverityBadgeProps) {
  const config = severityConfig[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
