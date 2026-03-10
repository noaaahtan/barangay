import { useState, useEffect, useCallback } from 'react';
import apiClient, { API_URL } from '@/api/client';
import type {
  Item,
  CreateItemPayload,
  UpdateItemPayload,
  AdjustStockPayload,
  ItemsQuery,
  ApiResponse,
  PaginationMeta,
} from '@/api/types';

/** Build the full URL for an item image */
export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_URL}${imageUrl}`;
}

export function useItemsApi(initialQuery?: ItemsQuery) {
  const [items, setItems] = useState<Item[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<ItemsQuery>(initialQuery || { page: 1, limit: 20 });

  const fetchItems = useCallback(async (q?: ItemsQuery) => {
    const params = q || query;
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<{ data: Item[]; meta: PaginationMeta }>('/items', { params });
      setItems(res.data.data);
      setMeta(res.data.meta);
    } catch {
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = async (payload: CreateItemPayload): Promise<Item> => {
    const res = await apiClient.post<ApiResponse<Item>>('/items', payload);
    await fetchItems();
    return res.data.data;
  };

  const updateItem = async (id: string, payload: UpdateItemPayload): Promise<Item> => {
    const res = await apiClient.patch<ApiResponse<Item>>(`/items/${id}`, payload);
    await fetchItems();
    return res.data.data;
  };

  const deleteItem = async (id: string): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
    await fetchItems();
  };

  const adjustStock = async (id: string, payload: AdjustStockPayload): Promise<Item> => {
    const res = await apiClient.post<ApiResponse<Item>>(`/items/${id}/adjust-stock`, payload);
    await fetchItems();
    return res.data.data;
  };

  // --- Image upload disabled (no storage bucket configured) ---
  // const uploadImage = async (id: string, file: File): Promise<Item> => {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   const res = await apiClient.post<ApiResponse<Item>>(`/items/${id}/upload-image`, formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' },
  //   });
  //   await fetchItems();
  //   return res.data.data;
  // };

  return {
    items,
    meta,
    loading,
    error,
    query,
    setQuery,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    adjustStock,
  };
}
