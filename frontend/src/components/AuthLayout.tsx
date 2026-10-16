import { Link } from 'react-router-dom';

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
  return (
    <div className="flex min-h-screen flex-col bg-trust-bg">
      <header className="border-b border-trust-border bg-white">
        <div className="mx-auto flex h-[var(--height-header)] max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-trust-navy no-underline hover:no-underline"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-md bg-trust-primary text-sm font-semibold text-white"
              aria-hidden
            >
              TG
            </span>
            <span className="text-sm font-semibold tracking-tight">
              <span className="text-trust-primary">Trust</span>
              <span className="text-zinc-900">Give</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-10 sm:py-12">
        <div className="w-full max-w-[26rem]">
          <div className="rounded-lg border border-trust-border bg-white p-6 shadow-[var(--shadow-trust-card)] sm:p-8">
            <header className="mb-6">
              <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
              {subtitle ? (
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                  {subtitle}
                </p>
              ) : null}
            </header>
            {children}
            {footer ? <footer className="mt-6 border-t border-zinc-100 pt-6">{footer}</footer> : null}
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-zinc-500">
            Belum punya akun? Hubungi administrator TrustGive untuk pendaftaran.
          </p>
        </div>
      </main>
    </div>
  );
}
