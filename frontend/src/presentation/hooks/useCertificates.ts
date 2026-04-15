import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CertificateUseCase } from '../../application/use-cases/CertificateUseCase';
import { Certificate } from '../../domain/entities';

export const CertificateKeys = {
    all: ['certificates'] as const,
    active: () => [...CertificateKeys.all, 'active'] as const,
    trash: () => [...CertificateKeys.all, 'trash'] as const,
};

export function useCertificates(includeDeleted = false) {
    return useQuery({
        queryKey: includeDeleted ? CertificateKeys.trash() : CertificateKeys.active(),
        queryFn: () => CertificateUseCase.getCertificates(includeDeleted),
    });
}

export function useCreateCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<Certificate, 'id'>) => CertificateUseCase.createCertificate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CertificateKeys.all });
        },
    });
}

export function useUpdateCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Certificate, 'id'>> }) =>
            CertificateUseCase.updateCertificate(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CertificateKeys.all });
        },
    });
}

export function useSoftDeleteCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => CertificateUseCase.softDeleteCertificate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CertificateKeys.all });
        },
    });
}

export function useRestoreCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => CertificateUseCase.restoreCertificate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CertificateKeys.all });
        },
    });
}

export function useHardDeleteCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => CertificateUseCase.hardDeleteCertificate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CertificateKeys.all });
        },
    });
}
