import { DeliveryAgent, PaginationMeta, AgentFilterParams, AgentStats, ApiResponseMeta } from '../types';

const API_BASE = '/api';

export class ApiError extends Error {
  public details?: any;
  public status?: number;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

interface ApiResponse<T> {
  data: T;
  pagination?: PaginationMeta;
  meta: ApiResponseMeta;
}

async function handleResponse<T>(res: Response, startTime: number): Promise<ApiResponse<T>> {
  const durationMs = Date.now() - startTime;
  const cacheHeader = res.headers.get('X-Cache') || 'NONE';

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = json.error?.message || json.message || `Request failed with status ${res.status}`;
    throw new ApiError(errorMsg, res.status, json.error?.details);
  }

  return {
    data: json.data !== undefined ? json.data : json,
    pagination: json.pagination,
    meta: {
      cached: json.meta?.cached ?? (cacheHeader === 'HIT'),
      cacheHeader,
      durationMs,
    },
  };
}

export const agentApi = {
  async getAgents(params: AgentFilterParams = {}): Promise<{
    data: DeliveryAgent[];
    pagination: PaginationMeta;
    meta: ApiResponseMeta;
  }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.serviceArea) query.set('serviceArea', params.serviceArea);
    if (params.vehicleType) query.set('vehicleType', params.vehicleType);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const startTime = Date.now();
    const res = await fetch(`${API_BASE}/agents?${query.toString()}`);
    const result = await handleResponse<DeliveryAgent[]>(res, startTime);

    return {
      data: result.data || [],
      pagination: result.pagination || {
        total: (result.data || []).length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      meta: result.meta,
    };
  },

  async getAgentById(id: string): Promise<{ data: DeliveryAgent; meta: ApiResponseMeta }> {
    const startTime = Date.now();
    const res = await fetch(`${API_BASE}/agents/${id}`);
    const result = await handleResponse<DeliveryAgent>(res, startTime);
    return {
      data: result.data,
      meta: result.meta,
    };
  },

  async createAgent(payload: Partial<DeliveryAgent>): Promise<{ data: DeliveryAgent }> {
    const startTime = Date.now();
    const res = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await handleResponse<DeliveryAgent>(res, startTime);
    return { data: result.data };
  },

  async updateAgent(id: string, payload: Partial<DeliveryAgent>): Promise<{ data: DeliveryAgent }> {
    const startTime = Date.now();
    const res = await fetch(`${API_BASE}/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await handleResponse<DeliveryAgent>(res, startTime);
    return { data: result.data };
  },

  async deleteAgent(id: string): Promise<{ data: { id: string; deleted: boolean } }> {
    const startTime = Date.now();
    const res = await fetch(`${API_BASE}/agents/${id}`, {
      method: 'DELETE',
    });
    const result = await handleResponse<{ id: string; deleted: boolean }>(res, startTime);
    return { data: result.data };
  },

  async getStats(): Promise<{ data: AgentStats; meta: ApiResponseMeta }> {
    const startTime = Date.now();
    const res = await fetch(`${API_BASE}/agents/stats/summary`);
    const result = await handleResponse<AgentStats>(res, startTime);
    return {
      data: result.data,
      meta: result.meta,
    };
  },

  async purgeCache(): Promise<void> {
    const res = await fetch(`${API_BASE}/agents/cache/purge`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new ApiError('Failed to purge Redis cache', res.status);
    }
  },

  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },
};
