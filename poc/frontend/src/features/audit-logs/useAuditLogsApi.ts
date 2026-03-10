import { useState, useCallback } from 'react';
import apiClient from '@/api/client';
import type { AuditLog, AuditLogsQuery, ApiResponse } from '@/api/types';

export function useAuditLogsApi() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (query: AuditLogsQuery = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.page) params.set('page', String(query.page));
      if (query.limit) params.set('limit', String(query.limit));
      if (query.entityType) params.set('entityType', query.entityType);
      if (query.search) params.set('search', query.search);

      const { data } = await apiClient.get<ApiResponse<AuditLog[]>>(
        `/audit-logs?${params.toString()}`,
      );

      setLogs(data.data);
      if (data.meta) setMeta(data.meta);
    } catch {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, meta, loading, error, fetchLogs };
}
