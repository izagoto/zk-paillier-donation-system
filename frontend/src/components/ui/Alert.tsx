type Variant = 'error' | 'success' | 'info';

export function Alert({
  variant,
  title,
  children,
}: {
  variant: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`alert alert--${variant}`} role="alert">
      {title ? <strong className="alert__title">{title}</strong> : null}
      <div>{children}</div>
    </div>
  );
}
