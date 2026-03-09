import { Request, Response } from 'express';
import { CertificateUseCases } from '../../../application/use-cases/CertificateUseCases';

export class CertificateController {
    constructor(private certificateUseCases: CertificateUseCases) { }

    getAllCertificates = async (req: Request, res: Response): Promise<void> => {
        const certificates = await this.certificateUseCases.getAllCertificates();
        res.json({ status: 'success', data: certificates });
    }

    getCertificateById = async (req: Request, res: Response): Promise<void> => {
        const certificate = await this.certificateUseCases.getCertificateById(req.params.id as string);
        res.json({ status: 'success', data: certificate });
    }

    createCertificate = async (req: Request, res: Response): Promise<void> => {
        const certificate = await this.certificateUseCases.createCertificate(req.body);
        res.status(201).json({ status: 'success', data: certificate });
    }

    updateCertificate = async (req: Request, res: Response): Promise<void> => {
        const certificate = await this.certificateUseCases.updateCertificate(req.params.id as string, req.body);
        res.json({ status: 'success', data: certificate });
    }

    deleteCertificate = async (req: Request, res: Response): Promise<void> => {
        await this.certificateUseCases.deleteCertificate(req.params.id as string);
        res.status(204).send();
    }

    softDeleteCertificate = async (req: Request, res: Response): Promise<void> => {
        await this.certificateUseCases.softDeleteCertificate(req.params.id as string);
        res.status(204).send();
    }

    restoreCertificate = async (req: Request, res: Response): Promise<void> => {
        await this.certificateUseCases.restoreCertificate(req.params.id as string);
        res.status(204).send();
    }
}
