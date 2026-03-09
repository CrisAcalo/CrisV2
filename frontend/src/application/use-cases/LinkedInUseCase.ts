import { axiosClient } from '../../infrastructure/api/axiosClient';

interface SyncResponse {
    status: string;
    data: {
        message: string;
        count: number;
    };
}

export class LinkedInUseCase {
    static async syncExperiences(): Promise<SyncResponse> {
        const { data } = await axiosClient.post<SyncResponse>('/admin/linkedin/sync/experiences');
        return data;
    }

    static async syncEducations(): Promise<SyncResponse> {
        const { data } = await axiosClient.post<SyncResponse>('/admin/linkedin/sync/educations');
        return data;
    }

    static async syncCertificates(): Promise<SyncResponse> {
        const { data } = await axiosClient.post<SyncResponse>('/admin/linkedin/sync/certificates');
        return data;
    }
}
