import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, Modal } from '@/components/ui';
import { ReportCard } from '@/features/e-sumbong/ReportCard';
import { ReportStatusBadge } from '@/features/e-sumbong/ReportStatusBadge';
import { ReportSeverityBadge } from '@/features/e-sumbong/ReportSeverityBadge';
import { useESumbongApi } from '@/features/e-sumbong/useESumbongApi';
import { formatDate } from '@/lib/utils';
import { HiPlus, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
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

export function MyReportsPage() {
  const { reports, currentReport, responses, meta, loading, fetchReports, fetchReportById } =
    useESumbongApi();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports({ page, limit: 20 });
  }, [page, fetchReports]);

  useEffect(() => {
    if (selectedReport) {
      fetchReportById(selectedReport.id);
    }
  }, [selectedReport, fetchReportById]);

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
  };

  const handleCloseDetails = () => {
    setSelectedReport(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reports"
        description="Track your submitted reports and responses"
        action={
          <Button onClick={() => navigate('/e-sumbong/submit')}>
            <HiPlus className="h-4 w-4" />
            Submit New Report
          </Button>
        }
      />

      {loading && !selectedReport ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">You haven't submitted any reports yet.</p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => navigate('/e-sumbong/submit')}
          >
            Submit Your First Report
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-500">
                Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <HiChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === meta.totalPages}
                >
                  <HiChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Report Details Modal */}
      <Modal
        open={!!selectedReport && !!currentReport}
        onClose={handleCloseDetails}
        title={`Report Details - ${currentReport?.referenceNumber}`}
      >
        {currentReport && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <ReportStatusBadge status={currentReport.status} />
              <ReportSeverityBadge severity={currentReport.severity} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800">{currentReport.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{typeLabels[currentReport.type]}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Description</h4>
              <p className="text-sm text-slate-600">{currentReport.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Location</h4>
              <p className="text-sm text-slate-600">
                {currentReport.locationAddress || 'Location pinned on map'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                📍 {currentReport.latitude.toFixed(6)}, {currentReport.longitude.toFixed(6)}
              </p>
            </div>

            {currentReport.photoUrls && currentReport.photoUrls.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Photos</h4>
                <div className="grid grid-cols-3 gap-2">
                  {currentReport.photoUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Submitted</h4>
              <p className="text-sm text-slate-600">{formatDate(currentReport.submittedAt)}</p>
            </div>

            {currentReport.resolvedAt && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Resolution</h4>
                <p className="text-sm text-slate-600">{currentReport.resolutionDetails}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Resolved on {formatDate(currentReport.resolvedAt)}
                </p>
              </div>
            )}

            {/* Responses */}
            {responses.length > 0 && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Responses</h4>
                <div className="space-y-3">
                  {responses.map((response) => (
                    <div key={response.id} className="bg-slate-50 p-3 rounded">
                      <p className="text-sm text-slate-600">{response.responseText}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {response.responder?.name || 'Barangay Official'} •{' '}
                        {formatDate(response.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
