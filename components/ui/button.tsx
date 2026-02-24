import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

export function Button({ className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition',
        variant === 'primary' && 'bg-accent-400 text-base-900 hover:bg-accent-500',
        variant === 'ghost' && 'border border-white/15 text-steel-100 hover:border-accent-400 hover:text-accent-400',
        className
      )}
      {...props}
    />
  );
}
