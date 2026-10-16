import { Link } from 'react-router-dom';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__brand">
          <div className="auth-card__decor" aria-hidden>
            <span className="auth-card__circle auth-card__circle--1" />
            <span className="auth-card__circle auth-card__circle--2" />
            <span className="auth-card__circle auth-card__circle--3" />
            <span className="auth-card__circle auth-card__circle--4" />
          </div>
          <div className="auth-brand">
            <Link to="/" className="auth-brand__logo">
              <span className="auth-brand__logo-mark" aria-hidden />
              <span className="auth-brand__logo-text">TrustGive</span>
            </Link>
            <p className="auth-brand__tag">Platform donasi dapat diaudit</p>
            <h2 className="auth-brand__headline">
              Transparansi tanpa membuka setiap nominal ke publik
            </h2>
            <ul className="auth-brand__list">
              <li>Pencatatan donasi pada blockchain (Hardhat demo)</li>
              <li>Agregasi nominal terenkripsi homomorfik Paillier</li>
              <li>Bukti zk-SNARK untuk rentang nominal yang sah</li>
            </ul>
          </div>
        </div>

        <div className="auth-card__form">
          <div className="auth-form-wrap">
            <header className="auth-form__header">
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </header>
            {children}
            {footer ? <footer className="auth-form__footer">{footer}</footer> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
