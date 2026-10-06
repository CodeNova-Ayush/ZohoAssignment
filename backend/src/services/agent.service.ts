import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { CacheService } from './cache.service.js';
import {
  CreateAgentDTO,
  UpdateAgentDTO,
  AgentQueryFilter,
  PaginatedResult,
  AgentStatsSummary,
} from '../types/agent.types.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

export class AgentService {
  /**
   * Creates a new delivery agent, saves to PostgreSQL, and invalidates cache.
   */
  public static async createAgent(data: CreateAgentDTO) {
    // Check duplicate email
    const existingEmail = await prisma.deliveryAgent.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new ConflictError(`An agent with email "${data.email}" already exists.`);
    }

    // Check duplicate phone
    const existingPhone = await prisma.deliveryAgent.findUnique({
      where: { phone: data.phone },
    });
    if (existingPhone) {
      throw new ConflictError(`An agent with phone number "${data.phone}" already exists.`);
    }

    const agent = await prisma.deliveryAgent.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        serviceArea: data.serviceArea,
        status: data.status,
        vehicleType: data.vehicleType,
        rating: data.rating,
        currentLoad: data.currentLoad,
        maxCapacity: data.maxCapacity,
        notes: data.notes,
      },
    });

    // Invalidate list & stats cache so fresh data is visible immediately
    await CacheService.onAgentCreated();

    return agent;
  }

  /**
   * Retrieves a paginated and filtered list of delivery agents.
   * Checks Redis cache first before querying PostgreSQL.
   */
  public static async getAgents(filter: AgentQueryFilter): Promise<PaginatedResult<any>> {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const skip = (page - 1) * limit;

    const cacheKey = CacheService.buildListKey({
      page,
      limit,
      search: filter.search || '',
      status: filter.status || '',
      serviceArea: filter.serviceArea || '',
      vehicleType: filter.vehicleType || '',
      sortBy: filter.sortBy || 'createdAt',
      sortOrder: filter.sortOrder || 'desc',
    });

    // Try Redis cache
    const cachedData = await CacheService.get<PaginatedResult<any>>(cacheKey);
    if (cachedData) {
      return {
        ...cachedData,
        cached: true,
      };
    }

    // Build Prisma query filters
    const where: Prisma.DeliveryAgentWhereInput = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.vehicleType) {
      where.vehicleType = filter.vehicleType;
    }

    if (filter.serviceArea) {
      where.serviceArea = {
        contains: filter.serviceArea,
        mode: 'insensitive',
      };
    }

    if (filter.search) {
      const search = filter.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { serviceArea: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Determine sort
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';
    const orderBy: Prisma.DeliveryAgentOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [agents, total] = await Promise.all([
      prisma.deliveryAgent.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.deliveryAgent.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const result: PaginatedResult<any> = {
      data: agents,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      cached: false,
    };

    // Store in cache (cache object with cached: false)
    await CacheService.set(cacheKey, result);

    return result;
  }

  /**
   * Retrieves an individual delivery agent by ID.
   * Checks Redis cache first.
   */
  public static async getAgentById(id: string) {
    const cacheKey = CacheService.buildAgentKey(id);

    // Check Redis
    const cachedAgent = await CacheService.get<any>(cacheKey);
    if (cachedAgent) {
      return {
        agent: cachedAgent,
        cached: true,
      };
    }

    const agent = await prisma.deliveryAgent.findUnique({
      where: { id },
    });

    if (!agent) {
      throw new NotFoundError(`Delivery agent with ID "${id}" was not found.`);
    }

    // Cache the agent
    await CacheService.set(cacheKey, agent);

    return {
      agent,
      cached: false,
    };
  }

  /**
   * Updates an existing delivery agent and refreshes cache consistency.
   */
  public static async updateAgent(id: string, data: UpdateAgentDTO) {
    // Verify existence
    const existing = await prisma.deliveryAgent.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Delivery agent with ID "${id}" was not found.`);
    }

    // Check email conflict if changing
    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.deliveryAgent.findUnique({
        where: { email: data.email },
      });
      if (emailTaken) {
        throw new ConflictError(`Email "${data.email}" is already used by another agent.`);
      }
    }

    // Check phone conflict if changing
    if (data.phone && data.phone !== existing.phone) {
      const phoneTaken = await prisma.deliveryAgent.findUnique({
        where: { phone: data.phone },
      });
      if (phoneTaken) {
        throw new ConflictError(`Phone "${data.phone}" is already used by another agent.`);
      }
    }

    const updated = await prisma.deliveryAgent.update({
      where: { id },
      data: {
        ...data,
      },
    });

    // Invalidate individual agent cache and all list caches
    await CacheService.onAgentUpdated(id);

    return updated;
  }

  /**
   * Deletes a delivery agent and invalidates cache.
   */
  public static async deleteAgent(id: string) {
    const existing = await prisma.deliveryAgent.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Delivery agent with ID "${id}" was not found.`);
    }

    await prisma.deliveryAgent.delete({
      where: { id },
    });

    // Invalidate cached records
    await CacheService.onAgentDeleted(id);

    return {
      id: existing.id,
      name: existing.name,
      deleted: true,
    };
  }

  /**
   * Computes analytical fleet summary stats, cached for high performance.
   */
  public static async getAgentStats(): Promise<{ stats: AgentStatsSummary; cached: boolean }> {
    const cacheKey = CacheService.getStatsKey();
    const cachedStats = await CacheService.get<AgentStatsSummary>(cacheKey);

    if (cachedStats) {
      return { stats: cachedStats, cached: true };
    }

    const [total, agents] = await Promise.all([
      prisma.deliveryAgent.count(),
      prisma.deliveryAgent.findMany({
        select: {
          status: true,
          serviceArea: true,
          rating: true,
        },
      }),
    ]);

    const byStatus: Record<string, number> = {};
    const byArea: Record<string, number> = {};
    let ratingSum = 0;

    for (const a of agents) {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
      byArea[a.serviceArea] = (byArea[a.serviceArea] || 0) + 1;
      ratingSum += a.rating;
    }

    const averageRating = agents.length > 0 ? Number((ratingSum / agents.length).toFixed(2)) : 5.0;

    const stats: AgentStatsSummary = {
      total,
      byStatus,
      byArea,
      averageRating,
    };

    await CacheService.set(cacheKey, stats, 300);

    return { stats, cached: false };
  }
}
