import { Certificate } from '../../domain/entities';
import { axiosClient } from '../../infrastructure/api/axiosClient';

type PaginatedResponse<T> = { status: string; data: T[] };

export class CertificateUseCase {
    static async getCertificates(includeDeleted = false): Promise<PaginatedResponse<Certificate>> {
        const { data } = await axiosClient.get<PaginatedResponse<Certificate>>('/certificates', {
            params: includeDeleted ? { deleted: 'true' } : undefined,
        });
        return data;
    }

    static async createCertificate(payload: Omit<Certificate, 'id'>): Promise<Certificate> {
        const { data } = await axiosClient.post<{ status: string; data: Certificate }>('/certificates', payload);
        return data.data;
    }

    static async updateCertificate(id: string, payload: Partial<Omit<Certificate, 'id'>>): Promise<Certificate> {
        const { data } = await axiosClient.patch<{ status: string; data: Certificate }>(`/certificates/${id}`, payload);
        return data.data;
    }

    static async softDeleteCertificate(id: string): Promise<void> {
        await axiosClient.patch(`/certificates/${id}/soft-delete`);
    }

    static async restoreCertificate(id: string): Promise<void> {
        await axiosClient.patch(`/certificates/${id}/restore`);
    }

    static async hardDeleteCertificate(id: string): Promise<void> {
        await axiosClient.delete(`/certificates/${id}`);
    }
}
