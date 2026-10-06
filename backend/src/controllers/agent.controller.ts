import { Request, Response, NextFunction } from 'express';
import { AgentService } from '../services/agent.service.js';
import { CacheService } from '../services/cache.service.js';
import { CreateAgentInput, UpdateAgentInput, AgentQueryInput } from '../validations/agent.validation.js';

export class AgentController {
  public static async createAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateAgentInput = req.body;
      const agent = await AgentService.createAgent(data);
      res.status(201).json({
        success: true,
        message: 'Delivery agent created successfully.',
        data: agent,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getAgents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = ((req as any).validatedQuery || req.query) as unknown as AgentQueryInput;
      const result = await AgentService.getAgents(query);

      res.setHeader('X-Cache', result.cached ? 'HIT' : 'MISS');
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        meta: {
          cached: result.cached,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getAgentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await AgentService.getAgentById(id);

      res.setHeader('X-Cache', result.cached ? 'HIT' : 'MISS');
      res.status(200).json({
        success: true,
        data: result.agent,
        meta: {
          cached: result.cached,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const data: UpdateAgentInput = req.body;
      const updated = await AgentService.updateAgent(id, data);

      res.status(200).json({
        success: true,
        message: 'Delivery agent updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await AgentService.deleteAgent(id);

      res.status(200).json({
        success: true,
        message: 'Delivery agent deleted successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AgentService.getAgentStats();

      res.setHeader('X-Cache', result.cached ? 'HIT' : 'MISS');
      res.status(200).json({
        success: true,
        data: result.stats,
        meta: {
          cached: result.cached,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async purgeCache(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CacheService.flushAgentCaches();
      res.status(200).json({
        success: true,
        message: 'All agent-related Redis cache keys have been purged.',
      });
    } catch (error) {
      next(error);
    }
  }
}
