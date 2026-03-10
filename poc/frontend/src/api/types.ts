// ── Auth / User ──────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "citizen";
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

// ── Audit Logs ───────────────────────────────────────────
export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityName: string;
  userId: string;
  details: string | null;
  createdAt: string;
  user: User;
}

export interface AuditLogsQuery {
  page?: number;
  limit?: number;
  entityType?: string;
  search?: string;
}

// ── API Response Wrappers ─────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Applications ──────────────────────────────────────────
export enum ApplicationType {
  BARANGAY_CLEARANCE = "BARANGAY_CLEARANCE",
  CERTIFICATE_OF_RESIDENCY = "CERTIFICATE_OF_RESIDENCY",
  BUSINESS_PERMIT = "BUSINESS_PERMIT",
  INDIGENCY_CERTIFICATE = "INDIGENCY_CERTIFICATE",
  CEDULA = "CEDULA",
}

export enum ApplicationStatus {
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface Application {
  id: string;
  referenceNumber: string;
  type: ApplicationType;
  status: ApplicationStatus;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  purpose: string;
  notes: string | null;
  userId: string;
  reviewedBy: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  reviewer?: User;
}

export interface CreateApplicationPayload {
  type: ApplicationType;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  purpose: string;
}

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
  notes?: string;
}

export interface ApplicationsQuery {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  type?: ApplicationType;
  search?: string;
}
