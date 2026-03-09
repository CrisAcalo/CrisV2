import { Experience } from '../entities';

export interface IExperienceRepository {
    findAll(includeDeleted?: boolean): Promise<Experience[]>;
    findById(id: string): Promise<Experience | null>;
    create(data: Omit<Experience, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Experience>;
    update(id: string, data: Partial<Omit<Experience, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Experience | null>;
    delete(id: string): Promise<boolean>;
    softDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
}
