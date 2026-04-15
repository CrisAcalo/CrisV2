import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageUseCase } from '../../application/use-cases/MessageUseCase';

export const MessageKeys = {
    all: ['messages'] as const,
    active: () => [...MessageKeys.all, 'active'] as const,
    trash: () => [...MessageKeys.all, 'trash'] as const,
};

export function useMessages(includeDeleted = false) {
    return useQuery({
        queryKey: ["messages", { deleted: includeDeleted }],
        queryFn: () => MessageUseCase.getMessages(includeDeleted),
    });
}

export function useMarkMessageAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
            MessageUseCase.markAsRead(id, isRead),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MessageKeys.all });
        },
    });
}

export function useSoftDeleteMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => MessageUseCase.softDeleteMessage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MessageKeys.all });
        },
    });
}

export function useRestoreMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => MessageUseCase.restoreMessage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MessageKeys.all });
        },
    });
}

export function useHardDeleteMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => MessageUseCase.hardDeleteMessage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: MessageKeys.all });
        },
    });
}
