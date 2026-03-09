import { Education } from '../entities';

export interface IEducationRepository {
    findAll(includeDeleted?: boolean): Promise<Education[]>;
    findById(id: string): Promise<Education | null>;
    create(data: Omit<Education, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Education>;
    update(id: string, data: Partial<Omit<Education, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Education | null>;
    delete(id: string): Promise<boolean>;
    softDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
}
