import { Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loginErrorMessage } from '../../lib/authMessages';
import { validateLoginFields } from '../../lib/loginValidation';

type Props = {
  onSuccess?: (role: string) => void;
};

export function LoginForm({ onSuccess }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const check = validateLoginFields(email, password);
    if (!check.ok) {
      setError(check.message);
      return;
    }

    setLoading(true);

    try {
      const me = await login(check.email, password);
      onSuccess?.(me.role);
    } catch (err) {
      const apiMessage = err instanceof Error ? err.message : '';
      const status =
        err && typeof err === 'object' && 'status' in err
          ? (err as { status?: number }).status
          : undefined;
      setError(loginErrorMessage(apiMessage, status));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div className="auth-input">
        <User className="auth-input__icon" strokeWidth={1.75} aria-hidden />
        <input
          className="auth-input__field"
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          spellCheck={false}
          aria-required="true"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          aria-label="Email"
          required
          disabled={loading}
        />
      </div>

      <div className="auth-input auth-input--password">
        <Lock className="auth-input__icon" strokeWidth={1.75} aria-hidden />
        <input
          className="auth-input__field"
          type={showPassword ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          aria-label="Password"
          aria-required="true"
          required
          disabled={loading}
        />
        <button
          type="button"
          className="auth-input__toggle"
          onClick={() => setShowPassword((v) => !v)}
          aria-pressed={showPassword}
          aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          disabled={loading}
        >
          {showPassword ? (
            <EyeOff className="auth-input__toggle-icon" strokeWidth={1.75} aria-hidden />
          ) : (
            <Eye className="auth-input__toggle-icon" strokeWidth={1.75} aria-hidden />
          )}
        </button>
      </div>

      {error ? (
        <p className="auth-form__alert" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="auth-form__submit" disabled={loading}>
        {!loading ? (
          <LogIn className="auth-form__submit-icon" strokeWidth={2} aria-hidden />
        ) : null}
        {loading ? 'Memproses…' : 'Masuk'}
      </button>
    </form>
  );
}
