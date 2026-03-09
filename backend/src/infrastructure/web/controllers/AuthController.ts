import { Request, Response, NextFunction } from 'express';
import { AuthUseCases } from '../../../application/use-cases/AuthUseCases';
import { PrismaUserRepository } from '../../database/prisma/PrismaUserRepository';

const userRepository = new PrismaUserRepository();
const authUseCases = new AuthUseCases(userRepository);

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password, role } = req.body;
            const result = await authUseCases.register({ email, passwordHash: password, role });

            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, password } = req.body;
            const result = await authUseCases.login({ email, passwordHash: password });

            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}
