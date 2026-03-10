import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { PageHeader, Button, Card } from '@/components/ui';
import { ReportStatusBadge } from '@/features/e-sumbong/ReportStatusBadge';
import { ReportSeverityBadge } from '@/features/e-sumbong/ReportSeverityBadge';
import { useESumbongApi } from '@/features/e-sumbong/useESumbongApi';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';
import { HiArrowLeft } from 'react-icons/hi2';
import type { ReportType, ReportStatus } from '@/api/types';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

function formatCoord(value: number | string) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(6) : 'N/A';
}

export function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff' || user?.role === 'barangay_police';

  const {
    currentReport,
    responses,
    loading,
    fetchReportById,
    updateReportStatus,
    addResponse,
    resolveReport,
  } = useESumbongApi();

  const [responseText, setResponseText] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<ReportStatus | ''>('');
  const [resolutionDetails, setResolutionDetails] = useState('');

  useEffect(() => {
    if (id) fetchReportById(id);
  }, [id, fetchReportById]);

  const handleAddResponse = async () => {
    if (!id || !responseText.trim()) return;
    const success = await addResponse(id, { responseText });
    if (success) {
      setResponseText('');
      fetchReportById(id);
    }
  };

  const handleUpdateStatus = async () => {
    if (!id || !statusUpdate) return;
    const success = await updateReportStatus(id, { status: statusUpdate });
    if (success) {
      setStatusUpdate('');
      fetchReportById(id);
    }
  };

  const handleResolve = async () => {
    if (!id || !resolutionDetails.trim()) return;
    const success = await resolveReport(id, { resolutionDetails });
    if (success) {
      setResolutionDetails('');
      fetchReportById(id);
    }
  };

  if (loading && !currentReport) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-500" />
        <p className="ml-3 text-sm text-slate-600">Loading report details...</p>
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Report not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(-1)}>
          <HiArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const lat = Number(currentReport.latitude);
  const lng = Number(currentReport.longitude);
  const hasValidCoords = Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Report ${currentReport.referenceNumber}`}
        description={currentReport.title}
        action={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <HiArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column – details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & severity */}
          <Card>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <ReportStatusBadge status={currentReport.status} />
              <ReportSeverityBadge severity={currentReport.severity} />
              <span className="ml-auto text-xs text-slate-500">
                Submitted {formatDate(currentReport.submittedAt)}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-slate-800 mb-1">{currentReport.title}</h2>
            <p className="text-sm text-slate-500 mb-4">{typeLabels[currentReport.type]}</p>

            <h4 className="text-sm font-medium text-slate-700 mb-1">Description</h4>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{currentReport.description}</p>
          </Card>

          {/* Reporter */}
          <Card>
            <h4 className="text-sm font-medium text-slate-700 mb-1">Reporter</h4>
            <p className="text-sm text-slate-600">
              {currentReport.isAnonymous ? 'Anonymous' : currentReport.user?.name || 'Unknown'}
            </p>
          </Card>

          {/* Location */}
          <Card>
            <h4 className="text-sm font-medium text-slate-700 mb-1">Location</h4>
            <p className="text-sm text-slate-600 mb-1">
              {currentReport.locationAddress || 'Location pinned on map'}
            </p>
            <p className="text-xs text-slate-500 mb-3">
              📍 {formatCoord(currentReport.latitude)}, {formatCoord(currentReport.longitude)}
            </p>

            {hasValidCoords && (
              <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <MapContainer
                  center={[lat, lng]}
                  zoom={17}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[lat, lng]} />
                </MapContainer>
              </div>
            )}
          </Card>

          {/* Photos */}
          {currentReport.photoUrls && currentReport.photoUrls.length > 0 && (
            <Card>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Photos</h4>
              <div className="grid grid-cols-3 gap-2">
                {currentReport.photoUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded border border-slate-200"
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Resolution */}
          {(currentReport.status === 'RESOLVED' || currentReport.status === 'CLOSED') && (
            <Card>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-800 mb-1">✓ Report Completed</h4>
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
            </Card>
          )}
        </div>

        {/* Right column – responses & actions */}
        <div className="space-y-6">
          {/* Response History */}
          <Card>
            <h4 className="text-sm font-medium text-slate-700 mb-3">
              Response History {responses.length > 0 && `(${responses.length})`}
            </h4>
            {responses.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
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
            ) : (
              <p className="text-sm text-slate-400">No responses yet.</p>
            )}
          </Card>

          {/* Admin actions */}
          {isAdmin && currentReport.status !== 'RESOLVED' && currentReport.status !== 'CLOSED' && (
            <>
              {/* Add Response */}
              <Card>
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
              </Card>

              {/* Quick Actions & Status */}
              <Card>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Quick Actions</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentReport.status === 'SUBMITTED' && (
                    <Button
                      onClick={async () => {
                        if (!id) return;
                        const success = await updateReportStatus(id, { status: 'ACKNOWLEDGED' });
                        if (success) fetchReportById(id);
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
                        if (!id) return;
                        const success = await updateReportStatus(id, { status: 'INVESTIGATING' });
                        if (success) fetchReportById(id);
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      🔍 Start Investigation
                    </Button>
                  )}
                </div>

                <h4 className="text-sm font-medium text-slate-700 mb-2">Update Status</h4>
                <div className="flex gap-2">
                  <select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value as ReportStatus)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
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
              </Card>

              {/* Resolve */}
              <Card>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Resolve & Complete Report</h4>
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
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
