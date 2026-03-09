import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LinkedInUseCase } from '../../application/use-cases/LinkedInUseCase';

export const useSyncLinkedIn = () => {
    const queryClient = useQueryClient();

    const syncExperiences = useMutation({
        mutationFn: () => LinkedInUseCase.syncExperiences(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['experiences'] });
            alert('Experiencias sincronizadas exitosamente.');
        },
        onError: () => alert('Error al sincronizar Experiencias (Revisa tu URN o Tokens).')
    });

    const syncEducations = useMutation({
        mutationFn: () => LinkedInUseCase.syncEducations(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['educations'] });
            alert('Educación sincronizada exitosamente.');
        },
        onError: () => alert('Error al sincronizar Educación (Revisa tu URN o Tokens).')
    });

    const syncCertificates = useMutation({
        mutationFn: () => LinkedInUseCase.syncCertificates(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
            alert('Certificados sincronizados exitosamente.');
        },
        onError: () => alert('Error al sincronizar Certificados (Revisa tu URN o Tokens).')
    });

    return { syncExperiences, syncEducations, syncCertificates };
};
