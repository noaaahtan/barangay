import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button } from '@/components/ui';
import { ReportCard } from '@/features/e-sumbong/ReportCard';
import { useESumbongApi } from '@/features/e-sumbong/useESumbongApi';
import { HiPlus, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import type { Report } from '@/api/types';

export function MyReportsPage() {
  const { reports, meta, loading, fetchReports } =
    useESumbongApi();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReports({ page, limit: 20 });
  }, [page, fetchReports]);

  const handleViewDetails = (report: Report) => {
    navigate(`/e-sumbong/reports/${report.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reports"
        description="Track your submitted reports and responses"
        action={
          <Button onClick={() => navigate('/e-sumbong/submit')}>
            <HiPlus className="h-4 w-4" />
            Submit New Report
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">You haven't submitted any reports yet.</p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => navigate('/e-sumbong/submit')}
          >
            Submit Your First Report
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
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
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <HiChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === meta.totalPages}
                >
                  <HiChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
