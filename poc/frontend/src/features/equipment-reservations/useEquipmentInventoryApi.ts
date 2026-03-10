import { useCallback, useState } from "react";
import apiClient from "@/api/client";
import type {
  EquipmentItem,
  CreateEquipmentItemPayload,
  UpdateEquipmentItemPayload,
  ApiResponse,
} from "@/api/types";

export function useEquipmentInventoryApi() {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<
        EquipmentItem[] | ApiResponse<EquipmentItem[]>
      >("/equipment");
      const itemsData = "data" in data ? data.data : data;
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch {
      setError("Failed to load equipment inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(
    async (payload: CreateEquipmentItemPayload) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.post<EquipmentItem>(
          "/equipment",
          payload,
        );
        return data;
      } catch {
        setError("Failed to create equipment item");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateItem = useCallback(
    async (id: string, payload: UpdateEquipmentItemPayload) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.patch<EquipmentItem>(
          `/equipment/${id}`,
          payload,
        );
        return data;
      } catch {
        setError("Failed to update equipment item");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deactivateItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/equipment/${id}`);
      return true;
    } catch {
      setError("Failed to deactivate equipment item");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deactivateItem,
  };
}
