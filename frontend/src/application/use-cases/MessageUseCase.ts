import { axiosClient } from '../../infrastructure/api/axiosClient';

export interface Message {
    id: string;
    name: string;
    email: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

export class MessageUseCase {
    static async getMessages(): Promise<{ status: string; data: Message[] }> {
        const { data } = await axiosClient.get<{ status: string; data: Message[] }>('/messages');
        return data;
    }
}
