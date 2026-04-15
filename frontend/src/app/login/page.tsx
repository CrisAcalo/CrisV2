'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Input, Button } from '../../presentation/components/common';
import { AuthUseCase } from '../../application/use-cases/AuthUseCase';
import { useAuthStore } from '../../application/stores/useAuthStore';
import { motion } from 'framer-motion';

import { ThemeToggle } from '../../presentation/components/common/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login, token } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (token) router.replace('/admin');
  }, [token, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthUseCase.login(email, password);
      login(response.data.user, response.data.token);
      localStorage.setItem('token', response.data.token);
      router.push('/admin');
    } catch (error: any) {
      console.error(error);
      setError('Credenciales inválidas o error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      {/* Top right floating theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="card-surface p-8 w-full border-0">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Autenticación</h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Ingresa tus credenciales de administrador</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            
            {error && (
              <p className="text-sm text-red-500 font-medium text-center">{error}</p>
            )}

            <Button type="submit" variant="primary" className="w-full py-2.5" isLoading={isLoading}>
              Iniciar Sesión
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
