import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  inset?: boolean;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  inset,
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-12 text-center ${
        inset ? 'bg-white' : 'rounded-lg border border-dashed border-zinc-200 bg-white'
      }`}
    >
      <Icon className="mb-3 h-8 w-8 text-zinc-300" strokeWidth={1.5} aria-hidden />
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
