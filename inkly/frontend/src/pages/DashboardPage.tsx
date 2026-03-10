import { PageHeader } from '@/components/ui';
import { StatCards } from '@/features/dashboard/StatCards';
import { RecentActivity } from '@/features/dashboard/RecentActivity';
import { useDashboardApi } from '@/features/dashboard/useDashboardApi';

export function DashboardPage() {
  const { stats, recentActivity, loading } = useDashboardApi();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your inventory"
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          {stats && <StatCards stats={stats} />}
          <RecentActivity activity={recentActivity} />
        </>
      )}
    </div>
  );
}
