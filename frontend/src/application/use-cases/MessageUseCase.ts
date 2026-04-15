import { Message } from '../../domain/entities';
import { axiosClient } from '../../infrastructure/api/axiosClient';

type ListResponse<T> = { status: string; data: T[] };

export class MessageUseCase {
    static async getMessages(includeDeleted = false): Promise<ListResponse<Message>> {
        const { data } = await axiosClient.get<ListResponse<Message>>('/messages', {
            params: includeDeleted ? { deleted: 'true' } : undefined,
        });
        return data;
    }

    static async markAsRead(id: string, isRead: boolean): Promise<Message> {
        const { data } = await axiosClient.patch<{ status: string; data: Message }>(`/messages/${id}`, { isRead });
        return data.data;
    }

    static async softDeleteMessage(id: string): Promise<void> {
        await axiosClient.patch(`/messages/${id}/soft-delete`);
    }

    static async restoreMessage(id: string): Promise<void> {
        await axiosClient.patch(`/messages/${id}/restore`);
    }

    static async hardDeleteMessage(id: string): Promise<void> {
        await axiosClient.delete(`/messages/${id}`);
    }
}
