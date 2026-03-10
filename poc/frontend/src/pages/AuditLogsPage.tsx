import { useState, useEffect } from 'react';
import { PageHeader, SearchInput, Select, Button } from '@/components/ui';
import { AuditLogsTable } from '@/features/audit-logs/AuditLogsTable';
import { useAuditLogsApi } from '@/features/audit-logs/useAuditLogsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const entityTypeOptions = [
  { value: 'application', label: 'Applications' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'esumbong', label: 'E-Sumbong' },
];

export function AuditLogsPage() {
  const { logs, meta, loading, fetchLogs } = useAuditLogsApi();
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, entityType]);

  useEffect(() => {
    fetchLogs({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      entityType: entityType || undefined,
    });
  }, [page, debouncedSearch, entityType, fetchLogs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track who changed what and when"
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-72"
        />
        <Select
          options={entityTypeOptions}
          placeholder="All Entities"
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="w-48"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          <AuditLogsTable logs={logs} />

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm text-slate-500">
                Page {meta.page} of {meta.totalPages} — {meta.total} total logs
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
    </div>
  );
}
