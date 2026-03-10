import { useState, useCallback } from "react";
import apiClient from "@/api/client";
import type {
  Report,
  ReportResponse,
  ReportsQuery,
  CreateReportPayload,
  UpdateReportStatusPayload,
  AddResponsePayload,
  ResolveReportPayload,
  ReportAnalytics,
  ApiResponse,
} from "@/api/types";

export function useESumbongApi() {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [responses, setResponses] = useState<ReportResponse[]>([]);
  const [analytics, setAnalytics] = useState<ReportAnalytics | null>(null);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async (query: ReportsQuery = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.page) params.set("page", String(query.page));
      if (query.limit) params.set("limit", String(query.limit));
      if (query.status) params.set("status", query.status);
      if (query.type) params.set("type", query.type);
      if (query.severity) params.set("severity", query.severity);
      if (query.startDate) params.set("startDate", query.startDate);
      if (query.endDate) params.set("endDate", query.endDate);
      if (query.bounds) params.set("bounds", query.bounds);

      const { data } = await apiClient.get<ApiResponse<Report[]>>(
        `/e-sumbong/reports?${params.toString()}`,
      );

      setReports(data.data);
      if (data.meta) setMeta(data.meta);
    } catch {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReportById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<
        | ApiResponse<{ report: Report; responses: ReportResponse[] }>
        | {
            report: Report;
            responses: ReportResponse[];
          }
      >(`/e-sumbong/reports/${id}`);

      const payload = "data" in data ? data.data : data;
      setCurrentReport(payload.report);
      setResponses(payload.responses);
      return payload;
    } catch {
      setError("Failed to load report");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(
    async (payload: CreateReportPayload): Promise<Report | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.post<ApiResponse<Report> | Report>(
          "/e-sumbong/reports",
          payload,
        );
        return "data" in data ? data.data : data;
      } catch {
        setError("Failed to create report");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateReportStatus = useCallback(
    async (
      id: string,
      payload: UpdateReportStatusPayload,
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.patch(`/e-sumbong/reports/${id}/status`, payload);
        return true;
      } catch {
        setError("Failed to update report status");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const addResponse = useCallback(
    async (reportId: string, payload: AddResponsePayload): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.post<
          ApiResponse<ReportResponse> | ReportResponse
        >(`/e-sumbong/reports/${reportId}/responses`, payload);
        const responsePayload = "data" in data ? data.data : data;
        setResponses((prev) => [...prev, responsePayload]);
        return true;
      } catch {
        setError("Failed to add response");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const resolveReport = useCallback(
    async (id: string, payload: ResolveReportPayload): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await apiClient.patch(`/e-sumbong/reports/${id}/resolve`, payload);
        return true;
      } catch {
        setError("Failed to resolve report");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteReport = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/e-sumbong/reports/${id}`);
      return true;
    } catch {
      setError("Failed to delete report");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<
        ApiResponse<ReportAnalytics> | ReportAnalytics
      >("/e-sumbong/analytics");
      setAnalytics("data" in data ? data.data : data);
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadPhotos = useCallback(
    async (files: File[]): Promise<string[] | null> => {
      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const { data } = await apiClient.post<
          ApiResponse<{ urls: string[] }> | { urls: string[] }
        >("/e-sumbong/upload-photos", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const payload = "data" in data ? data.data : data;
        return payload.urls;
      } catch {
        setError("Failed to upload photos");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    reports,
    currentReport,
    responses,
    analytics,
    meta,
    loading,
    error,
    fetchReports,
    fetchReportById,
    createReport,
    updateReportStatus,
    addResponse,
    resolveReport,
    deleteReport,
    fetchAnalytics,
    uploadPhotos,
  };
}
