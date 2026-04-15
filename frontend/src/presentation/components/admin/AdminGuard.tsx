'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../../application/stores/useAuthStore';

/**
 * Protects all /admin routes.
 *
 * Strategy:
 *  1. Check token presence locally (fast, no network).
 *  2. If no token → redirect to /login immediately.
 *  3. Role check (user must be ADMIN).
 *  4. Token expiry/invalidity is caught organically: when admin pages
 *     fire their first API requests, the Axios interceptor detects 401/403
 *     and AuthWatcher redirects to /login — no extra /auth/me needed.
 */
export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, token } = useAuthStore();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token || !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, token, isAuthenticated, pathname, router]);

  // Avoid hydration mismatch
  if (!mounted) return null;

  // Not authenticated → spinner while redirect fires
  if (!token || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <svg className="animate-spin h-8 w-8" style={{ color: 'var(--accent)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  // Authenticated but insufficient role
  if (pathname.startsWith('/admin') && user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Acceso Denegado</h1>
        <p style={{ color: 'var(--text-muted)' }}>Privilegios insuficientes.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 rounded-lg font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
