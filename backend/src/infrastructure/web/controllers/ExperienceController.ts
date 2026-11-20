import { Request, Response } from 'express';
import { ExperienceUseCases } from '../../../application/use-cases/ExperienceUseCases';
import { publicSkillReferences } from './publicSkillReferences';

export class ExperienceController {
    constructor(private experienceUseCases: ExperienceUseCases) { }

    getAllExperiences = async (req: Request, res: Response): Promise<void> => {
        const includeDeleted = req.query.deleted === 'true';
        const experiences = await this.experienceUseCases.getAllExperiences(includeDeleted);
        res.json({
            status: 'success',
            data: req.user?.role === 'ADMIN' ? experiences : experiences.map(experience => ({
                ...experience,
                skills: publicSkillReferences(experience.skills),
            })),
        });
    }

    getExperienceById = async (req: Request, res: Response): Promise<void> => {
        const experience = await this.experienceUseCases.getExperienceById(req.params.id as string);
        res.json({
            status: 'success',
            data: req.user?.role === 'ADMIN' ? experience : {
                ...experience,
                skills: publicSkillReferences(experience.skills),
            },
        });
    }

    createExperience = async (req: Request, res: Response): Promise<void> => {
        const experience = await this.experienceUseCases.createExperience(req.body);
        res.status(201).json({ status: 'success', data: experience });
    }

    updateExperience = async (req: Request, res: Response): Promise<void> => {
        const experience = await this.experienceUseCases.updateExperience(req.params.id as string, req.body);
        res.json({ status: 'success', data: experience });
    }

    deleteExperience = async (req: Request, res: Response): Promise<void> => {
        await this.experienceUseCases.deleteExperience(req.params.id as string);
        res.status(204).send();
    }

    softDeleteExperience = async (req: Request, res: Response): Promise<void> => {
        await this.experienceUseCases.softDeleteExperience(req.params.id as string);
        res.status(204).send();
    }

    restoreExperience = async (req: Request, res: Response): Promise<void> => {
        await this.experienceUseCases.restoreExperience(req.params.id as string);
        res.status(204).send();
    }
}
