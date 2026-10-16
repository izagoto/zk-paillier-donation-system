import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          <Link to="/" className="brand">
            <span className="brand__mark" aria-hidden />
            <span className="brand__text">
              <span className="brand__name">TrustGive</span>
              <span className="brand__tag">ZK · Paillier · Blockchain</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Utama">
            <NavLink to="/" className="nav__link" end>
              Beranda
            </NavLink>
            <NavLink to="/campaigns" className="nav__link">
              Campaign
            </NavLink>
            {user ? (
              <NavLink to="/campaigns/new" className="nav__link">
                Buat Campaign
              </NavLink>
            ) : null}
          </nav>

          <div className="topbar__actions">
            {user ? (
              <>
                <div className="user-chip" title={user.email}>
                  <span className="user-chip__avatar" aria-hidden>
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-chip__email">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="link-btn link-btn--primary">
                  Masuk
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <p>
            Prototipe penelitian — donasi tercatat on-chain, nominal terenkripsi
            Paillier, validasi batas dengan zk-SNARK.
          </p>
          <p className="footer__muted">
            Bukan layanan keuangan produksi. Gunakan hanya di lingkungan demo
            lokal.
          </p>
        </div>
      </footer>
    </div>
  );
}
