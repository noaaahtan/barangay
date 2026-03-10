import { useEffect } from 'react';
import { PageHeader, Card, Button, Badge } from '@/components/ui';
import {
  HiOutlineDocumentText,
  HiOutlineCube,
  HiOutlineExclamationCircle,
  HiOutlinePlus,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { useApplicationsApi } from '@/features/applications/useApplicationsApi';
import type { EquipmentReservation } from '@/api/types';
import { ApplicationStatusBadge } from '@/features/applications/ApplicationStatusBadge';
import type { ApplicationType } from '@/api/types';

const typeLabels: Record<ApplicationType, string> = {
  BARANGAY_CLEARANCE: 'Barangay Clearance',
  CERTIFICATE_OF_RESIDENCY: 'Certificate of Residency',
  BUSINESS_PERMIT: 'Business Permit',
  INDIGENCY_CERTIFICATE: 'Indigency Certificate',
  CEDULA: 'Cedula',
};

export function CitizenDashboard() {
  const { applications, loading, fetchApplications } = useApplicationsApi();
  const myReservations: EquipmentReservation[] = [];
  const myReports: any[] = [];

  useEffect(() => {
    fetchApplications({ page: 1, limit: 3 });
  }, [fetchApplications]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        description="Track your applications, reservations, and reports"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2.5">
              <HiOutlineDocumentText className="h-5 w-5 text-brand-600" />
              My Applications
            </h2>
            <Link to="/applications" state={{ openNewApplication: true }}>
              <Button size="sm" variant="primary">
                <HiOutlinePlus className="h-4 w-4 mr-1" />
                New
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500 mb-5 font-medium">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500 mb-5 font-medium">No applications yet</p>
              <Link to="/applications" state={{ openNewApplication: true }}>
                <Button variant="secondary" size="sm" className="font-medium">Apply for Requirements</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-brand-50/30"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {typeLabels[app.type] ?? app.type}
                    </p>
                    <p className="text-xs text-slate-500">{app.referenceNumber}</p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>
              ))}
              {applications.length >= 3 && (
                <div className="pt-2 text-right">
                  <Link to="/applications" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                    View all
                  </Link>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2.5">
              <HiOutlineCube className="h-5 w-5 text-brand-600" />
              Equipment Reservations
            </h2>
            <Link to="/my-reservations">
              <Button size="sm" variant="primary">
                <HiOutlinePlus className="h-4 w-4 mr-1" />
                Reserve
              </Button>
            </Link>
          </div>
          {myReservations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500 mb-5 font-medium">No reservations yet</p>
              <Link to="/my-reservations">
                <Button variant="secondary" size="sm" className="font-medium">Reserve Equipment</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myReservations.map((res: any) => (
                <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-brand-50/30">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{res.equipment}</p>
                    <p className="text-xs text-slate-500">{res.date}</p>
                  </div>
                  <Badge variant={res.status === 'approved' ? 'success' : 'default'}>
                    {res.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2.5">
              <HiOutlineExclamationCircle className="h-5 w-5 text-brand-600" />
              My E-Sumbong
            </h2>
            <Link to="/esumbong/new">
              <Button size="sm" variant="primary">
                <HiOutlinePlus className="h-4 w-4 mr-1" />
                Report
              </Button>
            </Link>
          </div>
          {myReports.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500 mb-5 font-medium">No reports yet</p>
              <Link to="/esumbong/new">
                <Button variant="secondary" size="sm" className="font-medium">Submit Report</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myReports.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-brand-50/30">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{report.type}</p>
                    <p className="text-xs text-slate-500">{report.status}</p>
                  </div>
                  <Badge variant={report.status === 'resolved' ? 'success' : 'default'}>
                    {report.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
