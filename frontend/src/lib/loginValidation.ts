const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginFields(
  email: string,
  password: string,
): { ok: true; email: string } | { ok: false; message: string } {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail) {
    return { ok: false, message: 'Email wajib diisi.' };
  }

  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return { ok: false, message: 'Format email tidak valid.' };
  }

  if (!password) {
    return { ok: false, message: 'Kata sandi wajib diisi.' };
  }

  return { ok: true, email: trimmedEmail };
}
