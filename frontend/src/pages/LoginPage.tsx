import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Field, Input } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Masuk ke akun Anda"
      subtitle="Kelola campaign dan kirim donasi dengan bukti kriptografis."
      footer={
        <p>
          Akun demo disediakan untuk keperluan penelitian. Hubungi pengelola
          sistem jika belum memiliki kredensial.
        </p>
      }
    >
      <form className="form-stack" onSubmit={onSubmit}>
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>
        {error ? (
          <Alert variant="error">{error}</Alert>
        ) : null}
        <Button type="submit" loading={loading} className="btn--block">
          Masuk
        </Button>
      </form>
    </AuthLayout>
  );
}
