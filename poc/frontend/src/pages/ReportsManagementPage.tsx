import { useState, useEffect } from 'react';
import { PageHeader, Button, Modal, Card } from '@/components/ui';
import { ReportsMap } from '@/components/Map/ReportsMap';
import { ReportCard } from '@/features/e-sumbong/ReportCard';
import { ReportStatusBadge } from '@/features/e-sumbong/ReportStatusBadge';
import { ReportSeverityBadge } from '@/features/e-sumbong/ReportSeverityBadge';
import { useESumbongApi } from '@/features/e-sumbong/useESumbongApi';
import { formatDate } from '@/lib/utils';
import { HiMap, HiListBullet } from 'react-icons/hi2';
import type { Report, ReportType, ReportStatus } from '@/api/types';

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

export function ReportsManagementPage() {
  const {
    reports,
    currentReport,
    responses,
    analytics,
    loading,
    fetchReports,
    fetchReportById,
    fetchAnalytics,
    updateReportStatus,
    addResponse,
    resolveReport,
  } = useESumbongApi();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filters, setFilters] = useState<{
    status?: string;
    type?: string;
    severity?: string;
  }>({});
  const [responseText, setResponseText] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<ReportStatus | ''>('');
  const [resolutionDetails, setResolutionDetails] = useState('');

  useEffect(() => {
    fetchReports({ page: 1, limit: 100, ...filters });
    fetchAnalytics();
  }, [filters, fetchReports, fetchAnalytics]);

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
    setResponseText('');
    setStatusUpdate('');
    setResolutionDetails('');
  };

  const handleAddResponse = async () => {
    if (!selectedReport || !responseText.trim()) return;
    const success = await addResponse(selectedReport.id, { responseText });
    if (success) {
      setResponseText('');
      fetchReportById(selectedReport.id);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !statusUpdate) return;
    const success = await updateReportStatus(selectedReport.id, { status: statusUpdate });
    if (success) {
      setStatusUpdate('');
      fetchReportById(selectedReport.id);
      fetchReports({ page: 1, limit: 100, ...filters });
    }
  };

  const handleResolve = async () => {
    if (!selectedReport || !resolutionDetails.trim()) return;
    const success = await resolveReport(selectedReport.id, { resolutionDetails });
    if (success) {
      setResolutionDetails('');
      fetchReportById(selectedReport.id);
      fetchReports({ page: 1, limit: 100, ...filters });
      handleCloseDetails();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="E-Sumbong Management"
        description="View and respond to citizen reports"
      />

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm text-slate-600">Total Reports</p>
            <p className="text-2xl font-bold text-slate-900">{analytics.totalReports}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{analytics.pendingReports}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">Resolved This Week</p>
            <p className="text-2xl font-bold text-green-600">{analytics.resolvedThisWeek}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-600">Emergency</p>
            <p className="text-2xl font-bold text-red-600">{analytics.emergencyReports}</p>
          </Card>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <HiListBullet className="h-4 w-4" />
            List View
          </Button>
          <Button
            variant={viewMode === 'map' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <HiMap className="h-4 w-4" />
            Map View
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="INVESTIGATING">Ongoing</option>
            <option value="RESOLVED">Completed</option>
            <option value="CLOSED">Closed</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          <select
            value={filters.severity || ''}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value || undefined })}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg"
          >
            <option value="">All Severities</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {loading && reports.length === 0 ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          {viewMode === 'map' ? (
            <ReportsMap reports={reports} onReportClick={handleViewDetails} height="600px" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} onViewDetails={handleViewDetails} />
              ))}
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
              <h4 className="text-sm font-medium text-slate-700 mb-1">Reporter</h4>
              <p className="text-sm text-slate-600">
                {currentReport.isAnonymous
                  ? 'Anonymous'
                  : currentReport.user?.name || 'Unknown'}
              </p>
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

            {/* Responses */}
            {responses.length > 0 && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Response History</h4>
                <div className="space-y-3 max-h-40 overflow-y-auto">
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

            {/* Add Response */}
            {currentReport.status !== 'RESOLVED' && currentReport.status !== 'CLOSED' && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Add Response</h4>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter your response..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button
                  onClick={handleAddResponse}
                  disabled={!responseText.trim()}
                  size="sm"
                  className="mt-2"
                >
                  Add Response
                </Button>
              </div>
            )}

            {/* Update Status */}
            {currentReport.status !== 'CLOSED' && currentReport.status !== 'RESOLVED' && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Update Status</h4>
                <div className="flex gap-2">
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value as ReportStatus)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">Select new status</option>
                    {currentReport.status === 'SUBMITTED' && (
                      <option value="ACKNOWLEDGED">Acknowledged</option>
                    )}
                    {(currentReport.status === 'SUBMITTED' || currentReport.status === 'ACKNOWLEDGED') && (
                      <option value="INVESTIGATING">Investigating (Ongoing)</option>
                    )}
                    <option value="DISMISSED">Dismiss Report</option>
                  </select>
                  <Button onClick={handleUpdateStatus} disabled={!statusUpdate} size="sm">
                    Update
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Status Actions */}
            {currentReport.status !== 'CLOSED' && currentReport.status !== 'RESOLVED' && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {currentReport.status === 'SUBMITTED' && (
                    <Button
                      onClick={async () => {
                        const success = await updateReportStatus(currentReport.id, { status: 'ACKNOWLEDGED' });
                        if (success) {
                          fetchReportById(currentReport.id);
                          fetchReports({ page: 1, limit: 100, ...filters });
                        }
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      ✓ Acknowledge
                    </Button>
                  )}
                  {(currentReport.status === 'SUBMITTED' || currentReport.status === 'ACKNOWLEDGED') && (
                    <Button
                      onClick={async () => {
                        const success = await updateReportStatus(currentReport.id, { status: 'INVESTIGATING' });
                        if (success) {
                          fetchReportById(currentReport.id);
                          fetchReports({ page: 1, limit: 100, ...filters });
                        }
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      🔍 Start Investigation
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Resolve Report */}
            {currentReport.status !== 'RESOLVED' && currentReport.status !== 'CLOSED' && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  Resolve & Complete Report
                </h4>
                <textarea
                  value={resolutionDetails}
                  onChange={(e) => setResolutionDetails(e.target.value)}
                  placeholder="Enter resolution details and actions taken..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button
                  onClick={handleResolve}
                  disabled={!resolutionDetails.trim()}
                  variant="primary"
                  className="mt-2"
                >
                  ✓ Mark as Resolved & Close
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  This will mark the report as resolved and close it. The citizen will be notified.
                </p>
              </div>
            )}

            {/* Report Completed */}
            {(currentReport.status === 'RESOLVED' || currentReport.status === 'CLOSED') && (
              <div className="border-t border-slate-200 pt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-800 mb-1">
                    ✓ Report Completed
                  </h4>
                  <p className="text-sm text-green-700">
                    {currentReport.status === 'RESOLVED' 
                      ? 'This report has been resolved and marked as complete.'
                      : 'This report has been closed.'}
                  </p>
                  {currentReport.resolutionDetails && (
                    <div className="mt-3 border-t border-green-200 pt-3">
                      <p className="text-xs font-medium text-green-800 mb-1">Resolution Details:</p>
                      <p className="text-sm text-green-700">{currentReport.resolutionDetails}</p>
                      {currentReport.resolvedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          Resolved on {formatDate(currentReport.resolvedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
