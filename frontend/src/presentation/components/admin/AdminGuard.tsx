'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../../application/stores/useAuthStore';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && pathname.startsWith('/admin')) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, pathname, router]);

  if (!mounted) return null; // Avoid hydration mismatch

  if (!isAuthenticated && pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Si trata de entrar a páginas de admin sin rol ADMIN
  if (pathname.startsWith('/admin') && user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
        <p className="text-slate-600 dark:text-slate-400">Privilegios insuficientes.</p>
        <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">
          Volver al Inicio
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
