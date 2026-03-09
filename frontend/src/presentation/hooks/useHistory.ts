import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExperienceUseCase, EducationUseCase } from '../../application/use-cases/HistoryUseCase';

// ─── EXPERIENCE ──────────────────────────────────────────────────────────────

export const useExperiences = (includeDeleted = false) => {
    return useQuery({
        queryKey: ['experiences', { includeDeleted }],
        queryFn: () => ExperienceUseCase.getExperiences(includeDeleted),
    });
};

export const useCreateExperience = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ExperienceUseCase.createExperience,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['experiences'] }),
    });
};

export const useUpdateExperience = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => ExperienceUseCase.updateExperience(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['experiences'] }),
    });
};

export const useSoftDeleteExperience = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ExperienceUseCase.softDeleteExperience,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['experiences'] }),
    });
};

export const useRestoreExperience = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ExperienceUseCase.restoreExperience,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['experiences'] }),
    });
};

export const useHardDeleteExperience = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ExperienceUseCase.hardDeleteExperience,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['experiences'] }),
    });
};

// ─── EDUCATION ───────────────────────────────────────────────────────────────

export const useEducations = (includeDeleted = false) => {
    return useQuery({
        queryKey: ['educations', { includeDeleted }],
        queryFn: () => EducationUseCase.getEducations(includeDeleted),
    });
};

export const useCreateEducation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: EducationUseCase.createEducation,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['educations'] }),
    });
};

export const useUpdateEducation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => EducationUseCase.updateEducation(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['educations'] }),
    });
};

export const useSoftDeleteEducation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: EducationUseCase.softDeleteEducation,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['educations'] }),
    });
};

export const useRestoreEducation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: EducationUseCase.restoreEducation,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['educations'] }),
    });
};

export const useHardDeleteEducation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: EducationUseCase.hardDeleteEducation,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['educations'] }),
    });
};
