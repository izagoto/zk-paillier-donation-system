import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { getPostLoginPath } from '../lib/flow';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Masuk ke akun Anda"
      subtitle="Kelola campaign dan kirim donasi dengan bukti kriptografis."
      footer={
        <p>
          Belum punya akun? Hubungi administrator TrustGive untuk pendaftaran.
        </p>
      }
    >
      <LoginForm onSuccess={(role) => navigate(getPostLoginPath(role))} />
    </AuthLayout>
  );
}
