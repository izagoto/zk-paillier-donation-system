import type { DayDonationStat } from '../api/client';

type Props = {
  data: DayDonationStat[];
  days: number;
};

function lastDays(days: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

export function OrganizerDonationChart({ data, days }: Props) {
  const byDate = new Map(data.map((row) => [row.date, row.count]));
  const labels = lastDays(days);
  const max = Math.max(1, ...labels.map((date) => byDate.get(date) ?? 0));

  return (
    <div className="flex items-end gap-2" aria-label="Donasi terkonfirmasi per hari">
      {labels.map((date) => {
        const count = byDate.get(date) ?? 0;
        const height = `${Math.round((count / max) * 100)}%`;
        return (
          <div key={date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end justify-center rounded-md bg-zinc-50 px-0.5">
              <div
                className="w-full max-w-[2rem] rounded-t bg-trust-primary transition-all"
                style={{ height }}
                title={`${date}: ${count} donasi`}
              />
            </div>
            <span className="text-[10px] tabular-nums text-zinc-500">
              {date.slice(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
