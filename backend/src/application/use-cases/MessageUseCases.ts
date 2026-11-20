import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import { Message } from '../../domain/entities';
import { sendContactEmail, type ContactNotificationStatus } from '../../infrastructure/services/EmailService';

export type CreateMessageDTO = Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateMessageDTO = Partial<CreateMessageDTO>;

export class MessageUseCases {
    constructor(private messageRepository: IMessageRepository) { }

    async getAllMessages(includeDeleted: boolean = false): Promise<Message[]> {
        return this.messageRepository.findAll(includeDeleted);
    }

    async getMessageById(id: string): Promise<Message> {
        const message = await this.messageRepository.findById(id);
        if (!message) throw new NotFoundError('Mensaje no encontrado');
        return message;
    }

    async createMessage(data: Omit<CreateMessageDTO, 'isRead'>): Promise<{ message: Message; notification: ContactNotificationStatus }> {
        const message = await this.messageRepository.create({
            ...data,
            isRead: false,
        });

        const notification = await sendContactEmail(message.id);
        return { message, notification };
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
