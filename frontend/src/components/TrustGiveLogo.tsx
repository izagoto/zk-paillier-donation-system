import { Link } from 'react-router-dom';

const MARK_SRC = '/trustgive-mark.svg';

type Props = {
  /** Tampilkan teks TrustGive di samping mark */
  showWordmark?: boolean;
  /** Di panel gelap (login): tagline & warna Give putih */
  onDark?: boolean;
  /** Bungkus dengan link ke beranda */
  linkToHome?: boolean;
  homeTo?: string;
  wordmarkClassName?: string;
  className?: string;
};

export function TrustGiveLogo({
  showWordmark = true,
  onDark = false,
  linkToHome = false,
  homeTo = '/',
  wordmarkClassName = '',
  className = '',
}: Props) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={MARK_SRC}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-md"
        aria-hidden
      />
      {showWordmark ? (
        <span className={`flex flex-col leading-tight ${wordmarkClassName}`}>
          <span className="text-[length:var(--text-header-brand,1.0625rem)] font-semibold tracking-tight">
            <span className={onDark ? 'text-blue-200' : 'text-trust-primary'}>
              Trust
            </span>
            <span className={onDark ? 'text-white' : 'text-[#0d1b3e]'}>Give</span>
          </span>
          {!onDark ? (
            <span className="hidden text-[11px] font-semibold text-slate-500 sm:block">
              Donasi dapat diaudit
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );

  if (linkToHome) {
    return (
      <Link to={homeTo} className="text-inherit no-underline hover:no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
