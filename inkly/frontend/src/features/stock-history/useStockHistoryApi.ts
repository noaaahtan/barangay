import { useState, useCallback } from 'react';
import apiClient from '@/api/client';
import type { StockHistoryEntry, Item, ApiResponse } from '@/api/types';

export function useStockHistoryApi() {
  const [history, setHistory] = useState<StockHistoryEntry[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: Item[] }>('/items', { params: { limit: 100 } });
      setItems(res.data.data);
    } catch {
      // fail silently
    }
  }, []);

  const fetchHistory = useCallback(async (itemId: string) => {
    if (!itemId) {
      setHistory([]);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get<ApiResponse<StockHistoryEntry[]>>(`/stock-history/${itemId}`);
      setHistory(res.data.data);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectItem = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
    fetchHistory(itemId);
  }, [fetchHistory]);

  return { history, items, selectedItemId, loading, fetchItems, selectItem };
}
