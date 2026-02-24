import { clsx } from 'clsx';

const phases = ['Pool', 'Quarter', 'Semi', 'Final'];

export function Timeline({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-2">
      {phases.map((phase, index) => (
        <div key={phase} className="flex items-center gap-3 whitespace-nowrap">
          <div
            className={clsx(
              'h-3 w-3 rounded-full border',
              index <= current ? 'border-accent-400 bg-accent-400' : 'border-white/20'
            )}
          />
          <span className={clsx('text-xs uppercase tracking-widest', index <= current ? 'text-accent-400' : 'text-steel-500')}>{phase}</span>
          {index < phases.length - 1 && <div className="h-px w-8 bg-white/10" />}
        </div>
      ))}
    </div>
  );
}
