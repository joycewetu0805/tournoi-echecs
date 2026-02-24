import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border border-white/10 bg-base-800 px-3 py-1 text-xs uppercase tracking-widest text-steel-300',
        className
      )}
      {...props}
    />
  );
}
