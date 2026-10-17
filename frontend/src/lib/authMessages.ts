/** Pesan aman untuk UI — tidak membocorkan apakah email terdaftar. */
export function loginErrorMessage(apiError: string, status?: number): string {
  if (status === 429 || apiError === 'too many login attempts') {
    return 'Terlalu banyak percobaan masuk. Tunggu beberapa menit lalu coba lagi.';
  }

  switch (apiError) {
    case 'invalid email or password':
      return 'Email atau kata sandi salah.';
    case 'email is required':
      return 'Email wajib diisi.';
    case 'password is required':
      return 'Kata sandi wajib diisi.';
    case 'invalid request body':
      return 'Permintaan tidak valid. Periksa email dan kata sandi.';
    case 'internal server error':
      return 'Server sibuk. Coba lagi sebentar.';
    default:
      return 'Gagal masuk. Periksa email dan kata sandi.';
  }
}
