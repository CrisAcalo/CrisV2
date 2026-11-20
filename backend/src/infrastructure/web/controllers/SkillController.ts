import { Request, Response } from 'express';
import { SkillUseCases } from '../../../application/use-cases/SkillUseCases';
import { NotFoundError } from '../../../domain/errors/AppError';

export class SkillController {
    constructor(private skillUseCases: SkillUseCases) { }

    getAllSkills = async (req: Request, res: Response): Promise<void> => {
        const includeDeleted = req.query.deleted === 'true';
        const skills = await this.skillUseCases.getAllSkills(includeDeleted);
        const publicSkills = skills.filter(skill => skill.isPublic).map(skill => ({
            ...skill,
            projects: skill.projects?.filter(project => project.isPublished && !project.deletedAt),
            experiences: skill.experiences?.filter(experience => !experience.deletedAt),
            educations: skill.educations?.filter(education => !education.deletedAt),
        }));
        res.json({ status: 'success', data: req.user?.role === 'ADMIN' ? skills : publicSkills });
    }

    getSkillById = async (req: Request, res: Response): Promise<void> => {
        const skill = await this.skillUseCases.getSkillById(req.params['id'] as string);
        if (req.user?.role !== 'ADMIN' && !skill.isPublic) {
            throw new NotFoundError('Skill no encontrada');
        }
        res.json({ status: 'success', data: req.user?.role === 'ADMIN' ? skill : {
            ...skill,
            projects: skill.projects?.filter(project => project.isPublished && !project.deletedAt),
            experiences: skill.experiences?.filter(experience => !experience.deletedAt),
            educations: skill.educations?.filter(education => !education.deletedAt),
        } });
    }

    createSkill = async (req: Request, res: Response): Promise<void> => {
        const skill = await this.skillUseCases.createSkill(req.body);
        res.status(201).json({ status: 'success', data: skill });
    }

    updateSkill = async (req: Request, res: Response): Promise<void> => {
        const skill = await this.skillUseCases.updateSkill(req.params['id'] as string, req.body);
        res.json({ status: 'success', data: skill });
    }

    deleteSkill = async (req: Request, res: Response): Promise<void> => {
        await this.skillUseCases.deleteSkill(req.params['id'] as string);
        res.status(204).send();
    }

    softDeleteSkill = async (req: Request, res: Response): Promise<void> => {
        await this.skillUseCases.softDeleteSkill(req.params['id'] as string);
        res.status(204).send();
    }

    restoreSkill = async (req: Request, res: Response): Promise<void> => {
        await this.skillUseCases.restoreSkill(req.params['id'] as string);
        res.status(204).send();
    }

    updateRelations = async (req: Request, res: Response): Promise<void> => {
        const skill = await this.skillUseCases.updateRelations(req.params['id'] as string, req.body);
        res.json({ status: 'success', data: skill });
    }
}
