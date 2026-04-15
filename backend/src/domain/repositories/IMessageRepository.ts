import { Message } from '../entities';

export interface IMessageRepository {
    findAll(includeDeleted?: boolean): Promise<Message[]>;
    findById(id: string): Promise<Message | null>;
    create(data: Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Message>;
    update(id: string, data: Partial<Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Message | null>;
    delete(id: string): Promise<boolean>;
    softDelete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
}
