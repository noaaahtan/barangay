// ── Auth / User ──────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'citizen';
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
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

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
