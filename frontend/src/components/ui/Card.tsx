import type { ReactNode } from 'react';

type Props = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: 'md' | 'lg';
};

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  padding = 'lg',
}: Props) {
  return (
    <section className={`card card--${padding} ${className}`.trim()}>
      {(title || action) && (
        <header className="card__header">
          <div>
            {title ? <h2 className="card__title">{title}</h2> : null}
            {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
          </div>
          {action}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  );
}
