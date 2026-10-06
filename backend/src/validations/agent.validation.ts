import { z } from 'zod';
import { AgentStatus, VehicleType } from '@prisma/client';

export const phoneRegex = /^\+?[0-9\s\-().]{7,25}$/;

export const createAgentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Invalid phone number format. Examples: +1-202-555-0143 or +44 7911 123456'),
  email: z
    .string()
    .trim()
    .email('Invalid email address format')
    .max(120, 'Email must not exceed 120 characters')
    .toLowerCase(),
  serviceArea: z
    .string()
    .trim()
    .min(2, 'Service area must be at least 2 characters')
    .max(100, 'Service area must not exceed 100 characters'),
  status: z.nativeEnum(AgentStatus).optional().default(AgentStatus.ACTIVE),
  vehicleType: z.nativeEnum(VehicleType).optional().default(VehicleType.MOTORCYCLE),
  rating: z
    .number()
    .min(1.0, 'Rating must be at least 1.0')
    .max(5.0, 'Rating cannot exceed 5.0')
    .optional()
    .default(5.0),
  currentLoad: z
    .number()
    .int('Current load must be an integer')
    .min(0, 'Current load cannot be negative')
    .optional()
    .default(0),
  maxCapacity: z
    .number()
    .int('Max capacity must be an integer')
    .min(1, 'Max capacity must be at least 1')
    .max(100, 'Max capacity cannot exceed 100')
    .optional()
    .default(10),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
});

export const updateAgentSchema = createAgentSchema.partial();

export const agentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  status: z.nativeEnum(AgentStatus).optional(),
  serviceArea: z.string().trim().optional(),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  sortBy: z.enum(['name', 'createdAt', 'rating', 'serviceArea', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type AgentQueryInput = z.infer<typeof agentQuerySchema>;
