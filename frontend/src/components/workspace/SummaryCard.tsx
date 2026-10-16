import type { LucideIcon } from 'lucide-react';

type Props = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  /** Warna stroke ikon — default abu-biru netral */
  iconColor?: string;
  accent?: 'blue' | 'emerald' | 'amber' | 'slate';
};

const iconColors: Record<NonNullable<Props['accent']>, string> = {
  blue: '#2563eb',
  emerald: '#059669',
  amber: '#d97706',
  slate: '#64748b',
};

export function SummaryCard({
  label,
  value,
  icon: Icon,
  hint,
  iconColor,
  accent = 'blue',
}: Props) {
  const stroke = iconColor ?? iconColors[accent];

  return (
    <div className="tg-stat-card">
      <Icon
        className="h-9 w-9 shrink-0"
        strokeWidth={1.5}
        style={{ color: stroke }}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-zinc-500">{label}</p>
        <p className="mt-1 text-[1.625rem] font-normal leading-none tracking-tight text-zinc-900">
          {value}
        </p>
        {hint ? <p className="mt-1.5 text-xs text-zinc-500">{hint}</p> : null}
      </div>
    </div>
  );
}
