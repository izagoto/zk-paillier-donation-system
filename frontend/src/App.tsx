import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import {
  RequireAdmin,
  RequireAuditor,
  RequireDonor,
  RequireOrganizer,
} from './components/RequireAuth';
import { Spinner } from './components/ui/Spinner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { canCreateCampaign } from './lib/roles';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { CampaignListPage } from './pages/CampaignListPage';
import { CreateCampaignPage } from './pages/CreateCampaignPage';
import { DonorDashboardPage } from './pages/DonorDashboardPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MyDonationsPage } from './pages/MyDonationsPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { OrganizerDonationsPage } from './pages/OrganizerDonationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { DonateCampaignPage } from './pages/DonateCampaignPage';
import { VerifyDonationPage } from './pages/VerifyDonationPage';
import { AuditorDashboardPage } from './pages/AuditorDashboardPage';
import { AdminReconciliationPage } from './pages/AdminReconciliationPage';

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
    return <Navigate to="/donor" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/campaigns/new"
          element={
            <ProtectedOrganizer>
              <CreateCampaignPage />
            </ProtectedOrganizer>
          }
        />
        <Route path="/campaigns/:id/donate" element={<DonateCampaignPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/verify/donation/:id" element={<VerifyDonationPage />} />
        <Route path="/campaigns" element={<CampaignListPage />} />
        <Route
          path="/donor"
          element={
            <RequireDonor>
              <DonorDashboardPage />
            </RequireDonor>
          }
        />
        <Route
          path="/donor/donations"
          element={
            <RequireDonor>
              <MyDonationsPage />
            </RequireDonor>
          }
        />
        <Route
          path="/organizer"
          element={
            <RequireOrganizer>
              <OrganizerDashboardPage />
            </RequireOrganizer>
          }
        />
        <Route
          path="/organizer/donations"
          element={
            <RequireOrganizer>
              <OrganizerDonationsPage />
            </RequireOrganizer>
          }
        />
        <Route
          path="/admin/reconciliation"
          element={
            <RequireAdmin>
              <AdminReconciliationPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/auditor"
          element={
            <RequireAuditor>
              <AuditorDashboardPage />
            </RequireAuditor>
          }
        />
        <Route
          path="/auditor/profile"
          element={
            <RequireAuditor>
              <ProfilePage />
            </RequireAuditor>
          }
        />
        <Route
          path="/organizer/profile"
          element={
            <RequireOrganizer>
              <ProfilePage />
            </RequireOrganizer>
          }
        />
        <Route
          path="/donor/profile"
          element={
            <RequireDonor>
              <ProfilePage />
            </RequireDonor>
          }
        />
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
