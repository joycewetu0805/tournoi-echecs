import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

export function Modal({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className={clsx('w-full max-w-xl rounded-2xl border border-white/10 bg-base-900 p-6 shadow-card', className)} {...props} />
    </div>
  );
}
