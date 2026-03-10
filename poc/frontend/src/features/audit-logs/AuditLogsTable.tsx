import { Table, Badge, type Column } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { AuditLog, AuditAction } from '@/api/types';

const actionBadge: Record<AuditAction, { label: string; variant: 'success' | 'info' | 'danger' }> = {
  CREATE: { label: 'Create', variant: 'success' },
  UPDATE: { label: 'Update', variant: 'info' },
  DELETE: { label: 'Delete', variant: 'danger' },
};

const entityLabel: Record<string, string> = {
  item: 'Item',
  category: 'Category',
};

interface AuditLogsTableProps {
  logs: AuditLog[];
}

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      header: 'Action',
      render: (log) => {
        const badge = actionBadge[log.action] ?? { label: log.action, variant: 'info' as const };
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      },
    },
    {
      key: 'entityType',
      header: 'Entity',
      render: (log) => (
        <span className="capitalize">{entityLabel[log.entityType] ?? log.entityType}</span>
      ),
    },
    {
      key: 'entityName',
      header: 'Name',
      render: (log) => (
        <span className="font-medium text-slate-800">{log.entityName}</span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600">
            {log.user?.name?.charAt(0) ?? '?'}
          </div>
          <span className="text-sm text-slate-600">{log.user?.name ?? 'Unknown'}</span>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (log) => (
        <span className="text-slate-500">{log.details ?? '—'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (log) => (
        <span className="text-slate-500">{formatDate(log.createdAt)}</span>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={logs}
      keyExtractor={(log) => log.id}
      emptyMessage="No audit logs found"
    />
  );
}
