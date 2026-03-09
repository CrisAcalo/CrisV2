import { User } from '../../domain/entities';
import { axiosClient } from '../../infrastructure/api/axiosClient';

export interface LoginResponse {
    status: string;
    data: {
        user: User;
        token: string;
    };
}

export class AuthUseCase {
    static async login(email: string, password: string): Promise<LoginResponse> {
        const response = await axiosClient.post<LoginResponse>('/auth/login', {
            email,
            password,
        });
        return response.data;
    }
}
