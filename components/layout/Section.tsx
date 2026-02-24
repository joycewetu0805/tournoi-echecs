import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Section({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={clsx('px-6 py-10 md:px-12', className)} {...props} />;
}
