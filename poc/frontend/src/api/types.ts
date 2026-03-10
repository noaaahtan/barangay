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
export type ApplicationType =
  | "BARANGAY_CLEARANCE"
  | "CERTIFICATE_OF_RESIDENCY"
  | "BUSINESS_PERMIT"
  | "INDIGENCY_CERTIFICATE"
  | "CEDULA";

export const ApplicationType = {
  BARANGAY_CLEARANCE: "BARANGAY_CLEARANCE" as const,
  CERTIFICATE_OF_RESIDENCY: "CERTIFICATE_OF_RESIDENCY" as const,
  BUSINESS_PERMIT: "BUSINESS_PERMIT" as const,
  INDIGENCY_CERTIFICATE: "INDIGENCY_CERTIFICATE" as const,
  CEDULA: "CEDULA" as const,
};

export type ApplicationStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED";

export const ApplicationStatus = {
  SUBMITTED: "SUBMITTED" as const,
  APPROVED: "APPROVED" as const,
  REJECTED: "REJECTED" as const,
  READY_FOR_PICKUP: "READY_FOR_PICKUP" as const,
  COMPLETED: "COMPLETED" as const,
  CANCELLED: "CANCELLED" as const,
};

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

// ── Equipment Reservations ──────────────────────────────
export type EquipmentType =
  | "CHAIR"
  | "TABLE"
  | "TENT"
  | "SOUND_SYSTEM"
  | "LIGHTS"
  | "STAGE_PANEL";

export const EquipmentType = {
  CHAIR: "CHAIR" as const,
  TABLE: "TABLE" as const,
  TENT: "TENT" as const,
  SOUND_SYSTEM: "SOUND_SYSTEM" as const,
  LIGHTS: "LIGHTS" as const,
  STAGE_PANEL: "STAGE_PANEL" as const,
};

export type EventType =
  | "BIRTHDAY"
  | "WEDDING"
  | "BURIAL"
  | "COMMUNITY_EVENT"
  | "SPORTS_EVENT"
  | "MEETING"
  | "OTHER";

export const EventType = {
  BIRTHDAY: "BIRTHDAY" as const,
  WEDDING: "WEDDING" as const,
  BURIAL: "BURIAL" as const,
  COMMUNITY_EVENT: "COMMUNITY_EVENT" as const,
  SPORTS_EVENT: "SPORTS_EVENT" as const,
  MEETING: "MEETING" as const,
  OTHER: "OTHER" as const,
};

export type EquipmentReservationStatus =
  | "SUBMITTED"
  | "FOR_DELIVERY"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export const EquipmentReservationStatus = {
  SUBMITTED: "SUBMITTED" as const,
  FOR_DELIVERY: "FOR_DELIVERY" as const,
  COMPLETED: "COMPLETED" as const,
  REJECTED: "REJECTED" as const,
  CANCELLED: "CANCELLED" as const,
};

export interface EquipmentReservationItem {
  type: EquipmentType;
  quantity: number;
}

export interface EquipmentItem {
  id: string;
  type: EquipmentType;
  name: string;
  quantityTotal: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentReservation {
  id: string;
  referenceNumber: string;
  status: EquipmentReservationStatus;
  eventType: EventType;
  eventName: string;
  eventLocation: string;
  startDate: string;
  endDate: string;
  requestedItems: EquipmentReservationItem[];
  approvedItems: EquipmentReservationItem[] | null;
  notes: string | null;
  userId: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  fulfilledAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  reviewer?: User | null;
}

export interface EquipmentAvailability {
  type: EquipmentType;
  total: number;
  reserved: number;
  available: number;
}

export interface EquipmentReservationsQuery {
  page?: number;
  limit?: number;
  status?: EquipmentReservationStatus;
  search?: string;
}

export interface CreateEquipmentReservationPayload {
  eventType: EventType;
  eventName: string;
  eventLocation: string;
  startDate: string;
  endDate: string;
  requestedItems: EquipmentReservationItem[];
}

export interface UpdateReservationStatusPayload {
  status: EquipmentReservationStatus;
  approvedItems?: EquipmentReservationItem[];
  notes?: string;
}

export interface UpdateEquipmentReservationPayload {
  eventName?: string;
  eventLocation?: string;
  startDate?: string;
  endDate?: string;
  requestedItems?: EquipmentReservationItem[];
  notes?: string;
}

export interface CreateEquipmentItemPayload {
  type: EquipmentType;
  name: string;
  quantityTotal: number;
}

export interface UpdateEquipmentItemPayload {
  name?: string;
  quantityTotal?: number;
}

// ── E-Sumbong (Reports) ──────────────────────────────────
export type ReportType =
  | "CRIME"
  | "NOISE_COMPLAINT"
  | "PUBLIC_SAFETY"
  | "INFRASTRUCTURE"
  | "HEALTH_HAZARD"
  | "STRAY_ANIMALS"
  | "ILLEGAL_ACTIVITY"
  | "ENVIRONMENTAL"
  | "OTHER";

export const ReportType = {
  CRIME: "CRIME" as const,
  NOISE_COMPLAINT: "NOISE_COMPLAINT" as const,
  PUBLIC_SAFETY: "PUBLIC_SAFETY" as const,
  INFRASTRUCTURE: "INFRASTRUCTURE" as const,
  HEALTH_HAZARD: "HEALTH_HAZARD" as const,
  STRAY_ANIMALS: "STRAY_ANIMALS" as const,
  ILLEGAL_ACTIVITY: "ILLEGAL_ACTIVITY" as const,
  ENVIRONMENTAL: "ENVIRONMENTAL" as const,
  OTHER: "OTHER" as const,
};

export type ReportStatus =
  | "SUBMITTED"
  | "ACKNOWLEDGED"
  | "INVESTIGATING"
  | "RESOLVED"
  | "CLOSED"
  | "DISMISSED";

export const ReportStatus = {
  SUBMITTED: "SUBMITTED" as const,
  ACKNOWLEDGED: "ACKNOWLEDGED" as const,
  INVESTIGATING: "INVESTIGATING" as const,
  RESOLVED: "RESOLVED" as const,
  CLOSED: "CLOSED" as const,
  DISMISSED: "DISMISSED" as const,
};

export type ReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

export const ReportSeverity = {
  LOW: "LOW" as const,
  MEDIUM: "MEDIUM" as const,
  HIGH: "HIGH" as const,
  EMERGENCY: "EMERGENCY" as const,
};

export interface Report {
  id: string;
  referenceNumber: string;
  type: ReportType;
  severity: ReportSeverity;
  status: ReportStatus;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  locationAddress?: string;
  isAnonymous: boolean;
  photoUrls: string[];
  userId: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolvedAt?: string;
  resolutionDetails?: string;
  submittedAt: string;
  lastUpdatedAt: string;
  user?: User;
  reviewer?: User;
}

export interface ReportResponse {
  id: string;
  reportId: string;
  responderId: string;
  responseText: string;
  createdAt: string;
  responder?: User;
}

export interface CreateReportPayload {
  type: ReportType;
  severity: ReportSeverity;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  locationAddress?: string;
  isAnonymous?: boolean;
  photoUrls?: string[];
}

export interface UpdateReportStatusPayload {
  status: ReportStatus;
  notes?: string;
}

export interface AddResponsePayload {
  responseText: string;
}

export interface ResolveReportPayload {
  resolutionDetails: string;
}

export interface ReportsQuery {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  bounds?: string;
}

export interface ReportAnalytics {
  totalReports: number;
  pendingReports: number;
  resolvedThisWeek: number;
  emergencyReports: number;
}
