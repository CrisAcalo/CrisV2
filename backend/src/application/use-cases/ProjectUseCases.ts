import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Project } from '../../domain/entities';

export type CreateProjectDTO = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateProjectDTO = Partial<CreateProjectDTO>;

export class ProjectUseCases {
    constructor(private projectRepository: IProjectRepository) { }

    async getAllProjects(includeDeleted: boolean = false): Promise<Project[]> {
        return this.projectRepository.findAll(includeDeleted);
    }

    async getProjectById(id: string): Promise<Project> {
        const project = await this.projectRepository.findById(id);
        if (!project) throw new NotFoundError('Proyecto no encontrado');
        return project;
    }

    async createProject(data: CreateProjectDTO): Promise<Project> {
        return this.projectRepository.create(data);
    }

    async updateProject(id: string, data: UpdateProjectDTO): Promise<Project> {
        const project = await this.projectRepository.update(id, data);
        if (!project) throw new NotFoundError('Proyecto no encontrado');
        return project;
    }

    async deleteProject(id: string): Promise<void> {
        const deleted = await this.projectRepository.delete(id);
        if (!deleted) throw new NotFoundError('Proyecto no encontrado');
    }

    async softDeleteProject(id: string): Promise<void> {
        const deleted = await this.projectRepository.softDelete(id);
        if (!deleted) throw new NotFoundError('Proyecto no encontrado');
    }

    async restoreProject(id: string): Promise<void> {
        const restored = await this.projectRepository.restore(id);
        if (!restored) throw new NotFoundError('Proyecto no encontrado');
    }
}
