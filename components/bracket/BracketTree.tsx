import { clsx } from 'clsx';

export type BracketNode = {
  id: string;
  label: string;
  score?: string;
  highlight?: boolean;
  children?: BracketNode[];
};

export function BracketTree({ data }: { data: BracketNode }) {
  return (
    <div className="flex items-start gap-10 overflow-x-auto pb-4">
      <BracketColumn nodes={[data]} depth={0} />
    </div>
  );
}

function BracketColumn({ nodes, depth }: { nodes: BracketNode[]; depth: number }) {
  return (
    <div className="flex flex-col gap-6">
      {nodes.map((node) => (
        <div key={node.id} className="flex flex-col gap-3">
          <div
            className={clsx(
              'rounded-xl border border-white/10 bg-base-800 px-4 py-3 text-sm',
              node.highlight && 'border-neon-400/60 shadow-glow'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-steel-100">{node.label}</span>
              {node.score && <span className="text-accent-400">{node.score}</span>}
            </div>
          </div>
          {node.children && node.children.length > 0 && (
            <div className="flex gap-10">
              <BracketColumn nodes={node.children} depth={depth + 1} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
