import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload, ApiResponse } from '@/api/types';

export function useCategoriesApi() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
      setCategories(res.data.data);
    } catch {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
    const res = await apiClient.post<ApiResponse<Category>>('/categories', payload);
    await fetchCategories();
    return res.data.data;
  };

  const updateCategory = async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
    const res = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, payload);
    await fetchCategories();
    return res.data.data;
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
    await fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
