// ── Auth / User ──────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
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

// ── Category ──────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  name?: string;
}

// ── Item ──────────────────────────────────────────────────
export interface Item {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  width: number | null;
  height: number | null;
  sizeUnit: string;
  imageUrl: string | null;
  categoryId: string | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemPayload {
  name: string;
  sku: string;
  description?: string;
  quantity?: number;
  price?: number;
  lowStockThreshold?: number;
  width?: number;
  height?: number;
  sizeUnit?: string;
  imageUrl?: string;
  categoryId?: string;
}

export interface UpdateItemPayload {
  name?: string;
  sku?: string;
  description?: string;
  quantity?: number;
  price?: number;
  lowStockThreshold?: number;
  width?: number;
  height?: number;
  sizeUnit?: string;
  imageUrl?: string;
  categoryId?: string;
}

export interface AdjustStockPayload {
  quantityChange: number;
  reason: string;
}

export interface ItemsQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

// ── Stock History ─────────────────────────────────────────
export interface StockHistoryEntry {
  id: string;
  itemId: string;
  quantityChange: number;
  quantityAfter: number;
  reason: string;
  createdAt: string;
  item?: Item;
}

// ── Stats ─────────────────────────────────────────────────
export interface InventoryStats {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
  totalCategories: number;
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
