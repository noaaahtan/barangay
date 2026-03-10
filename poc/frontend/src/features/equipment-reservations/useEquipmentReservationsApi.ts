import { useCallback, useState } from "react";
import apiClient from "@/api/client";
import type {
  ApiResponse,
  EquipmentAvailability,
  EquipmentReservation,
  EquipmentReservationsQuery,
  CreateEquipmentReservationPayload,
  UpdateReservationStatusPayload,
  UpdateEquipmentReservationPayload,
} from "@/api/types";

export function useEquipmentReservationsApi() {
  const [reservations, setReservations] = useState<EquipmentReservation[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(
    async (query: EquipmentReservationsQuery = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query.page) params.set("page", String(query.page));
        if (query.limit) params.set("limit", String(query.limit));
        if (query.status) params.set("status", query.status);
        if (query.search) params.set("search", query.search);

        const { data } = await apiClient.get<
          ApiResponse<EquipmentReservation[]>
        >(`/equipment-reservations?${params.toString()}`);
        setReservations(data.data);
        if (data.meta) setMeta(data.meta);
      } catch {
        setError("Failed to load reservations");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createReservation = useCallback(
    async (payload: CreateEquipmentReservationPayload) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.post<EquipmentReservation>(
          "/equipment-reservations",
          payload,
        );
        return data;
      } catch {
        setError("Failed to create reservation");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createBlock = useCallback(
    async (payload: CreateEquipmentReservationPayload) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.post<EquipmentReservation>(
          "/equipment-reservations/block",
          payload,
        );
        return data;
      } catch {
        setError("Failed to block equipment");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateStatus = useCallback(
    async (id: string, payload: UpdateReservationStatusPayload) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.patch(`/equipment-reservations/${id}/status`, payload);
        return true;
      } catch {
        setError("Failed to update reservation status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateReservation = useCallback(
    async (id: string, payload: UpdateEquipmentReservationPayload) => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.patch(`/equipment-reservations/${id}`, payload);
        return true;
      } catch {
        setError("Failed to update reservation");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const cancelReservation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/equipment-reservations/${id}`);
      return true;
    } catch {
      setError("Failed to cancel reservation");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailability = useCallback(
    async (startDate: string, endDate: string) => {
      try {
        const { data } = await apiClient.get<EquipmentAvailability[]>(
          `/equipment/availability?startDate=${startDate}&endDate=${endDate}`,
        );
        return data;
      } catch {
        setError("Failed to fetch availability");
        return [] as EquipmentAvailability[];
      }
    },
    [],
  );

  const fetchMetrics = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{
        total: number;
        pendingApproval: number;
        upcomingThisWeek: number;
      }>("/equipment-reservations/metrics");
      return data;
    } catch {
      setError("Failed to fetch equipment metrics");
      return null;
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    try {
      const { data } = await apiClient.get<EquipmentReservation[]>(
        "/equipment-reservations/recent",
      );
      return data;
    } catch {
      setError("Failed to fetch recent reservations");
      return [] as EquipmentReservation[];
    }
  }, []);

  return {
    reservations,
    meta,
    loading,
    error,
    fetchReservations,
    createReservation,
    createBlock,
    updateStatus,
    updateReservation,
    cancelReservation,
    fetchAvailability,
    fetchMetrics,
    fetchRecent,
  };
}
