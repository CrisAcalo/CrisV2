import { Request, Response } from 'express';
import { ProjectUseCases } from '../../../application/use-cases/ProjectUseCases';

export class ProjectController {
    constructor(private projectUseCases: ProjectUseCases) { }

    getAllProjects = async (req: Request, res: Response): Promise<void> => {
        const includeDeleted = req.query.deleted === 'true';
        const projects = await this.projectUseCases.getAllProjects(includeDeleted);
        res.json({ status: 'success', data: projects });
    }

    getProjectById = async (req: Request, res: Response): Promise<void> => {
        const project = await this.projectUseCases.getProjectById(req.params.id as string);
        res.json({ status: 'success', data: project });
    }

    createProject = async (req: Request, res: Response): Promise<void> => {
        const project = await this.projectUseCases.createProject(req.body);
        res.status(201).json({ status: 'success', data: project });
    }

    updateProject = async (req: Request, res: Response): Promise<void> => {
        const project = await this.projectUseCases.updateProject(req.params.id as string, req.body);
        res.json({ status: 'success', data: project });
    }

    deleteProject = async (req: Request, res: Response): Promise<void> => {
        await this.projectUseCases.deleteProject(req.params.id as string);
        res.status(204).send();
    }

    softDeleteProject = async (req: Request, res: Response): Promise<void> => {
        await this.projectUseCases.softDeleteProject(req.params.id as string);
        res.status(204).send();
    }

    restoreProject = async (req: Request, res: Response): Promise<void> => {
        await this.projectUseCases.restoreProject(req.params.id as string);
        res.status(204).send();
    }
}
