import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Spinner } from './components/ui/Spinner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { canCreateCampaign } from './lib/roles';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { CampaignListPage } from './pages/CampaignListPage';
import { CreateCampaignPage } from './pages/CreateCampaignPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

function ProtectedOrganizer({ children }: { children: React.ReactNode }) {
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
    return <Navigate to="/campaigns" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/campaigns" element={<CampaignListPage />} />
        <Route
          path="/campaigns/new"
          element={
            <ProtectedOrganizer>
              <CreateCampaignPage />
            </ProtectedOrganizer>
          }
        />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
