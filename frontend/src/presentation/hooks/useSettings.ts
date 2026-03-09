import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsUseCase } from '../../application/use-cases/SettingsUseCase';
import { SystemConfiguration } from '../../domain/entities';

export const useSettings = () => {
    return useQuery({
        queryKey: ['settings'],
        queryFn: () => SettingsUseCase.getSettings(),
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<SystemConfiguration>) => SettingsUseCase.updateSettings(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
};
