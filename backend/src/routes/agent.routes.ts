import { Router } from 'express';
import { AgentController } from '../controllers/agent.controller.js';
import { validateBody, validateQuery } from '../middlewares/validate.js';
import {
  createAgentSchema,
  updateAgentSchema,
  agentQuerySchema,
} from '../validations/agent.validation.js';

export const agentRouter = Router();

// Cache management
agentRouter.post('/cache/purge', AgentController.purgeCache);

// Fleet analytics & statistics
agentRouter.get('/stats/summary', AgentController.getStats);

// Agent CRUD routes
agentRouter.post('/', validateBody(createAgentSchema), AgentController.createAgent);
agentRouter.get('/', validateQuery(agentQuerySchema), AgentController.getAgents);
agentRouter.get('/:id', AgentController.getAgentById);
agentRouter.put('/:id', validateBody(updateAgentSchema), AgentController.updateAgent);
agentRouter.delete('/:id', AgentController.deleteAgent);
