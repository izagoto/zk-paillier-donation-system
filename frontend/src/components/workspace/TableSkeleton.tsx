export function TableSkeleton({
  rows = 5,
  embedded,
}: {
  rows?: number;
  embedded?: boolean;
}) {
  if (embedded) {
    return (
      <div className="bg-white">
        <div className="border-b border-[#e4e4e7] bg-[#fafafa] px-6 py-3">
          <div className="h-4 w-44 animate-pulse rounded bg-zinc-200/80" />
        </div>
        <div className="divide-y divide-[#e4e4e7]/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-6 px-6 py-4">
            <div className="h-4 flex-1 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
        <div className="border-t border-[#e4e4e7] bg-[#fafafa] px-6 py-4">
          <div className="h-3 w-40 animate-pulse rounded bg-zinc-200/70" />
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tg-data-table overflow-hidden">
      <div className="border-b border-[#e4e4e7] bg-[#f4f4f5] px-6 py-4">
        <div className="h-4 w-56 animate-pulse rounded bg-zinc-200/80" />
      </div>
      <div className="divide-y divide-[#e4e4e7]/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-6 bg-white px-6 py-4">
            <div className="h-4 flex-1 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>
      <div className="border-t border-[#e4e4e7] bg-[#fafafa] px-6 py-4">
        <div className="h-3 w-40 animate-pulse rounded bg-zinc-200/70" />
      </div>
    </div>
  );
}
