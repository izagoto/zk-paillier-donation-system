import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { SelectMenu } from './SelectMenu';

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T, index: number) => ReactNode;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showEntriesSelector?: boolean;
  minWidth?: string;
  /** `card` = panel putih penuh; `embedded` = hanya tabel di dalam Panel / DataTableCard */
  variant?: 'card' | 'embedded';
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = 'Tidak ada data.',
  defaultPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showEntriesSelector = true,
  minWidth = '720px',
  variant = 'card',
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, totalItems]);

  const { pageData, indexStart, indexEnd } = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = Math.min(start + pageSize, totalItems);
    return {
      pageData: data.slice(start, end),
      indexStart: start,
      indexEnd: end,
    };
  }, [data, pageSize, safePage, totalItems]);

  const showFooter = totalItems > 0;
  /** Scroll vertikal dalam tabel jika halaman ini menampilkan lebih dari 5 baris */
  const tableBodyScroll = pageData.length > 5;

  const rootClass =
    variant === 'card'
      ? 'tg-data-table'
      : 'tg-data-table tg-data-table--embedded';

  return (
    <div className={rootClass}>
      {showEntriesSelector ? (
        <div className="tg-data-table__entries-bar relative z-20">
          <label className="tg-data-table__entries-label">
            <span>Tampilkan</span>
            <SelectMenu
              value={pageSize}
              onChange={setPageSize}
              aria-label="Jumlah entri per halaman"
              options={pageSizeOptions.map((size) => ({
                value: size,
                label: size,
              }))}
            />
            <span>entri</span>
          </label>
        </div>
      ) : null}

      <div className="tg-data-table__body-clip overflow-hidden">
      <div
        className={`tg-data-table__scroll ${
          tableBodyScroll ? 'tg-data-table__scroll--body-scroll' : ''
        }`}
      >
        <table className="tg-data-table__table" style={{ minWidth }}>
          <thead className="tg-data-table__head">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={col.headerClassName}
                  scope="col"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tg-data-table__body">
            {pageData.map((row, rowIndex) => (
              <tr key={rowKey(row)} className="tg-data-table__row">
                {columns.map((col) => (
                  <td key={col.id} className={col.cellClassName}>
                    {col.render(row, indexStart + rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
            {totalItems === 0 ? (
              <tr>
                <td colSpan={columns.length} className="tg-data-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {showFooter ? (
        <div className="tg-data-table__footer border-t border-[#e4e4e7]">
          <p className="tg-data-table__range">
            Menampilkan{' '}
            <span className="font-bold text-trust-navy">{indexStart + 1}</span>{' '}
            sampai{' '}
            <span className="font-bold text-trust-navy">{indexEnd}</span> dari{' '}
            <span className="font-bold text-trust-navy">{totalItems}</span>{' '}
            entri
          </p>

          <div className="tg-data-table__pager">
            <button
              type="button"
              className="tg-data-table__page-btn"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isCurrent = pageNum === safePage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`tg-data-table__page-num ${
                    isCurrent ? 'is-active' : ''
                  }`}
                  onClick={() => setPage(pageNum)}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              className="tg-data-table__page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
