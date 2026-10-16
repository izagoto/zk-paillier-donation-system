import { Link, type LinkProps } from 'react-router-dom';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  block?: boolean;
};

function variantClass(variant: ButtonProps['variant']) {
  if (variant === 'secondary') {
    return 'tg-btn--secondary';
  }
  if (variant === 'ghost') {
    return 'tg-btn--ghost';
  }
  return 'tg-btn--primary';
}

export function Button({
  variant = 'primary',
  block,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`tg-btn ${variantClass(variant)} ${block ? 'tg-btn--block' : ''} ${className}`}
      {...props}
    />
  );
}

type ButtonLinkProps = LinkProps & {
  variant?: 'primary' | 'secondary' | 'ghost';
  block?: boolean;
};

export function ButtonLink({
  variant = 'primary',
  block,
  className = '',
  ...props
}: ButtonLinkProps) {
  const linkColor =
    variant === 'primary'
      ? 'text-white no-underline hover:text-white'
      : 'no-underline';

  return (
    <Link
      className={`tg-btn ${variantClass(variant)} ${block ? 'tg-btn--block' : ''} ${linkColor} ${className}`}
      {...props}
    />
  );
}
