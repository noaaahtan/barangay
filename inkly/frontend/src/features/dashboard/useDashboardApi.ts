import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import type { InventoryStats, StockHistoryEntry, ApiResponse } from '@/api/types';

export function useDashboardApi() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<StockHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        apiClient.get<ApiResponse<InventoryStats>>('/items/stats'),
        apiClient.get<ApiResponse<StockHistoryEntry[]>>('/stock-history/recent?limit=10'),
      ]);
      setStats(statsRes.data.data);
      setRecentActivity(activityRes.data.data);
    } catch {
      // Dashboard is non-critical — fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { stats, recentActivity, loading, refresh: fetchDashboard };
}
