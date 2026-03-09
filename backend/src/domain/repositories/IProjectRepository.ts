import { Project } from '../entities';

export interface IProjectRepository {
    findAll(includeDeleted?: boolean): Promise<Project[]>;
    findById(id: string): Promise<Project | null>;
    create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Project>;
    update(id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Project | null>;
    delete(id: string): Promise<boolean>;
    softDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
}
