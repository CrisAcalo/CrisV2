import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LinkedInUseCase } from '../../application/use-cases/LinkedInUseCase';

export const useSyncLinkedIn = () => {
    const queryClient = useQueryClient();

    const syncExperiences = useMutation({
        mutationFn: () => LinkedInUseCase.syncExperiences(),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
            if (response.data.count > 0) {
                toast.success(response.data.message);
            } else {
                toast.warning(response.data.message);
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al sincronizar Experiencias (Revisa tu URN o Tokens).');
        }
    });

    const syncEducations = useMutation({
        mutationFn: () => LinkedInUseCase.syncEducations(),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['educations'] });
            if (response.data.count > 0) {
                toast.success(response.data.message);
            } else {
                toast.warning(response.data.message);
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al sincronizar Educación (Revisa tu URN o Tokens).');
        }
    });

    const syncCertificates = useMutation({
        mutationFn: () => LinkedInUseCase.syncCertificates(),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
            if (response.data.count > 0) {
                toast.success(response.data.message);
            } else {
                toast.warning(response.data.message);
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al sincronizar Certificados (Revisa tu URN o Tokens).');
        }
    });

    return { syncExperiences, syncEducations, syncCertificates };
};
