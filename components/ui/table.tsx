import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={clsx('w-full text-left text-sm', className)} {...props} />;
}

export function Th({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <th className={clsx('py-3 text-xs uppercase tracking-widest text-steel-500', className)} {...props} />;
}

export function Td({ className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={clsx('py-3 text-steel-100', className)} {...props} />;
}
