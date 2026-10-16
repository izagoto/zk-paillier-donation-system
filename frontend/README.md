# TrustGive (frontend)

Antarmuka web prototipe **zk-paillier-donation-system**: React 19, TypeScript, Vite.

## Menjalankan

```bash
npm install
npm run dev
```

Default: http://localhost:5173 — API backend di `http://127.0.0.1:8080` (proxy Vite).

## Dokumentasi proyek

- Setup lengkap: [../docs/11-LOCAL-SETUP.md](../docs/11-LOCAL-SETUP.md)
- Login, role, bootstrap akun: [../docs/10-AKSES-LOGIN.md](../docs/10-AKSES-LOGIN.md)
- Alur demo: [../docs/05-WORKFLOW.md](../docs/05-WORKFLOW.md)

## Catatan

- Registrasi **hanya** lewat API backend, bukan dari UI.
- RBAC UI: `src/lib/roles.ts` (selaras middleware backend).
- Generate proof donasi memanggil backend (demo penelitian).
