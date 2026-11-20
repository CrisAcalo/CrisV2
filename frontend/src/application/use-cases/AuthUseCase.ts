import { isAxiosError } from 'axios';
import type { User } from '../../domain/entities';
import { axiosClient } from '../../infrastructure/api/axiosClient';

type SessionResponse = { status: string; data: User };

export class AuthUseCase {
    static async login(email: string, password: string, otp?: string): Promise<User> {
        const { data } = await axiosClient.post<SessionResponse>('/auth/login', {
            email,
            password,
            ...(otp ? { otp } : {}),
        });
        return data.data;
    }

    static async session(): Promise<User | null> {
        try {
            const { data } = await axiosClient.get<SessionResponse>('/auth/me');
            return data.data;
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) return null;
            throw error;
        }
    }

    static async logout(): Promise<void> {
        await axiosClient.post('/auth/logout');
    }
}
