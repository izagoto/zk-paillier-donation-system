import { useEffect } from 'react';
import { TrustGiveLogo } from './TrustGiveLogo';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    document.body.classList.add('auth-page-active');
    return () => document.body.classList.remove('auth-page-active');
  }, []);

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
            <TrustGiveLogo
              linkToHome
              onDark
              className="auth-brand__logo mb-1 justify-center"
            />
            <p className="auth-brand__tag">Donasi dapat diaudit</p>
            <h2 className="auth-brand__headline">
              Transparansi campaign, privasi nominal donatur
            </h2>
            <ul className="auth-brand__list">
              <li>Jejak donasi on-chain</li>
              <li>Agregat terenkripsi (Paillier)</li>
              <li>Bukti zk untuk nominal sah</li>
            </ul>
          </div>
        </div>

        <div className="auth-card__form">
          <div className="auth-form-wrap">
            <header className="auth-form__header">
              <h1>{title}</h1>
              {subtitle ? <p>{subtitle}</p> : null}
            </header>
            {children}
            {footer ? <footer className="auth-form__footer">{footer}</footer> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
