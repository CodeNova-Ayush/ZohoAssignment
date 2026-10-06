import { Router } from 'express';
import { agentRouter } from './agent.routes.js';
import { healthRouter } from './health.routes.js';

export const apiRouter = Router();

apiRouter.use('/agents', agentRouter);
apiRouter.use('/health', healthRouter);
