import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Application specific errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        details: err.details || null,
      },
    });
    return;
  }

  // Prisma unique constraint violation (e.g., duplicate phone or email)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta?.target as string[]).join(', ')
        : 'field';
      res.status(409).json({
        success: false,
        error: {
          message: `A delivery agent with this ${target} already exists.`,
          code: 'DUPLICATE_ENTRY',
          target,
        },
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          message: 'The requested delivery agent record was not found.',
          code: 'RECORD_NOT_FOUND',
        },
      });
      return;
    }
  }

  // Fallback for unhandled internal server errors
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
}
