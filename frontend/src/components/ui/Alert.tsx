type Variant = 'error' | 'success' | 'info';

export function Alert({
  variant,
  title,
  children,
  className = '',
}: {
  variant: Variant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`alert alert--${variant} ${className}`.trim()} role="alert">
      {title ? <strong className="alert__title">{title}</strong> : null}
      <div>{children}</div>
    </div>
  );
}
