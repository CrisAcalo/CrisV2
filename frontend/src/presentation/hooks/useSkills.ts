import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SkillUseCase, CreateSkillDTO, UpdateSkillDTO, UpdateSkillRelationsDTO } from '../../application/use-cases/SkillUseCase';

export const useSkills = (includeDeleted = false) => {
    return useQuery({
        queryKey: ['skills', { deleted: includeDeleted }],
        queryFn: () => SkillUseCase.getSkills(includeDeleted),
    });
};

export const useSkill = (id: string) => {
    return useQuery({
        queryKey: ['skill', id],
        queryFn: () => SkillUseCase.getSkillById(id),
        enabled: !!id,
    });
};

export const useCreateSkill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (skill: CreateSkillDTO) => SkillUseCase.createSkill(skill),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });
};

export const useUpdateSkill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSkillDTO }) =>
            SkillUseCase.updateSkill(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['skills'] });
            queryClient.invalidateQueries({ queryKey: ['skill', variables.id] });
        },
    });
};

export const useUpdateSkillRelations = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateSkillRelationsDTO }) =>
            SkillUseCase.updateRelations(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });
};

export const useSoftDeleteSkill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => SkillUseCase.softDeleteSkill(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });
};

export const useRestoreSkill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => SkillUseCase.restoreSkill(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });
};

export const useHardDeleteSkill = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => SkillUseCase.hardDeleteSkill(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skills'] });
        },
    });
};
