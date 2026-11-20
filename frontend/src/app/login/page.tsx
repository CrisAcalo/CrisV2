'use client';

import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, Input, Button } from '../../presentation/components/common';
import { AuthUseCase } from '../../application/use-cases/AuthUseCase';
import { commitAdminLogin, useAdminSession } from '../../presentation/hooks/useAdminSession';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { ThemeToggle } from '../../presentation/components/common/ThemeToggle';
import '../../presentation/styles/admin-theme.css';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [needsOtp, setNeedsOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useAdminSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (session.data?.role === 'ADMIN') router.replace('/admin');
  }, [session.data?.role, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const user = await AuthUseCase.login(email, password, needsOtp ? otp : undefined);
      setPassword('');
      setOtp('');
      setNeedsOtp(false);
      commitAdminLogin(queryClient, user);
      if (user.role !== 'ADMIN') setError('Esta sección requiere una cuenta de administrador.');
    } catch (error) {
      const response = isAxiosError<{ code?: string }>(error) ? error.response : undefined;
      const code = response?.data?.code;
      if (response?.status === 401 && (code === 'MFA_REQUIRED' || code === 'MFA_INVALID')) {
        setNeedsOtp(true);
        setOtp('');
        setError(code === 'MFA_INVALID' ? 'El código no es válido. Usa el código actual de tu autenticador.' : null);
      } else {
        setPassword('');
        setOtp('');
        setNeedsOtp(false);
        if (response?.status === 429) setError('Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.');
        else if (code === 'MFA_NOT_CONFIGURED') setError('Esta cuenta requiere configurar la verificación en dos pasos.');
        else if (response?.status === 403) setError('Acceso no autorizado al panel.');
        else if (response?.status === 401) setError('Correo o contraseña incorrectos.');
        else setError('No se pudo iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-shell flex flex-col items-center justify-center p-4">
      {/* Top right floating theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Autenticación</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Ingresa tus credenciales de administrador</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setNeedsOtp(false); setOtp(''); }}
              placeholder="admin@example.com"
              autoComplete="username"
              disabled={isLoading}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setNeedsOtp(false); setOtp(''); }}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
            
            {needsOtp && (
              <Input
                label="Código de verificación"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                pattern="[0-9]{6}"
                disabled={isLoading}
                autoFocus
                required
              />
            )}
            {error && <p role="alert" className="login-error text-sm font-medium text-center">{error}</p>}

            <Button type="submit" variant="primary" className="login-submit w-full py-2.5" isLoading={isLoading}>
                {needsOtp ? 'Verificar código' : 'Iniciar sesión'}
            </Button>
          </form>
        </Card>
        <Link href="/" className="mt-6 flex items-center justify-center gap-2 text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} /> Volver al portafolio
        </Link>
      </motion.div>
    </div>
  );
}
