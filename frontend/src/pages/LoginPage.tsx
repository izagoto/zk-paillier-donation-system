import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

function IconUser() {
  return (
    <svg className="auth-input__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 1 0-0.001-8.001A4 4 0 0 0 12 12Zm0 2c-4.418 0-8 2.015-8 4.5V19h16v-.5c0-2.485-3.582-4.5-8-4.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="auth-input__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 10V8a4 4 0 1 1 8 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h4V8a2 2 0 1 0-4 0v2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconEyeOpen() {
  return (
    <svg className="auth-input__toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconEyeClosed() {
  return (
    <svg className="auth-input__toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M4 4l16 16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="auth-input">
          <IconUser />
          <input
            className="auth-input__field"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            aria-label="Email"
            required
          />
        </div>

        <div className="auth-input auth-input--password">
          <IconLock />
          <input
            className="auth-input__field"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            required
          />
          <button
            type="button"
            className="auth-input__toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <IconEyeClosed /> : <IconEyeOpen />}
          </button>
        </div>

        {error ? (
          <Alert variant="error" className="auth-form__alert">
            {error}
          </Alert>
        ) : null}

        <Button type="submit" loading={loading} className="auth-form__submit btn--block">
          Masuk
        </Button>
      </form>
    </AuthLayout>
  );
}
