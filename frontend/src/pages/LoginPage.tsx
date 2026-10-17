import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { getPostLoginPath } from '../lib/flow';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Masuk ke TrustGive"
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
