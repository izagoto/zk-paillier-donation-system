import type { ReactNode } from 'react';

type Props = {
  className?: string;
  toolbar?: ReactNode;
  children: ReactNode;
  /**
   * `fill` — kartu mengisi sisa tinggi (grid / konten panjang).
   * Tanpa opsi — tinggi mengikuti isi (disarankan untuk DataTable).
   */
  scrollBody?: boolean | 'fill';
};

/** Kartu tunggal: toolbar (cari/filter) + tabel / skeleton / empty. */
export function DataTableCard({
  className = '',
  toolbar,
  children,
  scrollBody,
}: Props) {
  const fill = scrollBody === true || scrollBody === 'fill';

  if (fill) {
    return (
      <div
        className={`tg-data-table-card tg-data-table-card--fill flex min-h-0 flex-1 flex-col overflow-hidden ${className}`.trim()}
      >
        {toolbar ? (
          <div className="tg-data-table__toolbar shrink-0">{toolbar}</div>
        ) : null}
        <div className="tg-data-table-card__body min-h-0 flex-1 basis-0">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`tg-data-table-card flex w-full shrink-0 flex-col self-start overflow-hidden ${className}`.trim()}
    >
      {toolbar ? <div className="tg-data-table__toolbar">{toolbar}</div> : null}
      {children}
    </div>
  );
}
