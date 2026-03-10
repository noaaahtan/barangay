import { PageHeader, Card, Button, Badge } from '@/components/ui';
import { HiOutlineDocumentText, HiOutlineCube, HiOutlineExclamationCircle, HiOutlinePlus } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

export function CitizenDashboard() {
  // TODO: Replace with actual API calls when backend is ready
  const myApplications = [];
  const myReservations = [];
  const myReports = [];

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
            <Link to="/applications/new">
              <Button size="sm" variant="primary">
                <HiOutlinePlus className="h-4 w-4 mr-1" />
                New
              </Button>
            </Link>
          </div>
          {myApplications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500 mb-5 font-medium">No applications yet</p>
              <Link to="/applications/new">
                <Button variant="secondary" size="sm" className="font-medium">Apply for Requirements</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {myApplications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-brand-50/30">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{app.type}</p>
                    <p className="text-xs text-slate-500">{app.status}</p>
                  </div>
                  <Badge variant={app.status === 'ready' ? 'success' : 'default'}>
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2.5">
              <HiOutlineCube className="h-5 w-5 text-brand-600" />
              Equipment Reservations
            </h2>
            <Link to="/equipment/reserve">
              <Button size="sm" variant="primary">
                <HiOutlinePlus className="h-4 w-4 mr-1" />
                Reserve
              </Button>
            </Link>
          </div>
          {myReservations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500 mb-5 font-medium">No reservations yet</p>
              <Link to="/equipment/reserve">
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
