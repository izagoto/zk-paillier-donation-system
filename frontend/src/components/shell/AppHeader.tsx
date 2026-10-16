import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, LogOut, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPostLoginPath } from '../../lib/flow';
import { navIsActive, profilePathForRole, workspaceNavForRole } from '../../lib/navigation';
import { roleLabel } from '../../lib/roles';
import { TrustGiveLogo } from '../TrustGiveLogo';

function navLinkClass(isActive: boolean) {
  return `inline-flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[length:var(--text-header-nav)] font-semibold transition-colors whitespace-nowrap ${
    isActive
      ? 'bg-blue-50 text-trust-primary'
      : 'text-slate-600 hover:bg-slate-100 hover:text-trust-navy'
  }`;
}

export function AppHeader() {
  const { user, logout } = useAuth();
  const { pathname, search } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!user) {
    return null;
  }

  const navItems = workspaceNavForRole(user.role);
  const homePath = getPostLoginPath(user.role);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white"
    >
      <div className="tg-shell-width grid h-[var(--height-header)] grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex min-w-0 items-center justify-start">
          <TrustGiveLogo
            linkToHome
            homeTo={homePath}
            className="shrink-0 text-trust-navy"
            wordmarkClassName="hidden sm:flex"
          />
        </div>

        <nav
          className="hidden items-center justify-center gap-0.5 md:flex"
          aria-label="Navigasi workspace"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = navIsActive(item, pathname, search);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={() => navLinkClass(active)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={2} aria-hidden />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-4">
          <div
            className="hidden items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 text-[length:var(--text-header-meta)] font-semibold text-slate-800 shadow-sm lg:flex"
          >
            <span className="flex items-center gap-1.5 font-mono text-[length:var(--text-header-meta)]">
              <Clock className="h-4 w-4 text-trust-primary" aria-hidden />
              {now.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <span className="text-zinc-200">|</span>
            <span className="flex items-center gap-1.5 text-[length:var(--text-header-meta)] text-zinc-600">
              <Calendar className="h-4 w-4 text-trust-primary" aria-hidden />
              {now.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-trust-primary text-base font-bold text-white transition hover:bg-trust-primary-hover"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              {user.email.charAt(0).toUpperCase()}
            </button>

            {profileOpen ? (
              <div
                className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
                role="menu"
              >
                <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user.email}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                    {roleLabel(user.role)}
                  </p>
                </div>
                <Link
                  to={profilePathForRole(user.role)}
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 no-underline hover:bg-slate-50"
                  onClick={() => setProfileOpen(false)}
                >
                  Profil
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Keluar
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-trust-border text-trust-navy md:hidden"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-trust-border bg-trust-surface py-3 md:hidden">
          <div className="tg-shell-width">
          <nav className="flex flex-col gap-1" aria-label="Navigasi mobile">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = navIsActive(item, pathname, search);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={() => navLinkClass(active)}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={2} aria-hidden />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
