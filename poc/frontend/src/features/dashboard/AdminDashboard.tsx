import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import type { Application, ApiResponse, EquipmentReservation, ReportAnalytics, Report } from '@/api/types';
import { PageHeader } from '@/components/ui';
import { StatCard } from '@/components/ui';
import { HiOutlineDocumentText, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineCalendarDays } from 'react-icons/hi2';
import { formatNumber, formatDate } from '@/lib/utils';
import { ApplicationStatusBadge } from '@/features/applications/ApplicationStatusBadge';
import { EquipmentReservationStatusBadge } from '@/features/equipment-reservations/EquipmentReservationStatusBadge';
import { ReportStatusBadge } from '@/features/e-sumbong/ReportStatusBadge';
import { ReportSeverityBadge } from '@/features/e-sumbong/ReportSeverityBadge';

interface ApplicationsMetrics {
  total: number;
  pendingReview: number;
  readyForPickup: number;
}

interface EquipmentMetrics {
  total: number;
  pendingApproval: number;
  upcomingThisWeek: number;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ApplicationsMetrics>({
    total: 0,
    pendingReview: 0,
    readyForPickup: 0,
  });
  const [equipmentMetrics, setEquipmentMetrics] = useState<EquipmentMetrics>({
    total: 0,
    pendingApproval: 0,
    upcomingThisWeek: 0,
  });
  const [reportMetrics, setReportMetrics] = useState<ReportAnalytics>({
    totalReports: 0,
    pendingReports: 0,
    resolvedThisWeek: 0,
    emergencyReports: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [recentReservations, setRecentReservations] = useState<EquipmentReservation[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          metricsRes,
          recentRes,
          equipmentMetricsRes,
          equipmentRecentRes,
          reportMetricsRes,
          recentReportsRes
        ] = await Promise.all([
          apiClient.get<ApplicationsMetrics | ApiResponse<ApplicationsMetrics>>(
            '/applications/metrics',
          ),
          apiClient.get<Application[] | ApiResponse<Application[]>>(
            '/applications/recent',
          ),
          apiClient.get<EquipmentMetrics>('/equipment-reservations/metrics'),
          apiClient.get<EquipmentReservation[]>('/equipment-reservations/recent'),
          apiClient.get<ReportAnalytics>('/e-sumbong/analytics'),
          apiClient.get<ApiResponse<Report[]>>('/e-sumbong/reports?limit=5'),
        ]);

        const metricsPayload = 'data' in metricsRes.data
          ? metricsRes.data.data
          : metricsRes.data;
        const recentPayload = 'data' in recentRes.data
          ? recentRes.data.data
          : recentRes.data;
        const equipmentRecentPayload = 'data' in equipmentRecentRes.data
          ? equipmentRecentRes.data.data
          : equipmentRecentRes.data;
        const reportsPayload = 'data' in recentReportsRes.data 
          ? recentReportsRes.data.data 
          : recentReportsRes.data;

        setMetrics(
          metricsPayload ?? { total: 0, pendingReview: 0, readyForPickup: 0 },
        );
        setRecentApplications(recentPayload ?? []);
        const equipmentMetricsPayload = 'data' in equipmentMetricsRes.data
          ? equipmentMetricsRes.data.data
          : equipmentMetricsRes.data;
        const reportMetricsPayload = 'data' in reportMetricsRes.data
          ? reportMetricsRes.data.data
          : reportMetricsRes.data;

        setEquipmentMetrics(equipmentMetricsPayload ?? { total: 0, pendingApproval: 0, upcomingThisWeek: 0 });
        setRecentReservations(Array.isArray(equipmentRecentPayload) ? equipmentRecentPayload : []);
        setReportMetrics(reportMetricsPayload ?? { totalReports: 0, pendingReports: 0, resolvedThisWeek: 0, emergencyReports: 0 });
        setRecentReports(Array.isArray(reportsPayload) ? reportsPayload : []);
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
          label="Pending Reports"
          value={loading ? '...' : formatNumber(reportMetrics.pendingReports)}
          icon={<HiOutlineExclamationTriangle className="h-5 w-5" />}
          iconColor="orange"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Reservations"
          value={loading ? '...' : formatNumber(equipmentMetrics.total)}
          icon={<HiOutlineCalendarDays className="h-5 w-5" />}
          iconColor="sky"
        />
        <StatCard
          label="Pending Approval"
          value={loading ? '...' : formatNumber(equipmentMetrics.pendingApproval)}
          icon={<HiOutlineClock className="h-5 w-5" />}
          iconColor="gold"
        />
        <StatCard
          label="Upcoming This Week"
          value={loading ? '...' : formatNumber(equipmentMetrics.upcomingThisWeek)}
          icon={<HiOutlineCalendarDays className="h-5 w-5" />}
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
          <h2 className="mb-4 text-lg font-semibold text-slate-900 tracking-tight">Recent Equipment Reservations</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : recentReservations.length === 0 ? (
            <p className="text-sm text-slate-500">No reservations yet.</p>
          ) : (
            <div className="space-y-3">
              {recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-brand-600">
                        {reservation.referenceNumber}
                      </span>
                      <EquipmentReservationStatusBadge status={reservation.status} />
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {reservation.eventName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 tracking-tight">Recent E-Sumbong Reports</h2>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : recentReports.length === 0 ? (
            <p className="text-sm text-slate-500">No reports yet.</p>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-medium text-brand-600">
                        {report.referenceNumber}
                      </span>
                      <ReportStatusBadge status={report.status} />
                      <ReportSeverityBadge severity={report.severity} />
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {report.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(report.submittedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 tracking-tight">E-Sumbong Analytics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Reports</span>
              <span className="text-lg font-semibold text-slate-900">{formatNumber(reportMetrics.totalReports)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Pending</span>
              <span className="text-lg font-semibold text-orange-600">{formatNumber(reportMetrics.pendingReports)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Resolved This Week</span>
              <span className="text-lg font-semibold text-green-600">{formatNumber(reportMetrics.resolvedThisWeek)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Emergency</span>
              <span className="text-lg font-semibold text-red-600">{formatNumber(reportMetrics.emergencyReports)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
