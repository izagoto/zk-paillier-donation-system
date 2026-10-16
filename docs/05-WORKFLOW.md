# Workflow dan Alur Proses

## 1. Bootstrap akun dan login

Registrasi **tidak** tersedia di UI TrustGive. Pengelola penelitian membuat user lewat `POST /api/auth/register` (curl/Postman). Pengguna akhir hanya **login** di web.

```mermaid
sequenceDiagram
  actor Admin as Pengelola penelitian
  actor U as Pengguna terdaftar
  participant W as TrustGive Web
  participant A as API
  participant D as PostgreSQL
  Admin->>A: POST /api/auth/register
  A->>D: INSERT user
  U->>W: Buka /login
  W->>A: POST /api/auth/login
  A->>D: Validasi kredensial
  A-->>W: JWT
```

Detail akses: [10-AKSES-LOGIN.md](10-AKSES-LOGIN.md).

## 2. Membuat campaign (saat ini)

```mermaid
sequenceDiagram
  actor U as Pengelola
  participant A as Backend
  participant B as Blockchain
  participant D as PostgreSQL
  U->>A: Data campaign
  A->>A: Validasi dan generate UUID
  A->>B: setCampaignMaxDonation
  B-->>A: Transaksi berhasil
  A->>D: INSERT campaign
  D-->>A: Data tersimpan
  A-->>U: Campaign dibuat
```

**Keterbatasan:** blockchain berhasil tetapi INSERT gagal belum memiliki kompensasi otomatis.

## 3. Membuat donasi (saat ini)

```mermaid
sequenceDiagram
  actor U as Donatur/API Client
  participant A as Donation Service
  participant Z as ZK Verifier
  participant P as Paillier
  participant D as PostgreSQL
  participant B as Blockchain
  U->>A: amount, commitment, proof
  A->>A: Validasi campaign & amount
  A->>Z: Verify proof
  Z-->>A: Valid
  A->>P: Encrypt amount
  P-->>A: Ciphertext
  A->>D: INSERT pending
  A->>B: Record donation
  B-->>A: Receipt/tx hash
  A->>D: Update tx hash
  A->>D: Set confirmed
  A->>D: Increment aggregate
  A-->>U: Hasil donasi
```

Alur ini hanya menggambarkan jalur berhasil. Bila langkah akhir gagal, database dan chain dapat tidak konsisten.

## 4. Target idempotency dan recovery

```mermaid
flowchart TD
  A[Permintaan Donasi] --> B{Logical key sudah ada?}
  B -- Ya --> C[Ambil status existing]
  C --> D{Confirmed?}
  D -- Ya --> E[Kembalikan hasil existing]
  D -- Tidak --> F[Recovery / status pending]
  B -- Tidak --> G[Create pending secara atomik]
  G --> H[Submit ke blockchain]
  H --> I{Receipt diketahui?}
  I -- Ya dan sukses --> J[Konfirmasi & reconcile aggregate]
  I -- Tidak / gagal --> K[Catat keadaan untuk retry aman]
```

Candidate logical key: `(campaign_id, commitment)`; perlu validasi terhadap model ancaman dan kebijakan penggunaan ulang commitment. Constraint database harus menangani race condition.

## 5. Agregasi

Donasi confirmed yang sah → kumpulkan ciphertext → operasi Paillier Add → simpan encrypted total → dekripsi terotorisasi untuk pemeriksaan. Rebuild harus dapat dibandingkan dengan aggregate incremental.

## 6. Audit historis

- Identifikasi kelompok duplikasi tanpa mengubah record.
- Simpan backup dan bukti yang tersedia.
- Tentukan aturan canonical record yang dapat dipertanggungjawabkan.
- Jangan menyimpulkan transaksi on-chain dari hash lama bila chain Hardhat sudah di-reset.
- Lakukan rekonsiliasi aggregate sebelum/sesudah perubahan bila dibutuhkan.
- Terapkan uniqueness setelah konflik historis diselesaikan.

## 7. Kondisi akhir yang diinginkan

Setiap permintaan menghasilkan status yang dapat dijelaskan; retry tidak menggandakan donasi; transaksi on-chain dan database dapat direkonsiliasi; aggregate sesuai donasi sah; semua perubahan historis memiliki jejak audit.
