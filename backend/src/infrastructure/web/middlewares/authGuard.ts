import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../../../domain/errors/AppError';
import { resolveAuthSession } from '../../services/AuthSessionService';

declare global {
    namespace Express {
        interface Request {
            user?: Awaited<ReturnType<typeof resolveAuthSession>>;
        }
    }
}

function readToken(req: Request): string {
    const token = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(req.headers.authorization ?? '')?.[1];
    if (!token) throw new UnauthorizedError('Missing or invalid session');
    return token;
}

export const authGuard = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    req.user ??= await resolveAuthSession(readToken(req));
    next();
};

// Public reads remain available, while an authenticated admin may see drafts.
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.headers.authorization) return next();
    await authGuard(req, res, next);
};

export const requireAdminForDeleted = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.query.deleted === 'true' && req.user?.role !== 'ADMIN') {
        throw new ForbiddenError('Admin access required for deleted records');
    }
    next();
};

export const requireRole = (role: 'ADMIN' | 'BASIC') => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) throw new UnauthorizedError('Authentication required');
        if (req.user.role !== role) throw new ForbiddenError('Insufficient permissions');
        next();
    };
};
