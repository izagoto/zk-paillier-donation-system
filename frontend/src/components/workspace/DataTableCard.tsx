import type { ReactNode } from 'react';

type Props = {
  toolbar?: ReactNode;
  children: ReactNode;
  /**
   * Toolbar tetap di atas; isi kartu yang scroll.
   * `fill` — kartu mengisi sisa tinggi (grid campaign).
   * `auto` — tinggi mengikuti konten; scroll hanya jika melebihi area tersedia.
   */
  scrollBody?: boolean | 'fill' | 'auto';
};

/** Kartu tunggal: toolbar (cari/filter) + tabel / skeleton / empty. */
export function DataTableCard({ toolbar, children, scrollBody }: Props) {
  const scrollMode =
    scrollBody === true || scrollBody === 'fill'
      ? 'fill'
      : scrollBody === 'auto'
        ? 'auto'
        : null;

  if (scrollMode === 'fill') {
    return (
      <div className="tg-data-table-card flex min-h-0 flex-1 flex-col overflow-hidden">
        {toolbar ? (
          <div className="tg-data-table__toolbar shrink-0">{toolbar}</div>
        ) : null}
        <div className="tg-scroll-y min-h-0 flex-1 basis-0">{children}</div>
      </div>
    );
  }

  if (scrollMode === 'auto') {
    return (
      <div className="tg-data-table-card flex max-h-full min-h-0 w-full flex-col overflow-hidden">
        {toolbar ? (
          <div className="tg-data-table__toolbar shrink-0">{toolbar}</div>
        ) : null}
        <div className="tg-scroll-y min-h-0 overflow-y-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="tg-data-table-card overflow-hidden">
      {toolbar ? <div className="tg-data-table__toolbar">{toolbar}</div> : null}
      {children}
    </div>
  );
}
