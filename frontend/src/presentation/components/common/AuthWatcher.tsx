'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../application/stores/useAuthStore';

/**
 * Listens for 'auth:unauthorized' events dispatched by the Axios response
 * interceptor when a 401 or 403 is returned from the API.
 * On detection: clears auth state and redirects to /login.
 *
 * Mount this once at the root Providers level so it's active globally.
 */
export const AuthWatcher = () => {
  const { logout, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      router.replace('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, router]);

  return null;
};
