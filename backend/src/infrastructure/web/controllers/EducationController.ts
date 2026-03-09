import { Request, Response } from 'express';
import { EducationUseCases } from '../../../application/use-cases/EducationUseCases';

export class EducationController {
    constructor(private educationUseCases: EducationUseCases) { }

    getAllEducations = async (req: Request, res: Response): Promise<void> => {
        const includeDeleted = req.query.deleted === 'true';
        const educations = await this.educationUseCases.getAllEducations(includeDeleted);
        res.json({ status: 'success', data: educations });
    }

    getEducationById = async (req: Request, res: Response): Promise<void> => {
        const education = await this.educationUseCases.getEducationById(req.params.id as string);
        res.json({ status: 'success', data: education });
    }

    createEducation = async (req: Request, res: Response): Promise<void> => {
        const education = await this.educationUseCases.createEducation(req.body);
        res.status(201).json({ status: 'success', data: education });
    }

    updateEducation = async (req: Request, res: Response): Promise<void> => {
        const education = await this.educationUseCases.updateEducation(req.params.id as string, req.body);
        res.json({ status: 'success', data: education });
    }

    deleteEducation = async (req: Request, res: Response): Promise<void> => {
        await this.educationUseCases.deleteEducation(req.params.id as string);
        res.status(204).send();
    }

    softDeleteEducation = async (req: Request, res: Response): Promise<void> => {
        await this.educationUseCases.softDeleteEducation(req.params.id as string);
        res.status(204).send();
    }

    restoreEducation = async (req: Request, res: Response): Promise<void> => {
        await this.educationUseCases.restoreEducation(req.params.id as string);
        res.status(204).send();
    }
}
