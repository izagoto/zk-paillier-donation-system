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
  footer: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="auth-page__panel auth-page__panel--brand">
        <div className="auth-brand">
          <Link to="/" className="brand brand--light">
            <span className="brand__mark" aria-hidden />
            <span className="brand__text">
              <span className="brand__name">TrustGive</span>
              <span className="brand__tag">Platform donasi dapat diaudit</span>
            </span>
          </Link>
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
      <div className="auth-page__panel auth-page__panel--form">
        <div className="auth-form-wrap">
          <header className="auth-form__header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          {children}
          <footer className="auth-form__footer">{footer}</footer>
        </div>
      </div>
    </div>
  );
}
