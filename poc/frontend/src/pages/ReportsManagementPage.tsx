import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, Card } from '@/components/ui';
import { ReportsMap } from '@/components/Map/ReportsMap';
import { ReportCard } from '@/features/e-sumbong/ReportCard';
import { useESumbongApi } from '@/features/e-sumbong/useESumbongApi';
import { HiMap, HiListBullet } from 'react-icons/hi2';
import type { Report } from '@/api/types';

export function ReportsManagementPage() {
  const navigate = useNavigate();
  const {
    reports,
    analytics,
    loading,
    fetchReports,
    fetchAnalytics,
  } = useESumbongApi();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [filters, setFilters] = useState<{
    status?: string;
    type?: string;
    severity?: string;
  }>({});

  useEffect(() => {
    fetchReports({ page: 1, limit: 100, ...filters });
    fetchAnalytics();
  }, [filters, fetchReports, fetchAnalytics]);

  const handleViewDetails = (report: Report) => {
    navigate(`/e-sumbong/reports/${report.id}`);
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

    </div>
  );
}
