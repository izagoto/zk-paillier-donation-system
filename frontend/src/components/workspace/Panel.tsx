import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  titleIcon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  flush?: boolean;
  className?: string;
};

export function Panel({
  title,
  subtitle,
  titleIcon: TitleIcon,
  actions,
  children,
  flush,
  className = '',
}: Props) {
  return (
    <section className={`tg-panel ${className}`}>
      <header className="tg-panel__header flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          {TitleIcon ? (
            <TitleIcon
              className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
              strokeWidth={1.75}
              aria-hidden
            />
          ) : null}
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      <div className={flush ? 'p-0' : 'tg-panel__body'}>{children}</div>
    </section>
  );
}
