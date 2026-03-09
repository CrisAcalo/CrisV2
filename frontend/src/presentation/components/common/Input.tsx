'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            h-10 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-150
            placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2
            disabled:cursor-not-allowed disabled:opacity-50
            ${error
              ? 'border-red-500 focus:ring-red-500/40 bg-red-50 dark:bg-red-950/20'
              : 'border-[var(--surface-border)] bg-[var(--surface)] text-[var(--text-primary)] focus:ring-[var(--accent)] focus:border-[var(--accent)]'
            }
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</span>
        )}
        {error && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
