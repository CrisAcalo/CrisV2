import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../../domain/errors/AppError';

// Express 5 ya maneja las promesas rechazadas automáticamente, pero este middleware
// de manejo de errores captura cualquier error lanzado en las rutas o middlewares.
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Manejo de errores de validación con Zod
    if (err instanceof ZodError) {
        res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: err.issues.map((e) => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
        return;
    }

    // Manejo de nuestros errores de dominio personalizados
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
        return;
    }

    // Errores específicos de Prisma (violación de constraints, etc.)
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;
        // P2002: Unique constraint failed
        if (prismaError.code === 'P2002') {
            res.status(409).json({
                status: 'error',
                message: 'A record with that value already exists.',
            });
            return;
        }
        // Añadir más códigos de Prisma según sea necesario
    }

    // Fallback para errores no manejados/no operacionales
    console.error('🔥 [Unhandled Error]:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
