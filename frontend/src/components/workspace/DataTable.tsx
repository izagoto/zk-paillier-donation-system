import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
  type WheelEvent,
} from 'react';
import { useLocation } from 'react-router-dom';
import { shouldScrollTableBody, VISIBLE_BODY_ROWS } from '../../lib/dataTableScroll';
import {
  readStoredPageSize,
  writeStoredPageSize,
} from '../../lib/dataTablePageSizeStorage';
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
  /** Isi sisa tinggi parent (tab panel); scroll body jika baris > ambang. */
  scrollBody?: 'fill';
  /** Jumlah baris tbody tanpa scroll; baris ke-(N+1)+ memicu scroll body. */
  visibleBodyRows?: number;
  /** Kunci sessionStorage untuk page size (default: pathname). */
  pageSizeStorageKey?: string;
  /** Tinggi perkiraan satu baris tbody untuk area `--paged` (rem). */
  pagedRowHeightRem?: number;
  className?: string;
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
  scrollBody,
  visibleBodyRows = VISIBLE_BODY_ROWS,
  pageSizeStorageKey,
  pagedRowHeightRem = 3.25,
  className = '',
}: DataTableProps<T>) {
  const { pathname } = useLocation();
  const pageSizeKey = pageSizeStorageKey ?? pathname;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    readStoredPageSize(pageSizeKey, defaultPageSize, pageSizeOptions),
  );
  const headHostRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  const setPageSizePersisted = useCallback(
    (size: number) => {
      setPageSize(size);
      writeStoredPageSize(pageSizeKey, size);
    },
    [pageSizeKey],
  );

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
  const rowsOnPage = pageData.length;
  const overVisibleRows = shouldScrollTableBody(rowsOnPage, visibleBodyRows);
  /** Kartu `scrollBody="fill"`: ≥ ambang baris pakai layout fill (sama tab Semua & Aktif). */
  const fillActive =
    scrollBody === 'fill' &&
    rowsOnPage > 0 &&
    (overVisibleRows || rowsOnPage >= visibleBodyRows);
  const pagedScroll = scrollBody !== 'fill' && overVisibleRows;

  const rootClass =
    variant === 'card'
      ? 'tg-data-table'
      : 'tg-data-table tg-data-table--embedded';

  const bodyScrollClass = [
    'tg-data-table__body-scroll',
    fillActive ? 'tg-data-table__body-scroll--fill' : '',
    pagedScroll ? 'tg-data-table__body-scroll--paged' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const tableStyle = { minWidth };

  function syncHeadScroll(event: UIEvent<HTMLDivElement>) {
    const left = event.currentTarget.scrollLeft;
    if (headHostRef.current) {
      headHostRef.current.scrollLeft = left;
    }
  }

  function containBodyWheel(event: WheelEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    if (el.scrollHeight <= el.clientHeight) {
      return;
    }
    const { scrollTop, clientHeight, scrollHeight } = el;
    const delta = event.deltaY;
    const atTop = scrollTop <= 0 && delta < 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && delta > 0;
    if (!atTop && !atBottom) {
      event.stopPropagation();
    }
  }

  const rootExtra = [
    fillActive ? 'tg-data-table--fill min-h-0 flex-1' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${rootClass} ${rootExtra}`.trim()}>
      {showEntriesSelector ? (
        <div className="tg-data-table__entries-bar relative z-20 shrink-0">
          <label className="tg-data-table__entries-label">
            <span>Tampilkan</span>
            <SelectMenu
              value={pageSize}
              onChange={setPageSizePersisted}
              mono
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

      <div
        className={`tg-data-table__main ${fillActive ? 'tg-data-table__main--fill' : ''}`}
      >
        <div ref={headHostRef} className="tg-data-table__head-host">
          <table className="tg-data-table__table" style={tableStyle}>
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
          </table>
        </div>

        <div
          ref={bodyScrollRef}
          className={bodyScrollClass}
          style={
            pagedScroll
              ? {
                  ['--tg-data-table-paged-rows' as string]: visibleBodyRows,
                  ['--tg-data-table-row-height' as string]: `${pagedRowHeightRem}rem`,
                }
              : undefined
          }
          onScroll={syncHeadScroll}
          onWheel={containBodyWheel}
        >
          <table className="tg-data-table__table" style={tableStyle}>
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
      </div>

      {showFooter ? (
        <div className="tg-data-table__footer">
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
  );
}
