export type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_DUTY' | 'OFF_DUTY' | 'SUSPENDED';

export type VehicleType = 'BICYCLE' | 'MOTORCYCLE' | 'CAR' | 'VAN' | 'WALKER';

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceArea: string;
  status: AgentStatus;
  vehicleType: VehicleType;
  rating: number;
  currentLoad: number;
  maxCapacity: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AgentFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AgentStatus | '';
  serviceArea?: string;
  vehicleType?: VehicleType | '';
  sortBy?: 'name' | 'createdAt' | 'rating' | 'serviceArea' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface AgentStats {
  total: number;
  byStatus: Record<string, number>;
  byArea: Record<string, number>;
  averageRating: number;
}

export interface ApiResponseMeta {
  cached: boolean;
  cacheHeader?: string;
  durationMs?: number;
}
