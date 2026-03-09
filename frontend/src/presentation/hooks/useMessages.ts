import { useQuery } from '@tanstack/react-query';
import { MessageUseCase } from '../../application/use-cases/MessageUseCase';

export const useMessages = () => {
    return useQuery({
        queryKey: ['messages'],
        queryFn: () => MessageUseCase.getMessages(),
    });
};
