import { Experience, Education } from '../../domain/entities';
import { axiosClient } from '../../infrastructure/api/axiosClient';

type PaginatedResponse<T> = { status: string; data: T[] };

// ─── EXPERIENCE ─────────────────────────────────────────────────────────────

export class ExperienceUseCase {
    static async getExperiences(includeDeleted = false): Promise<PaginatedResponse<Experience>> {
        const { data } = await axiosClient.get<PaginatedResponse<Experience>>('/experiences', {
            params: includeDeleted ? { deleted: 'true' } : undefined,
        });
        return data;
    }

    static async createExperience(payload: Omit<Experience, 'id'>): Promise<Experience> {
        const { data } = await axiosClient.post<{ status: string; data: Experience }>('/experiences', payload);
        return data.data;
    }

    static async updateExperience(id: string, payload: Partial<Omit<Experience, 'id'>>): Promise<Experience> {
        const { data } = await axiosClient.patch<{ status: string; data: Experience }>(`/experiences/${id}`, payload);
        return data.data;
    }

    static async softDeleteExperience(id: string): Promise<void> {
        await axiosClient.patch(`/experiences/${id}/soft-delete`);
    }

    static async restoreExperience(id: string): Promise<void> {
        await axiosClient.patch(`/experiences/${id}/restore`);
    }

    static async hardDeleteExperience(id: string): Promise<void> {
        await axiosClient.delete(`/experiences/${id}`);
    }
}

// ─── EDUCATION ──────────────────────────────────────────────────────────────

export class EducationUseCase {
    static async getEducations(includeDeleted = false): Promise<PaginatedResponse<Education>> {
        const { data } = await axiosClient.get<PaginatedResponse<Education>>('/educations', {
            params: includeDeleted ? { deleted: 'true' } : undefined,
        });
        return data;
    }

    static async createEducation(payload: Omit<Education, 'id'>): Promise<Education> {
        const { data } = await axiosClient.post<{ status: string; data: Education }>('/educations', payload);
        return data.data;
    }

    static async updateEducation(id: string, payload: Partial<Omit<Education, 'id'>>): Promise<Education> {
        const { data } = await axiosClient.patch<{ status: string; data: Education }>(`/educations/${id}`, payload);
        return data.data;
    }

    static async softDeleteEducation(id: string): Promise<void> {
        await axiosClient.patch(`/educations/${id}/soft-delete`);
    }

    static async restoreEducation(id: string): Promise<void> {
        await axiosClient.patch(`/educations/${id}/restore`);
    }

    static async hardDeleteEducation(id: string): Promise<void> {
        await axiosClient.delete(`/educations/${id}`);
    }
}
