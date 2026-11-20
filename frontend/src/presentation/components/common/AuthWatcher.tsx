'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { adminSessionExpiredEvent } from '../../../infrastructure/api/axiosClient';
import { adminSessionKey, replaceAdminSession, sessionChannelName } from '../../hooks/useAdminSession';

export const AuthWatcher = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      // Remove credentials left by versions that persisted the session in the browser.
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('auth-storage');
    } catch {
      // Storage may be disabled by the browser.
    }

    function closeSession() {
      replaceAdminSession(queryClient, null);
      if (window.location.pathname.startsWith('/admin')) router.replace('/login');
    }

    window.addEventListener(adminSessionExpiredEvent, closeSession);
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(sessionChannelName);
    if (channel) {
      channel.onmessage = (event) => {
        if (event.data === 'closed') closeSession();
        if (event.data === 'changed') {
          queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== adminSessionKey[0] });
          void queryClient.invalidateQueries({ queryKey: adminSessionKey });
        }
      };
    }
    return () => {
      window.removeEventListener(adminSessionExpiredEvent, closeSession);
      channel?.close();
    };
  }, [queryClient, router]);

  return null;
};
