import { useState, useCallback } from "react";
import apiClient from "@/api/client";
import type {
  Application,
  ApplicationsQuery,
  CreateApplicationPayload,
  UpdateApplicationStatusPayload,
  ApiResponse,
} from "@/api/types";

export function useApplicationsApi() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(
    async (query: ApplicationsQuery = {}) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query.page) params.set("page", String(query.page));
        if (query.limit) params.set("limit", String(query.limit));
        if (query.status) params.set("status", query.status);
        if (query.type) params.set("type", query.type);
        if (query.search) params.set("search", query.search);

        const { data } = await apiClient.get<ApiResponse<Application[]>>(
          `/applications?${params.toString()}`,
        );

        setApplications(data.data);
        if (data.meta) setMeta(data.meta);
      } catch {
        setError("Failed to load applications");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createApplication = useCallback(
    async (payload: CreateApplicationPayload): Promise<Application | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.post<Application>(
          "/applications",
          payload,
        );
        return data;
      } catch {
        setError("Failed to create application");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateStatus = useCallback(
    async (
      id: string,
      payload: UpdateApplicationStatusPayload,
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.patch(`/applications/${id}/status`, payload);
        return true;
      } catch {
        setError("Failed to update application status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateApplication = useCallback(
    async (id: string, payload: Partial<Application>): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.patch(`/applications/${id}`, payload);
        return true;
      } catch {
        setError("Failed to update application");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const cancelApplication = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.delete(`/applications/${id}`);
        return true;
      } catch {
        setError("Failed to cancel application");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    applications,
    meta,
    loading,
    error,
    fetchApplications,
    createApplication,
    updateStatus,
    updateApplication,
    cancelApplication,
  };
}
