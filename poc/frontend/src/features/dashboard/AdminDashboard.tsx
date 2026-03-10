import { PageHeader } from '@/components/ui';
import { StatCard } from '@/components/ui';
import { HiOutlineDocumentText, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { formatNumber } from '@/lib/utils';

export function AdminDashboard() {
  // TODO: Replace with actual API calls when backend is ready
  const stats = {
    totalApplications: 0,
    pendingReviews: 0,
    readyForPickup: 0,
    activeReports: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of barangay operations and citizen requests"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={formatNumber(stats.totalApplications)}
          icon={<HiOutlineDocumentText className="h-5 w-5" />}
          iconColor="sky"
        />
        <StatCard
          label="Pending Reviews"
          value={formatNumber(stats.pendingReviews)}
          icon={<HiOutlineClock className="h-5 w-5" />}
          iconColor="green"
        />
        <StatCard
          label="Ready for Pickup"
          value={formatNumber(stats.readyForPickup)}
          icon={<HiOutlineCheckCircle className="h-5 w-5" />}
          iconColor="gold"
        />
        <StatCard
          label="Active Reports"
          value={formatNumber(stats.activeReports)}
          icon={<HiOutlineExclamationTriangle className="h-5 w-5" />}
          iconColor="green"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 tracking-tight">Recent Applications</h2>
          <p className="text-sm text-slate-500">No applications yet.</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 tracking-tight">Recent E-Sumbong</h2>
          <p className="text-sm text-slate-500">No reports yet.</p>
        </div>
      </div>
    </div>
  );
}
