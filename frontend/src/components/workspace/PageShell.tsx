import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  breadcrumbsForPath,
  pageIconForPath,
  type BreadcrumbOptions,
} from '../../lib/navigation';

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Crumb terakhir (mis. judul campaign); breadcrumb parent tetap otomatis. */
  breadcrumb?: BreadcrumbOptions;
  /**
   * `page-scroll` (default): area konten halaman yang scroll.
   * `pane`: judul tetap; anak mengisi sisa tinggi (mis. kartu dengan toolbar tetap).
   */
  contentLayout?: 'page-scroll' | 'pane';
};

export function PageShell({
  title,
  subtitle,
  actions,
  children,
  breadcrumb,
  contentLayout = 'page-scroll',
}: Props) {
  const { pathname, search } = useLocation();
  const { user } = useAuth();
  const crumbs = breadcrumbsForPath(pathname, search, user?.role, breadcrumb);
  const PageIcon = user
    ? pageIconForPath(pathname, search, user.role)
    : null;

  return (
    <div className="tg-shell-width flex min-h-0 flex-1 basis-0 flex-col overflow-hidden py-4 sm:py-5">
      <nav
        className="mb-3 flex shrink-0 flex-wrap items-center gap-x-1.5 text-xs text-zinc-500"
        aria-label="Breadcrumb"
      >
        {crumbs.map((item, index) => (
          <span key={`${item.label}-${index}`} className="inline-flex items-center">
            {index > 0 ? <span className="mx-1.5 text-zinc-300">/</span> : null}
            {item.to ? (
              <Link
                to={item.to}
                className="text-zinc-500 hover:text-zinc-900"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  index === crumbs.length - 1
                    ? 'max-w-[14rem] truncate text-zinc-700 sm:max-w-md'
                    : ''
                }
                title={index === crumbs.length - 1 ? item.label : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <header className="mb-4 flex shrink-0 flex-col gap-4 border-b border-zinc-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
            {PageIcon ? (
              <PageIcon
                className="h-5 w-5 shrink-0 text-zinc-400"
                strokeWidth={1.75}
                aria-hidden
              />
            ) : null}
            <span className="min-w-0 truncate">{title}</span>
          </h1>
          {subtitle ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-500">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </header>

      <div
        className={
          contentLayout === 'pane'
            ? 'flex min-h-0 flex-1 basis-0 flex-col overflow-hidden'
            : 'tg-scroll-y min-h-0 flex-1 basis-0 pr-0.5'
        }
      >
        <div
          className={
            contentLayout === 'pane'
              ? 'tg-page-stack flex min-h-0 flex-1 flex-col overflow-hidden'
              : 'tg-page-stack'
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
