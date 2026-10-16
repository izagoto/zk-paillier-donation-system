import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui/Spinner';
import { PublicLayout } from './shell/PublicLayout';
import { WorkspaceLayout } from './shell/WorkspaceLayout';

export function Layout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-trust-bg">
        <Spinner label="Memuat sesi" />
      </div>
    );
  }

  if (user) {
    return <WorkspaceLayout />;
  }

  return <PublicLayout />;
}
