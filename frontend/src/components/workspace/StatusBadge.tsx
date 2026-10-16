import { statusLabel } from '../../lib/format';

const tones: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  draft: 'bg-slate-50 text-slate-600 border-slate-200',
  closed: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function StatusBadge({ status }: { status: string }) {
  const tone =
    tones[status] ?? 'bg-slate-50 text-slate-600 border-slate-200';
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-mono font-semibold ${tone}`}
    >
      {statusLabel(status)}
    </span>
  );
}
