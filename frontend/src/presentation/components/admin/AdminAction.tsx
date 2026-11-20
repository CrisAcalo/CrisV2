import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

type Appearance = {
  tone?: 'neutral' | 'primary' | 'danger' | 'success';
  icon?: ReactNode;
  iconOnly?: boolean;
};

export function AdminAction({
  tone = 'neutral', icon, iconOnly, pending, children, className = '', disabled, ...props
}: Appearance & ComponentProps<'button'> & { pending?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`admin-action ${className}`}
      data-tone={tone}
      data-icon-only={iconOnly || undefined}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      <span aria-hidden="true" className="admin-action-icon">
        {pending ? <LoaderCircle size={17} className="animate-spin" /> : icon}
      </span>
      <span className={iconOnly ? 'sr-only' : undefined}>{children}</span>
    </button>
  );
}

export function AdminActionLink({
  tone = 'neutral', icon, children, className = '', ...props
}: Omit<Appearance, 'iconOnly'> & ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={`admin-action ${className}`} data-tone={tone}>
      {icon && <span aria-hidden="true" className="admin-action-icon">{icon}</span>}
      {children}
    </Link>
  );
}
