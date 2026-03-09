import { SystemConfiguration } from '../../domain/entities';
import { axiosClient } from '../../infrastructure/api/axiosClient';

export class SettingsUseCase {
    static async getSettings(): Promise<{ status: string; data: SystemConfiguration }> {
        const { data } = await axiosClient.get<{ status: string; data: SystemConfiguration }>('/admin/settings');
        return data;
    }

    static async updateSettings(settings: Partial<SystemConfiguration>): Promise<{ status: string; data: SystemConfiguration }> {
        const { data } = await axiosClient.patch<{ status: string; data: SystemConfiguration }>('/admin/settings', settings);
        return data;
    }
}
