import { Project } from '../../domain/entities';
import { axiosClient } from '../../infrastructure/api/axiosClient';

interface ListResponse<T> {
    status: string;
    data: T[];
}

export type ProjectInput = Pick<Project, 'title' | 'description' | 'isPublished'>
    & Partial<Pick<Project, 'imageUrl' | 'repoUrl' | 'liveUrl' | 'isFeatured' | 'caseStudy'>>
    & { skillIds?: string[] };

export class ProjectUseCase {
    static async getProjects(includeDeleted = false): Promise<ListResponse<Project>> {
        const { data } = await axiosClient.get<ListResponse<Project>>(
            `/projects${includeDeleted ? '?deleted=true' : ''}`
        );
        return data;
    }

    static async getProject(id: string): Promise<{ status: string; data: Project }> {
        const { data } = await axiosClient.get<{ status: string; data: Project }>(`/projects/${id}`);
        return data;
    }

    static async createProject(project: ProjectInput): Promise<{ status: string; data: Project }> {
        const { data } = await axiosClient.post<{ status: string; data: Project }>('/projects', project);
        return data;
    }

    static async updateProject(id: string, project: Partial<ProjectInput>): Promise<{ status: string; data: Project }> {
        const { data } = await axiosClient.patch<{ status: string; data: Project }>(`/projects/${id}`, project);
        return data;
    }

    static async softDeleteProject(id: string): Promise<void> {
        await axiosClient.patch(`/projects/${id}/soft-delete`);
    }

    static async restoreProject(id: string): Promise<void> {
        await axiosClient.patch(`/projects/${id}/restore`);
    }

    static async hardDeleteProject(id: string): Promise<void> {
        await axiosClient.delete(`/projects/${id}`);
    }
}
