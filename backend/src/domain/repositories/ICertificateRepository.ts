import { Certificate } from '../entities';

export interface ICertificateRepository {
    findAll(): Promise<Certificate[]>;
    findById(id: string): Promise<Certificate | null>;
    create(data: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Certificate>;
    update(id: string, data: Partial<Omit<Certificate, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Certificate | null>;
    delete(id: string): Promise<boolean>;
    softDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
}
