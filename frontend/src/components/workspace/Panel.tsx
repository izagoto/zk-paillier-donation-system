import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  title?: string;
  subtitle?: string;
  titleIcon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  flush?: boolean;
  className?: string;
  /** Header tetap; isi panel yang scroll (`fill` = isi sisa tinggi halaman). */
  scrollBody?: 'fill' | 'auto';
};

export function Panel({
  title,
  subtitle,
  titleIcon: TitleIcon,
  actions,
  children,
  flush,
  className = '',
  scrollBody,
}: Props) {
  const bodyClass = flush ? 'p-0' : 'tg-panel__body';

  const header =
    title || subtitle || actions || TitleIcon ? (
      <header className="tg-panel__header flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          {TitleIcon ? (
            <TitleIcon
              className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
              strokeWidth={1.75}
              aria-hidden
            />
          ) : null}
          <div>
            {title ? (
              <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </header>
    ) : null;

  if (scrollBody === 'fill') {
    return (
      <section
        className={`tg-panel flex min-h-0 flex-1 flex-col overflow-hidden ${className}`}
      >
        {header ?? null}
        <div className={`tg-scroll-y min-h-0 flex-1 basis-0 ${bodyClass}`}>
          {children}
        </div>
      </section>
    );
  }

  if (scrollBody === 'auto') {
    return (
      <section
        className={`tg-panel flex max-h-full min-h-0 w-full flex-col overflow-hidden ${className}`}
      >
        {header}
        <div className={`tg-scroll-y min-h-0 overflow-y-auto ${bodyClass}`}>
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className={`tg-panel ${className}`}>
      {header}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}
