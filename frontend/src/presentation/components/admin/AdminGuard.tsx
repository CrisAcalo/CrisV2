'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminLogout, useAdminSession } from '../../hooks/useAdminSession';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const session = useAdminSession();
  const logout = useAdminLogout();

  useEffect(() => {
    if (session.isSuccess && session.data === null) router.replace('/login');
  }, [session.isSuccess, session.data, router]);

  if (session.isError) {
    return (
      <main className="admin-access">
        <h1>No se pudo verificar la sesión</h1>
        <p>Comprueba tu conexión y vuelve a intentarlo.</p>
        <button type="button" onClick={() => { void session.refetch(); }} className="underline underline-offset-4">
          Reintentar
        </button>
      </main>
    );
  }

  if (session.isPending || !session.data) {
    return (
      <div className="admin-access">
        <p role="status">{session.isPending ? 'Verificando sesión…' : 'Abriendo el inicio de sesión…'}</p>
      </div>
    );
  }

  if (session.data.role !== 'ADMIN') {
    return (
      <main className="admin-access">
        <h1>Acceso denegado</h1>
        <p>Esta sección requiere una cuenta de administrador.</p>
        <button type="button" disabled={logout.isPending} onClick={() => logout.mutate()} className="underline underline-offset-4">
          Cerrar sesión
        </button>
        <Link href="/" className="underline underline-offset-4">Volver al portafolio</Link>
      </main>
    );
  }

  return <>{children}</>;
};
