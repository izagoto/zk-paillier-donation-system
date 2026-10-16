import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  to: string;
  icon: LucideIcon;
  label: string;
};

export function TableIconLink({ to, icon: Icon, label }: Props) {
  return (
    <Link
      to={to}
      className="inline-flex h-8 w-8 items-center justify-center rounded bg-trust-primary text-white shadow-sm transition-colors hover:bg-trust-primary-hover"
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden />
    </Link>
  );
}
