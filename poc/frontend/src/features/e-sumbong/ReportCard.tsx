import { Card, Button } from '@/components/ui';
import { ReportStatusBadge } from './ReportStatusBadge';
import { ReportSeverityBadge } from './ReportSeverityBadge';
import { formatDate } from '@/lib/utils';
import type { Report, ReportType } from '@/api/types';

const typeLabels: Record<ReportType, string> = {
  CRIME: 'Crime',
  NOISE_COMPLAINT: 'Noise Complaint',
  PUBLIC_SAFETY: 'Public Safety',
  INFRASTRUCTURE: 'Infrastructure',
  HEALTH_HAZARD: 'Health Hazard',
  STRAY_ANIMALS: 'Stray Animals',
  ILLEGAL_ACTIVITY: 'Illegal Activity',
  ENVIRONMENTAL: 'Environmental',
  OTHER: 'Other',
};

interface ReportCardProps {
  report: Report;
  onViewDetails: (report: Report) => void;
}

export function ReportCard({ report, onViewDetails }: ReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-medium text-brand-600">
              {report.referenceNumber}
            </span>
            <ReportStatusBadge status={report.status} />
            <ReportSeverityBadge severity={report.severity} />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">{report.title}</h3>
          <p className="text-sm text-slate-600 mb-2">{typeLabels[report.type]}</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>📍 {report.locationAddress || 'Location pinned on map'}</span>
            <span>📅 {formatDate(report.submittedAt)}</span>
          </div>
          {report.photoUrls && report.photoUrls.length > 0 && (
            <div className="mt-2 text-xs text-slate-500">
              📷 {report.photoUrls.length} photo{report.photoUrls.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => onViewDetails(report)}>
          View Details
        </Button>
      </div>
    </Card>
  );
}
