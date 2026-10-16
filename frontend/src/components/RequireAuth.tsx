import { Navigate } from 'react-router-dom';
import { Spinner } from './ui/Spinner';
import { useAuth } from '../context/AuthContext';
import {
  canAudit,
  canCreateCampaign,
  canDonate,
  canManageAdmin,
} from '../lib/roles';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="page">
        <Spinner label="Memuat sesi" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function RequireDonor({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="page">
        <Spinner label="Memuat sesi" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!canDonate(user.role)) {
    return <Navigate to="/organizer" replace />;
  }
  return children;
}

export function RequireAuditor({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="page">
        <Spinner label="Memuat sesi" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!canAudit(user.role)) {
    return <Navigate to="/campaigns" replace />;
  }
  return children;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="page">
        <Spinner label="Memuat sesi" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!canManageAdmin(user.role)) {
    return <Navigate to="/organizer" replace />;
  }
  return children;
}

export function RequireOrganizer({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="page">
        <Spinner label="Memuat sesi" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!canCreateCampaign(user.role)) {
    return <Navigate to="/donor" replace />;
  }
  return children;
}
