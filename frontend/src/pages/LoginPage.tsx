import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { getPostLoginPath } from '../lib/flow';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      title="Masuk ke akun Anda"
      subtitle="Masuk dengan email dan password yang sudah terdaftar."
    >
      <LoginForm onSuccess={(role) => navigate(getPostLoginPath(role))} />
    </AuthLayout>
  );
}
