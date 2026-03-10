import { useState, useEffect } from 'react';
import {
  PageHeader,
  SearchInput,
  Select,
  Button,
  Modal,
  Textarea,
} from '@/components/ui';
import { ApplicationStatusBadge } from '@/features/applications/ApplicationStatusBadge';
import { formatDate } from '@/lib/utils';
import { useApplicationsApi } from '@/features/applications/useApplicationsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import type {
  Application,
  ApplicationStatus,
  ApplicationType,
} from '@/api/types';

const statusOptions = [
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const typeOptions = [
  { value: 'BARANGAY_CLEARANCE', label: 'Barangay Clearance' },
  { value: 'CERTIFICATE_OF_RESIDENCY', label: 'Certificate of Residency' },
  { value: 'BUSINESS_PERMIT', label: 'Business Permit' },
  { value: 'INDIGENCY_CERTIFICATE', label: 'Indigency Certificate' },
  { value: 'CEDULA', label: 'Cedula' },
];

export function ApplicationsPage() {
  const { applications, meta, loading, fetchApplications, updateStatus } =
    useApplicationsApi();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchApplications({
      page: 1,
      limit: 20,
      search: debouncedSearch || undefined,
      status: (statusFilter as ApplicationStatus) || undefined,
      type: (typeFilter as ApplicationType) || undefined,
    });
  }, [debouncedSearch, statusFilter, typeFilter, fetchApplications]);

  useEffect(() => {
    fetchApplications({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: (statusFilter as ApplicationStatus) || undefined,
      type: (typeFilter as ApplicationType) || undefined,
    });
  }, [page, fetchApplications, debouncedSearch, statusFilter, typeFilter]);

  const handleRowClick = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setNotes(app.notes || '');
  };

  const handleCloseModal = () => {
    setSelectedApp(null);
    setNewStatus('');
    setNotes('');
  };

  const handleSave = async () => {
    if (!selectedApp || !newStatus) return;

    setIsUpdating(true);
    const success = await updateStatus(selectedApp.id, {
      status: newStatus,
      notes: notes || undefined,
    });
    setIsUpdating(false);

    if (success) {
      addToast('Application updated successfully', 'success');
      handleCloseModal();
      fetchApplications({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        status: (statusFilter as ApplicationStatus) || undefined,
        type: (typeFilter as ApplicationType) || undefined,
      });
    } else {
      addToast('Failed to update application', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Manage citizen applications for barangay services"
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by reference or name..."
          className="w-72"
        />
        <Select
          options={statusOptions}
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
        <Select
          options={typeOptions}
          placeholder="All Types"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-56"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Reference #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Applicant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="cursor-pointer transition-colors hover:bg-brand-50/30"
                    onClick={() => handleRowClick(app)}
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className="font-mono font-medium text-brand-600">
                        {app.referenceNumber}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {app.type.replace(/_/g, ' ')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                      {app.applicantName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                      {formatDate(app.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-500">
                Page {meta.page} of {meta.totalPages} — {meta.total} total
                applications
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

      {/* Application Details Modal */}
      {selectedApp && (
        <Modal
          open={true}
          onClose={handleCloseModal}
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
                Applicant
              </label>
              <p>{selectedApp.applicantName}</p>
              <p className="text-sm text-slate-500">
                {selectedApp.applicantEmail}
              </p>
              <p className="text-sm text-slate-500">
                {selectedApp.applicantPhone}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Purpose
              </label>
              <p className="text-sm text-slate-600">{selectedApp.purpose}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Status
              </label>
              <Select
                options={statusOptions}
                value={newStatus}
                onChange={(e) =>
                  setNewStatus(e.target.value as ApplicationStatus)
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Admin Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
