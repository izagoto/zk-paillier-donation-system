import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { TrustGiveLogo } from '../TrustGiveLogo';
import { ButtonLink } from '../workspace/Button';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3.5 py-2.5 text-[length:var(--text-header-nav)] font-semibold transition-colors ${
    isActive
      ? 'bg-blue-50 text-trust-primary'
      : 'text-slate-600 hover:bg-slate-50 hover:text-trust-navy'
  }`;

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('public-shell-active');
    return () => document.body.classList.remove('public-shell-active');
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-trust-bg">
      <header className="z-40 shrink-0 border-b border-trust-border bg-white">
        <div className="mx-auto flex h-[var(--height-header)] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <TrustGiveLogo linkToHome className="text-trust-navy" />

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Utama"
          >
            <NavLink to="/" className={navLinkClass} end>
              Beranda
            </NavLink>
            <NavLink to="/campaigns" className={navLinkClass}>
              Jelajahi campaign
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink to="/login" className="hidden sm:inline-flex">
              Masuk
            </ButtonLink>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-trust-border text-trust-navy md:hidden"
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-trust-border bg-trust-surface px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              <NavLink
                to="/"
                className={navLinkClass}
                end
                onClick={() => setMobileOpen(false)}
              >
                Beranda
              </NavLink>
              <NavLink
                to="/campaigns"
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                Jelajahi campaign
              </NavLink>
              <ButtonLink
                to="/login"
                block
                className="mt-2"
                onClick={() => setMobileOpen(false)}
              >
                Masuk
              </ButtonLink>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex min-h-0 flex-1 basis-0 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 basis-0 flex-col overflow-hidden">
          <Outlet />
        </div>
      </main>

      <footer className="shrink-0 border-t border-trust-border bg-trust-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-trust-muted sm:px-6 lg:px-8">
          <p className="max-w-2xl text-trust-navy">
            TrustGive membantu pengelola campaign menerima donasi dengan jejak yang
            dapat diaudit, sambil menjaga privasi nominal donatur.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            © {new Date().getFullYear()} TrustGive
          </p>
        </div>
      </footer>
    </div>
  );
}
