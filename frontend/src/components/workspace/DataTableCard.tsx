import type { ReactNode } from 'react';

type Props = {
  toolbar?: ReactNode;
  children: ReactNode;
};

/** Kartu tunggal: toolbar (cari/filter) + tabel / skeleton / empty. */
export function DataTableCard({ toolbar, children }: Props) {
  return (
    <div className="tg-data-table-card overflow-hidden">
      {toolbar ? <div className="tg-data-table__toolbar">{toolbar}</div> : null}
      {children}
    </div>
  );
}
