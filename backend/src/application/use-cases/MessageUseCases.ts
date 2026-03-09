import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Message } from '../../domain/entities';

export type CreateMessageDTO = Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateMessageDTO = Partial<CreateMessageDTO>;

export class MessageUseCases {
    constructor(private messageRepository: IMessageRepository) { }

    async getAllMessages(): Promise<Message[]> {
        return this.messageRepository.findAll();
    }

    async getMessageById(id: string): Promise<Message> {
        const message = await this.messageRepository.findById(id);
        if (!message) throw new NotFoundError('Mensaje no encontrado');
        return message;
    }

    async createMessage(data: Omit<CreateMessageDTO, 'isRead'>): Promise<Message> {
        return this.messageRepository.create({
            ...data,
            isRead: false
        });
    }

    async updateMessage(id: string, data: UpdateMessageDTO): Promise<Message> {
        const message = await this.messageRepository.update(id, data);
        if (!message) throw new NotFoundError('Mensaje no encontrado');
        return message;
    }

    async deleteMessage(id: string): Promise<void> {
        const deleted = await this.messageRepository.delete(id);
        if (!deleted) throw new NotFoundError('Mensaje no encontrado');
    }

    async softDeleteMessage(id: string): Promise<void> {
        const deleted = await this.messageRepository.softDelete(id);
        if (!deleted) throw new NotFoundError('Mensaje no encontrado');
    }

    async restoreMessage(id: string): Promise<void> {
        const restored = await this.messageRepository.restore(id);
        if (!restored) throw new NotFoundError('Mensaje no encontrado');
    }
}
