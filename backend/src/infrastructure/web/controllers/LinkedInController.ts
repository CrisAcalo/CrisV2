import { Request, Response, NextFunction } from 'express';
import { SyncLinkedInDataUseCase } from '../../../application/use-cases/SyncLinkedInDataUseCase';
import { LinkedInService } from '../../services/LinkedInService';
import { PrismaLinkedInSyncRepository } from '../../database/prisma/PrismaLinkedInSyncRepository';
import { PrismaSystemConfigurationRepository } from '../../database/prisma/PrismaSystemConfigurationRepository';

const linkedInService = new LinkedInService();
const linkedInSyncRepository = new PrismaLinkedInSyncRepository();
const configRepository = new PrismaSystemConfigurationRepository();
const syncLinkedInDataUseCase = new SyncLinkedInDataUseCase(linkedInService, linkedInSyncRepository, configRepository);

export class LinkedInController {
    static async syncExperiences(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await syncLinkedInDataUseCase.executeExperiences();
            res.status(200).json({ status: 'success', data: result });
        } catch (error) { next(error); }
    }

    static async syncEducations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await syncLinkedInDataUseCase.executeEducations();
            res.status(200).json({ status: 'success', data: result });
        } catch (error) { next(error); }
    }

    static async syncCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await syncLinkedInDataUseCase.executeCertificates();
            res.status(200).json({ status: 'success', data: result });
        } catch (error) { next(error); }
    }
}
