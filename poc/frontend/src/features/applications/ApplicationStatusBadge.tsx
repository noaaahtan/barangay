import { Badge } from '@/components/ui';
import { ApplicationStatus } from '@/api/types';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'default' }
> = {
  [ApplicationStatus.SUBMITTED]: { label: 'Submitted', variant: 'info' },
  [ApplicationStatus.APPROVED]: { label: 'Approved', variant: 'success' },
  [ApplicationStatus.REJECTED]: { label: 'Rejected', variant: 'danger' },
  [ApplicationStatus.READY_FOR_PICKUP]: {
    label: 'Ready for Pickup',
    variant: 'info',
  },
  [ApplicationStatus.COMPLETED]: { label: 'Completed', variant: 'default' },
  [ApplicationStatus.CANCELLED]: { label: 'Cancelled', variant: 'default' },
};

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: 'default' as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
