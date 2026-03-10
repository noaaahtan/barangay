import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageHeader, Button, Modal } from '@/components/ui';
import { ApplicationCard } from '@/features/applications/ApplicationCard';
import { ApplicationForm } from '@/features/applications/ApplicationForm';
import { ApplicationStatusBadge } from '@/features/applications/ApplicationStatusBadge';
import { useApplicationsApi } from '@/features/applications/useApplicationsApi';
import { formatDate } from '@/lib/utils';
import { HiPlus, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import type { Application, ApplicationType } from '@/api/types';

const typeLabels: Record<ApplicationType, string> = {
  BARANGAY_CLEARANCE: 'Barangay Clearance',
  CERTIFICATE_OF_RESIDENCY: 'Certificate of Residency',
  BUSINESS_PERMIT: 'Business Permit',
  INDIGENCY_CERTIFICATE: 'Indigency Certificate',
  CEDULA: 'Cedula',
};

export function MyApplicationsPage() {
  const { applications, meta, loading, fetchApplications } =
    useApplicationsApi();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications({ page, limit: 20 });
  }, [page, fetchApplications]);

  useEffect(() => {
    const state = location.state as { openNewApplication?: boolean } | null;
    if (state?.openNewApplication) {
      setShowForm(true);
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const handleSuccess = () => {
    setShowForm(false);
    setPage(1);
    fetchApplications({ page: 1, limit: 20 });
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApp(app);
  };

  const handleCloseDetails = () => {
    setSelectedApp(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="Track your barangay document applications"
        action={
          <Button onClick={() => setShowForm(true)}>
            <HiPlus className="h-4 w-4" />
            Apply for Document
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : applications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">
            You haven't submitted any applications yet.
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => setShowForm(true)}
          >
            Submit Your First Application
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
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
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <HiChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <HiChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Application Form Modal */}
      <ApplicationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
      />

      {/* View Details Modal */}
      {selectedApp && (
        <Modal
          open={true}
          onClose={handleCloseDetails}
          title="Application Details"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Reference Number
              </label>
              <p className="font-mono text-brand-600">
                {selectedApp.referenceNumber}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Document Type
              </label>
              <p>{typeLabels[selectedApp.type] ?? selectedApp.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Status
              </label>
              <div>
                <ApplicationStatusBadge status={selectedApp.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Submitted
              </label>
              <p className="text-sm text-slate-600">
                {formatDate(selectedApp.submittedAt)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Purpose
              </label>
              <p className="text-sm text-slate-600">{selectedApp.purpose}</p>
            </div>
            {selectedApp.notes && (
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Admin Notes
                </label>
                <p className="text-sm text-slate-600">{selectedApp.notes}</p>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="secondary" onClick={handleCloseDetails}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
