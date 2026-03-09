import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectUseCase } from '../../application/use-cases/ProjectUseCase';
import { Project } from '../../domain/entities';

export const useProjects = (includeDeleted = false) => {
    return useQuery({
        queryKey: ['projects', { deleted: includeDeleted }],
        queryFn: () => ProjectUseCase.getProjects(includeDeleted),
    });
};

export const useProject = (id: string) => {
    return useQuery({
        queryKey: ['project', id],
        queryFn: () => ProjectUseCase.getProject(id),
        enabled: !!id,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (project: Omit<Project, 'id'>) => ProjectUseCase.createProject(project),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => ProjectUseCase.updateProject(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
        },
    });
};

export const useSoftDeleteProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ProjectUseCase.softDeleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
};

export const useRestoreProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ProjectUseCase.restoreProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
};

export const useHardDeleteProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ProjectUseCase.hardDeleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
};
