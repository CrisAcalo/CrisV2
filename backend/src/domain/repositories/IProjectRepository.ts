import { Project } from '../entities';

export type ProjectWrite = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'skills' | 'isFeatured'> & {
    isFeatured?: boolean;
    skillIds?: string[];
};

export interface IProjectRepository {
    findAll(includeDeleted?: boolean): Promise<Project[]>;
    findById(id: string): Promise<Project | null>;
    create(data: ProjectWrite): Promise<Project>;
    update(id: string, data: Partial<ProjectWrite>): Promise<Project | null>;
    delete(id: string): Promise<boolean>;
    softDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
}
