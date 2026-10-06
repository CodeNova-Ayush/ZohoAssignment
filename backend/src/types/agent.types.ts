import { AgentStatus, VehicleType } from '@prisma/client';

export interface CreateAgentDTO {
  name: string;
  phone: string;
  email: string;
  serviceArea: string;
  status?: AgentStatus;
  vehicleType?: VehicleType;
  rating?: number;
  currentLoad?: number;
  maxCapacity?: number;
  notes?: string | null;
}

export interface UpdateAgentDTO {
  name?: string;
  phone?: string;
  email?: string;
  serviceArea?: string;
  status?: AgentStatus;
  vehicleType?: VehicleType;
  rating?: number;
  currentLoad?: number;
  maxCapacity?: number;
  notes?: string | null;
}

export interface AgentQueryFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: AgentStatus;
  serviceArea?: string;
  vehicleType?: VehicleType;
  sortBy?: 'name' | 'createdAt' | 'rating' | 'serviceArea' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  cached: boolean;
}

export interface AgentStatsSummary {
  total: number;
  byStatus: Record<string, number>;
  byArea: Record<string, number>;
  averageRating: number;
}
