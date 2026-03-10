import { Card, Button } from '@/components/ui';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { formatDate } from '@/lib/utils';
import type { Application, ApplicationType } from '@/api/types';

const typeLabels: Record<ApplicationType, string> = {
  BARANGAY_CLEARANCE: 'Barangay Clearance',
  CERTIFICATE_OF_RESIDENCY: 'Certificate of Residency',
  BUSINESS_PERMIT: 'Business Permit',
  INDIGENCY_CERTIFICATE: 'Indigency Certificate',
  CEDULA: 'Cedula',
};

interface ApplicationCardProps {
  application: Application;
  onViewDetails: (application: Application) => void;
}

export function ApplicationCard({
  application,
  onViewDetails,
}: ApplicationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-sm font-medium text-brand-600">
              {application.referenceNumber}
            </span>
            <ApplicationStatusBadge status={application.status} />
          </div>
          <h3 className="font-semibold text-slate-800">
            {typeLabels[application.type] ?? application.type}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Submitted: {formatDate(application.submittedAt)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails(application)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}
