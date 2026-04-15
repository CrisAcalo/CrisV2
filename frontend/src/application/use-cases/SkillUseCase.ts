import { Skill } from '../../domain/entities';
import { axiosClient } from '../../infrastructure/api/axiosClient';

interface ListResponse<T> {
    status: string;
    data: T[];
}

interface SingleResponse<T> {
    status: string;
    data: T;
}

export type CreateSkillDTO = {
    name: string;
    isFromLinkedIn?: boolean;
    isPublic?: boolean;
};

export type UpdateSkillDTO = Partial<Pick<Skill, 'name' | 'isFromLinkedIn' | 'isPublic'>>;

export type UpdateSkillRelationsDTO = {
    projectIds?: string[];
    experienceIds?: string[];
    educationIds?: string[];
};

export class SkillUseCase {
    static async getSkills(includeDeleted = false): Promise<ListResponse<Skill>> {
        const { data } = await axiosClient.get<ListResponse<Skill>>(
            `/skills${includeDeleted ? '?deleted=true' : ''}`
        );
        return data;
    }

    static async getSkillById(id: string): Promise<SingleResponse<Skill>> {
        const { data } = await axiosClient.get<SingleResponse<Skill>>(`/skills/${id}`);
        return data;
    }

    static async createSkill(skill: CreateSkillDTO): Promise<SingleResponse<Skill>> {
        const { data } = await axiosClient.post<SingleResponse<Skill>>('/skills', skill);
        return data;
    }

    static async updateSkill(id: string, skill: UpdateSkillDTO): Promise<SingleResponse<Skill>> {
        const { data } = await axiosClient.patch<SingleResponse<Skill>>(`/skills/${id}`, skill);
        return data;
    }

    static async updateRelations(id: string, relations: UpdateSkillRelationsDTO): Promise<SingleResponse<Skill>> {
        const { data } = await axiosClient.patch<SingleResponse<Skill>>(`/skills/${id}/relations`, relations);
        return data;
    }

    static async softDeleteSkill(id: string): Promise<void> {
        await axiosClient.patch(`/skills/${id}/soft-delete`);
    }

    static async restoreSkill(id: string): Promise<void> {
        await axiosClient.patch(`/skills/${id}/restore`);
    }

    static async hardDeleteSkill(id: string): Promise<void> {
        await axiosClient.delete(`/skills/${id}`);
    }
}
