import { Request, Response } from 'express';
import { SkillUseCases } from '../../../application/use-cases/SkillUseCases';

export class SkillController {
    constructor(private skillUseCases: SkillUseCases) { }

    getAllSkills = async (req: Request, res: Response): Promise<void> => {
        const includeDeleted = req.query.deleted === 'true';
        const skills = await this.skillUseCases.getAllSkills(includeDeleted);
        res.json({ status: 'success', data: skills });
    }

    getSkillById = async (req: Request, res: Response): Promise<void> => {
        const skill = await this.skillUseCases.getSkillById(req.params['id'] as string);
        res.json({ status: 'success', data: skill });
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
