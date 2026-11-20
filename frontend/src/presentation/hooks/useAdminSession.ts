'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthUseCase } from '../../application/use-cases/AuthUseCase';
import type { User } from '../../domain/entities';

export const adminSessionKey = ['admin-session'] as const;
export const sessionChannelName = 'portfolio-admin-session';

export function replaceAdminSession(queryClient: QueryClient, user: User | null) {
  queryClient.clear();
  queryClient.setQueryData(adminSessionKey, user);
}

function notifyOtherTabs(message: 'changed' | 'closed') {
  if (typeof BroadcastChannel === 'undefined') return;
  const channel = new BroadcastChannel(sessionChannelName);
  channel.postMessage(message);
  channel.close();
}

export function useAdminSession() {
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: adminSessionKey,
    queryFn: AuthUseCase.session,
    staleTime: 30_000,
    refetchOnWindowFocus: 'always',
    retry: false,
  });

  useEffect(() => {
    if (session.data === null) {
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== adminSessionKey[0] });
    }
  }, [queryClient, session.data]);

  return session;
}

export function commitAdminLogin(queryClient: QueryClient, user: User) {
  replaceAdminSession(queryClient, user);
  notifyOtherTabs('changed');
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: AuthUseCase.logout,
    onSuccess: () => {
      replaceAdminSession(queryClient, null);
      notifyOtherTabs('closed');
      router.replace('/login');
    },
    onError: () => { toast.error('No se pudo cerrar la sesión en el servidor. Intenta de nuevo.'); },
  });
}
