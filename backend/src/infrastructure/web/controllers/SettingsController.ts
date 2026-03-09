import { Request, Response, NextFunction } from 'express';
import { SystemConfigurationUseCases } from '../../../application/use-cases/SystemConfigurationUseCases';
import { PrismaSystemConfigurationRepository } from '../../database/prisma/PrismaSystemConfigurationRepository';

const configRepository = new PrismaSystemConfigurationRepository();
const configUseCases = new SystemConfigurationUseCases(configRepository);

export class SettingsController {
    static async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const config = await configUseCases.getSystemConfig();
            res.status(200).json({ status: 'success', data: config });
        } catch (error) {
            next(error);
        }
    }

    static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const updated = await configUseCases.updateSystemConfig(req.body);
            res.status(200).json({ status: 'success', data: updated });
        } catch (error) {
            next(error);
        }
    }
}
