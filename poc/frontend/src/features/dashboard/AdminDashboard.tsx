import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import type { Application, ApiResponse } from '@/api/types';
import { PageHeader } from '@/components/ui';
import { StatCard } from '@/components/ui';
import { HiOutlineDocumentText, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { formatNumber, formatDate } from '@/lib/utils';
import { ApplicationStatusBadge } from '@/features/applications/ApplicationStatusBadge';

interface ApplicationsMetrics {
  total: number;
  pendingReview: number;
  readyForPickup: number;
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<ApplicationsMetrics>({
    total: 0,
    pendingReview: 0,
    readyForPickup: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, recentRes] = await Promise.all([
          apiClient.get<ApplicationsMetrics | ApiResponse<ApplicationsMetrics>>(
            '/applications/metrics',
          ),
          apiClient.get<Application[] | ApiResponse<Application[]>>(
            '/applications/recent',
          ),
        ]);
        const metricsPayload = 'data' in metricsRes.data
          ? metricsRes.data.data
          : metricsRes.data;
        const recentPayload = 'data' in recentRes.data
          ? recentRes.data.data
          : recentRes.data;
        setMetrics(
          metricsPayload ?? { total: 0, pendingReview: 0, readyForPickup: 0 },
        );
        setRecentApplications(recentPayload ?? []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of barangay operations and citizen requests"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={loading ? '...' : formatNumber(metrics.total)}
          icon={<HiOutlineDocumentText className="h-5 w-5" />}
          iconColor="sky"
        />
        <StatCard
          label="Pending Reviews"
          value={loading ? '...' : formatNumber(metrics.pendingReview)}
          icon={<HiOutlineClock className="h-5 w-5" />}
          iconColor="green"
        />
        <StatCard
          label="Ready for Pickup"
          value={loading ? '...' : formatNumber(metrics.readyForPickup)}
          icon={<HiOutlineCheckCircle className="h-5 w-5" />}
          iconColor="gold"
        />
        <StatCard
          label="Active Reports"
          value="0"
          icon={<HiOutlineExclamationTriangle className="h-5 w-5" />}
          iconColor="green"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 tracking-tight">Recent Applications</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : recentApplications.length === 0 ? (
            <p className="text-sm text-slate-500">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-brand-600">
                        {app.referenceNumber}
                      </span>
                      <ApplicationStatusBadge status={app.status} />
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {app.applicantName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(app.submittedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 tracking-tight">Recent E-Sumbong</h2>
          <p className="text-sm text-slate-500">No reports yet.</p>
        </div>
      </div>
    </div>
  );
}
