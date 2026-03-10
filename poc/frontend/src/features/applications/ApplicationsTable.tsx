import { Table, type Column } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import type { Application, ApplicationType } from '@/api/types';

const typeLabels: Record<ApplicationType, string> = {
  BARANGAY_CLEARANCE: 'Barangay Clearance',
  CERTIFICATE_OF_RESIDENCY: 'Certificate of Residency',
  BUSINESS_PERMIT: 'Business Permit',
  INDIGENCY_CERTIFICATE: 'Indigency Certificate',
  CEDULA: 'Cedula',
};

interface ApplicationsTableProps {
  applications: Application[];
}

export function ApplicationsTable({
  applications,
}: ApplicationsTableProps) {
  const columns: Column<Application>[] = [
    {
      key: 'referenceNumber',
      header: 'Reference #',
      render: (app) => (
        <span className="font-mono font-medium text-brand-600">
          {app.referenceNumber}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (app) => (
        <span className="text-sm text-slate-700">
          {typeLabels[app.type] ?? app.type}
        </span>
      ),
    },
    {
      key: 'applicantName',
      header: 'Applicant',
      render: (app) => (
        <span className="font-medium text-slate-800">{app.applicantName}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (app) => <ApplicationStatusBadge status={app.status} />,
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      render: (app) => (
        <span className="text-sm text-slate-500">
          {formatDate(app.submittedAt)}
        </span>
      ),
    },
  ];

  return (
    <Table
      data={applications}
      columns={columns}
      keyExtractor={(app) => app.id}
      emptyMessage="No applications found"
    />
  );
}
