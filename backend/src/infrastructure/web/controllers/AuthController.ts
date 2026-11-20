import { Request, Response } from 'express';
import { AuthUseCases } from '../../../application/use-cases/AuthUseCases';
import { UnauthorizedError } from '../../../domain/errors/AppError';
import { PrismaUserRepository } from '../../database/prisma/PrismaUserRepository';
import { issueAuthSession, revokeAuthSession } from '../../services/AuthSessionService';

const authUseCases = new AuthUseCases(new PrismaUserRepository(), issueAuthSession);

export class AuthController {
    static async register(req: Request, res: Response): Promise<void> {
        const { email, password, role } = req.body;
        const result = await authUseCases.register({ email, password, role });
        res.status(201).json({ status: 'success', data: result });
    }

    static async login(req: Request, res: Response): Promise<void> {
        const { email, password, otp } = req.body;
        const result = await authUseCases.login({ email, password, otp });
        res.status(200).json({ status: 'success', data: result });
    }

    static me(req: Request, res: Response): void {
        if (!req.user) throw new UnauthorizedError();
        const { userId: id, email, role } = req.user;
        res.json({ status: 'success', data: { id, email, role } });
    }

    static async logout(req: Request, res: Response): Promise<void> {
        if (!req.user) throw new UnauthorizedError();
        await revokeAuthSession(req.user.tokenHash);
        res.status(204).end();
    }
}
