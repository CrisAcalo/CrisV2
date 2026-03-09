'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// ─── Variant definitions using CSS custom properties ──────────────────────────
// Inline style sets --_bg, --_fg, --_border, --_bg-h, --_fg-h, --_shadow-h
// The .btn class reads those vars. This approach is 100% immune to build purging.
// ─────────────────────────────────────────────────────────────────────────────

type VariantKey =
  | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'info'
  | 'primary-light' | 'secondary-light' | 'danger-light' | 'info-light'
  | 'success-light' | 'warning-light' | 'ghost-light';

const VARIANTS: Record<VariantKey, React.CSSProperties> = {
  primary: {
    // @ts-ignore
    '--_bg': 'var(--accent)',
    '--_fg': '#fff',
    '--_border': 'none',
    '--_shadow': '0 1px 3px rgba(0,0,0,0.15)',
    '--_bg-h': 'var(--accent-hover)',
    '--_shadow-h': '0 0 20px var(--accent-glow)',
  } as React.CSSProperties,
  secondary: {
    // @ts-ignore
    '--_bg': 'var(--surface-raised)',
    '--_fg': 'var(--text-primary)',
    '--_border': '1px solid var(--surface-border)',
    '--_bg-h': 'var(--surface-border)',
  } as React.CSSProperties,
  outline: {
    // @ts-ignore
    '--_bg': 'transparent',
    '--_fg': 'var(--text-secondary)',
    '--_border': '1px solid var(--surface-border)',
    '--_bg-h': 'var(--surface-raised)',
    '--_fg-h': 'var(--text-primary)',
  } as React.CSSProperties,
  ghost: {
    // @ts-ignore
    '--_bg': 'transparent',
    '--_fg': 'var(--text-secondary)',
    '--_border': '1px solid transparent',
    '--_bg-h': 'var(--surface-raised)',
    '--_fg-h': 'var(--text-primary)',
  } as React.CSSProperties,
  danger: {
    // @ts-ignore
    '--_bg': '#dc2626',
    '--_fg': '#fff',
    '--_border': 'none',
    '--_shadow': '0 1px 3px rgba(0,0,0,0.15)',
    '--_bg-h': '#b91c1c',
    '--_shadow-h': '0 0 18px rgba(220,38,38,0.35)',
  } as React.CSSProperties,
  info: {
    // @ts-ignore
    '--_bg': '#0891b2',
    '--_fg': '#fff',
    '--_border': 'none',
    '--_shadow': '0 1px 3px rgba(0,0,0,0.15)',
    '--_bg-h': '#0e7490',
    '--_shadow-h': '0 0 18px rgba(8,145,178,0.35)',
  } as React.CSSProperties,
  'primary-light': {
    // @ts-ignore
    '--_bg': 'transparent',
    '--_fg': 'var(--accent)',
    '--_border': '1px solid var(--accent)',
    '--_bg-h': 'var(--accent)',
    '--_fg-h': '#fff',
    '--_shadow-h': '0 0 18px var(--accent-glow)',
  } as React.CSSProperties,
  'secondary-light': {
    // @ts-ignore
    '--_bg': 'transparent',
    '--_fg': 'var(--text-secondary)',
    '--_border': '1px solid var(--surface-border)',
    '--_bg-h': 'var(--surface-raised)',
    '--_fg-h': 'var(--text-primary)',
  } as React.CSSProperties,
  'danger-light': {
    // @ts-ignore
    '--_bg': 'transparent',
    '--_fg': '#dc2626',
    '--_border': '1px solid #dc2626',
    '--_bg-h': '#dc2626',
    '--_fg-h': '#fff',
    '--_shadow-h': '0 0 18px rgba(220,38,38,0.3)',
  } as React.CSSProperties,
  'info-light': {
    // @ts-ignore
    '--_bg': 'transparent',
    '--_fg': '#0891b2',
    '--_border': '1px solid #0891b2',
    '--_bg-h': '#0891b2',
    '--_fg-h': '#fff',
    '--_shadow-h': '0 0 18px rgba(8,145,178,0.3)',
  } as React.CSSProperties,
  'success-light': {
    // @ts-ignore
    '--_bg': 'transparent',
    '--_fg': '#16a34a',
    '--_border': '1px solid #16a34a',
    '--_bg-h': '#16a34a',
    '--_fg-h': '#fff',
    '--_shadow-h': '0 0 18px rgba(22,163,74,0.3)',
  } as React.CSSProperties,
  'warning-light': {
    // @ts-ignore
    '--_bg': 'transparent',
    '--_fg': '#d97706',
    '--_border': '1px solid #d97706',
    '--_bg-h': '#d97706',
    '--_fg-h': '#fff',
    '--_shadow-h': '0 0 18px rgba(217,119,6,0.3)',
  } as React.CSSProperties,
  'ghost-light': {
    // @ts-ignore
    '--_bg': 'transparent',
    '--_fg': 'var(--text-muted)',
    '--_border': '1px solid var(--surface-border)',
    '--_bg-h': 'var(--surface-raised)',
    '--_fg-h': 'var(--text-primary)',
  } as React.CSSProperties,
};

const SIZES: Record<string, React.CSSProperties> = {
  sm: { height: '2rem',   padding: '0 0.625rem', fontSize: '0.8125rem' },
  md: { height: '2.5rem', padding: '0 1rem',     fontSize: '0.875rem' },
  lg: { height: '3rem',   padding: '0 1.5rem',   fontSize: '1rem' },
};

interface ButtonProps {
  variant?: VariantKey;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

type MotionButtonProps = HTMLMotionProps<'button'> & ButtonProps;

export const Button: React.FC<MotionButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const variantStyle = VARIANTS[variant] ?? VARIANTS.primary;
  const sizeStyle = SIZES[size] ?? SIZES.md;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      // 'btn' class in globals.css reads the --_* CSS custom properties
      className={`btn ${className}`}
      disabled={isLoading || disabled}
      style={{ ...variantStyle, ...sizeStyle, ...style }}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
};
