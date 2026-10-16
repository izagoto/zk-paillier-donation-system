import { LogOut, Mail, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/workspace/Button';
import { PageShell } from '../components/workspace/PageShell';
import { Panel } from '../components/workspace/Panel';
import { useAuth } from '../context/AuthContext';
import { displayNameFromEmail } from '../lib/displayName';
import { NAV, workspaceHomePath } from '../lib/navigation';
import { roleLabel } from '../lib/roles';

export function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const homePath = workspaceHomePath(user.role);

  return (
    <PageShell
      title={NAV.profile}
      subtitle="Informasi akun Anda di TrustGive."
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="tg-panel p-6 text-center">
          <span
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-xl font-semibold text-zinc-700"
          >
            {user.email.charAt(0).toUpperCase()}
          </span>
          <p className="mt-4 text-sm font-semibold text-trust-navy">
            {displayNameFromEmail(user.email)}
          </p>
          <p className="mt-0.5 text-xs text-trust-muted">{user.email}</p>
          <p className="mt-2 text-xs font-medium text-trust-primary">
            {roleLabel(user.role)}
          </p>
        </div>

        <Panel title="Detail akun" subtitle="Data yang digunakan saat Anda masuk.">
          <dl className="grid gap-5 sm:grid-cols-2">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-trust-muted">
                <Mail className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Email</dt>
                <dd className="mt-1 text-sm font-medium text-trust-navy">{user.email}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-trust-muted">
                <Shield className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <dt className="text-sm text-zinc-500">Peran</dt>
                <dd className="mt-1 text-sm font-medium text-trust-navy">
                  {roleLabel(user.role)}
                </dd>
              </div>
            </div>
          </dl>
          <p className="mt-6 rounded-lg bg-slate-50 px-3 py-2 text-sm text-zinc-600">
            Untuk mengubah password atau memperbarui data, hubungi administrator
            TrustGive.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to={homePath}
              className="tg-btn tg-btn--secondary text-sm no-underline"
            >
              Kembali ke {NAV.dashboard}
            </Link>
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Keluar
            </Button>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
