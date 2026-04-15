import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  neon?: boolean;
}

export const GlassCard = ({ children, className = '', glow = false, neon = false }: GlassCardProps) => {
  return (
    <div className={`glass rounded-2xl p-6 md:p-8 transition-transform duration-300 hover:-translate-y-1 ${glow ? 'glow-accent' : ''} ${neon ? 'neon-box' : ''} ${className}`}>
      {children}
    </div>
  );
};
