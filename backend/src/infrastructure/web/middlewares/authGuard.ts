import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../../../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../../../domain/errors/AppError';

// Extender el Request de Express para incluir el usuario de forma tipada
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authGuard = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided or invalid format');
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch (error) {
        throw new UnauthorizedError('Invalid or expired token');
    }
};

export const requireRole = (role: 'ADMIN' | 'BASIC') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            throw new UnauthorizedError('Authentication required');
        }

        if (req.user.role !== role) {
            throw new ForbiddenError(`Access denied. Requires ${role} role.`);
        }

        next();
    };
};
