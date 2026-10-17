# Manual Book — TrustGive (zk-paillier-donation-system)

Panduan penggunaan aplikasi web **TrustGive** untuk demo sidang, uji manual, dan onboarding tim. Untuk instalasi teknis gunakan [11-LOCAL-SETUP.md](11-LOCAL-SETUP.md); untuk skrip presentasi [14-SIDANG-DEMO.md](14-SIDANG-DEMO.md).

---

## 1. Tentang sistem

TrustGive adalah prototipe sistem donasi transparan yang menggabungkan:

- **Blockchain** (pencatatan transaksi donasi),
- **Enkripsi Paillier** (agregat nominal terenkripsi),
- **Bukti zk-SNARK Groth16** (validasi batas donasi terhadap `max_donation` campaign).

Aplikasi web (`frontend/`) memungkinkan alur lengkap tanpa memanggil API manual. **Ini bukan layanan keuangan produksi** — lihat [16-KETERBATASAN-DEMO.md](16-KETERBATASAN-DEMO.md).

**URL lokal default:** http://localhost:5173  
**API backend:** http://localhost:8080 (di-proxy lewat Vite saat development).

---

## 2. Siapa bisa melakukan apa?

| Peran | Login | Kemampuan di UI |
|--------|--------|------------------|
| **Pengunjung** | Tidak | Beranda, jelajahi campaign, lihat detail & agregat, halaman verifikasi donasi (publik) |
| **Donatur** (`donor`) | Ya | Donasi, riwayat donasi (dengan nominal), profil |
| **Pengelola** (`organizer`) | Ya | Buat & kelola campaign, campaign saya, donasi masuk, dashboard |
| **Auditor** (`auditor`) | Ya | Transparansi, jelajahi campaign (baca saja) |
| **Admin** (`admin`) | Ya | Semua izin pengelola + donatur + **Rekonsiliasi** |

Akun **tidak dibuat lewat halaman web** — hanya lewat API register. Akun demo: [10-AKSES-LOGIN.md](10-AKSES-LOGIN.md).

---

## 3. Memulai

### 3.1 Menyalakan lingkungan

Urutan singkat:

1. PostgreSQL + migrasi DB.
2. Hardhat node + deploy kontrak.
3. `go run ./cmd/server` di `backend/`.
4. `npm run dev` di `frontend/`.

Detail: [11-LOCAL-SETUP.md](11-LOCAL-SETUP.md).

### 3.2 Login & logout

1. Buka **Masuk** (`/login`) — judul form: **Masuk ke TrustGive**.
2. Isi **email** dan **kata sandi** (contoh sidang: `pengelola@demo.local` / `demo12345` — lihat [10-AKSES-LOGIN.md](10-AKSES-LOGIN.md)).
3. Jika format email salah atau field kosong, pesan muncul di bawah field (Bahasa Indonesia).
4. Jika email/password tidak cocok dengan database, pesan: **Email atau kata sandi salah.** (satu pesan untuk keduanya — tidak mengungkap akun ada atau tidak).
5. Setelah **banyak** percobaan gagal dari IP yang sama, sistem membatasi sementara (*Terlalu banyak percobaan masuk…*).
6. Setelah sukses, Anda diarahkan ke **dashboard** sesuai role.
7. **Keluar** lewat menu avatar (header kanan) sebelum ganti peran (mis. pengelola → donatur).

### 3.3 Data demo opsional

Untuk tabel panjang dan uji scroll UI:

```bash
./backend/scripts/setup_demo_presentation.sh
# atau
psql "$DATABASE_URL" -f backend/scripts/seed_datatable_scroll.sql
```

Penjelasan: [11-LOCAL-SETUP.md](11-LOCAL-SETUP.md) (bagian seed scroll).

---

## 4. Navigasi umum

### 4.1 Pengunjung (belum login)

- **Beranda** (`/`) — ringkasan campaign aktif.
- **Campaign** — sama dengan **Jelajahi campaign** (`/campaigns`).
- **Masuk** — login.

### 4.2 Setelah login

Menu header menyesuaikan role (lihat [12-FRONTEND-FLOW.md](12-FRONTEND-FLOW.md)).

| Menu (contoh) | Pengelola | Donatur |
|---------------|-----------|---------|
| Dashboard | `/organizer` | `/donor` |
| Jelajahi campaign | Ya | Ya |
| Campaign saya | Ya | — |
| Donasi masuk | Ya | — |
| Riwayat donasi | — (admin bisa) | Ya |
| Profil | Ya | Ya |
| Rekonsiliasi | Admin saja | — |

**Breadcrumb** di bawah header membantu melacak posisi (mis. Dashboard / Campaign saya / Buat campaign).

---

## 5. Panduan per halaman

### 5.1 Beranda (`/`)

- Menampilkan cuplikan campaign **aktif**.
- Pengguna yang sudah login biasanya diarahkan ke dashboard role, bukan tinggal di beranda.

### 5.2 Jelajahi campaign (`/campaigns`)

**Tanpa** `?mine=1` — daftar campaign publik dalam **kartu grid**.

| Fitur | Cara pakai |
|--------|------------|
| Cari | Kotak “Cari judul atau deskripsi…” |
| Kategori | Dropdown “Semua kategori” (jika ada data kategori) |
| Tab **Semua / Aktif** | Filter status campaign |
| **Lihat detail** | Masuk ke halaman campaign |
| Scroll isi | Banyak campaign: area grid di dalam kartu bisa di-scroll vertikal |

**Satu atau dua campaign** setelah filter: kartu tidak memakai lebar penuh 3 kolom (lebar dibatasi, rata kiri).

### 5.3 Campaign saya (`/campaigns?mine=1`)

Hanya **pengelola** (dan admin). Daftar campaign yang **Anda buat**.

| Fitur | Cara pakai |
|--------|------------|
| Tab **Semua / Aktif / Lainnya** | Filter status; pilihan tab **tersimpan di URL** (`status=active` atau `status=other`) sehingga **refresh** tetap di tab yang sama |
| Cari | Filter judul/deskripsi di tabel |
| **Tampilkan N entri** | Ubah jumlah baris per halaman; pilihan **disimpan di browser** (session) |
| Tabel | Baris > **6**: body tabel scroll di dalam kartu; header kolom + pagination tetap di luar area scroll |
| **Buka detail** (ikon mata) | Ke detail campaign |
| **Buat campaign** | Modal atau halaman `/campaigns/new` |

### 5.4 Buat campaign

**Modal** (dari tombol Buat campaign) atau halaman `/campaigns/new`.

| Field | Keterangan |
|--------|------------|
| Judul | Wajib |
| Deskripsi | Opsional, disarankan diisi |
| Kategori / Lokasi | Metadata tampilan |
| URL gambar | Cover campaign (opsional) |
| Target donasi | Total yang ingin dikumpulkan (Rp) |
| Maksimal per donasi | Batas satu kali donasi (terkait zk + kontrak) |

**Menutup modal:** hanya tombol **X** (bukan klik area gelap atau Escape). **Batal** juga menutup. **Publikasikan campaign** menyimpan ke backend.

### 5.5 Detail campaign (`/campaigns/:id`)

| Area | Isi |
|------|-----|
| Header | Judul, progress, tombol **Donasi** (donatur), **Bagikan**, **Kelola** (pemilik campaign) |
| Tab **Tentang** | Deskripsi, target, privasi |
| Tab **Donasi masuk** | Tabel donasi (status, waktu, tx); **Lihat bukti** membuka **modal** verifikasi |
| Tab **Transparansi** | Jejak bukti & transaksi untuk audit |

Tabel donasi: scroll body aktif jika **lebih dari 5 baris** di halaman saat ini (default pagination).

### 5.6 Donasi (`/campaigns/:id/donate`)

Khusus **donatur** (atau admin dengan izin donasi).

1. **Nominal** — masukkan jumlah (≤ maks. campaign).
2. **Konfirmasi** — periksa ringkasan.
3. **Proses** — backend membuat proof, enkripsi, transaksi chain; tunggu status **Terkonfirmasi** (bisa beberapa detik).

Jika gagal: gunakan **Coba lagi** di riwayat donasi jika status `failed` ([13-RELIABILITY.md](13-RELIABILITY.md)).

### 5.7 Riwayat donasi (`/donor/donations`)

Donatur melihat **nominal** donasi sendiri. Tabel: scroll body jika **lebih dari 10 baris** di halaman saat ini.

### 5.8 Donasi masuk (`/organizer/donations`)

Pengelola melihat donasi ke **semua campaign miliknya** (tanpa nominal per donatur). Scroll body jika **lebih dari 7 baris** di halaman.

### 5.9 Verifikasi donasi (publik)

- URL: `/verify/donation/:id`
- Dari modal **Lihat bukti** di detail campaign.
- Menampilkan commitment, status, hash transaksi — **bukan** nominal donatur untuk publik.

### 5.10 Dashboard pengelola (`/organizer`)

Ringkasan campaign, grafik donasi 7 hari, campaign terbaru.

### 5.11 Rekonsiliasi (admin) (`/admin/reconciliation`)

| Aksi | Fungsi |
|------|--------|
| Overview | Jumlah live, pending, archive |
| **Proses pending** | Selesaikan donasi yang tertahan di RPC/chain |
| **Rekonsiliasi** per campaign | Hitung ulang agregat Paillier dari donasi terkonfirmasi |
| Tabel archive | Cuplikan baris duplikat historis |

Detail teknis: [13-RELIABILITY.md](13-RELIABILITY.md).

### 5.12 Profil

Ubah data profil sesuai role (`/organizer/profile`, `/donor/profile`, dll.).

---

## 6. Tabel data (DataTable)

Berlaku di Campaign saya, Donasi masuk, Riwayat donasi, tab donasi di detail campaign, dll.

| Elemen | Perilaku |
|--------|----------|
| **Tampilkan N entri** | Mengubah ukuran halaman; nilai **diingat** per halaman (session storage) |
| **Pagination** | Footer “Menampilkan X sampai Y dari Z entri” + nomor halaman |
| **Scroll body** | Hanya area baris tabel; header kolom & pagination tetap |
| Ambang scroll (contoh) | Campaign saya: > **6** baris; Donasi masuk organizer: > **7**; Riwayat donatur: > **10**; Tab donasi detail: > **5** |

---

## 7. Alur demo singkat (15 menit)

Ikuti urutan di [14-SIDANG-DEMO.md](14-SIDANG-DEMO.md):

1. Pengunjung — jelajahi & detail campaign.  
2. Pengelola — dashboard, campaign saya, donasi masuk.  
3. **Logout.**  
4. Donatur — donasi, riwayat, verifikasi.  
5. (Opsional) Admin — rekonsiliasi.

---

## 8. Pengujian otomatis (opsional)

Playwright: [15-E2E.md](15-E2E.md)

```bash
cd frontend
export E2E_EXPECT_BACKEND=1
npm run test:e2e:datatable   # contoh tes DataTable
npm run test:e2e:public      # tanpa backend
```

---

## 9. Masalah umum

| Gejala | Kemungkinan penyebab | Rujukan |
|--------|----------------------|---------|
| Login gagal | Akun belum dibuat / role salah | [10-AKSES-LOGIN.md](10-AKSES-LOGIN.md) |
| Donasi stuck pending | RPC Hardhat / worker rekonsiliasi | [13-RELIABILITY.md](13-RELIABILITY.md), pastikan `npx hardhat node` hidup |
| Campaign tidak muncul | Filter Aktif / bukan milik pengelola | Cek tab & `mine=1` |
| Tabel terpotong | Scroll di dalam kartu — scroll area body atau halaman | Bagian 6 di manual ini |
| `email already exists` | Register ulang | [11-LOCAL-SETUP.md](11-LOCAL-SETUP.md) |

Smoke API cepat:

```bash
./backend/scripts/smoke_api.sh
```

---

## 10. Dokumen terkait

| Dokumen | Untuk |
|---------|--------|
| [10-AKSES-LOGIN.md](10-AKSES-LOGIN.md) | Role & pembuatan akun |
| [11-LOCAL-SETUP.md](11-LOCAL-SETUP.md) | Instalasi & env |
| [12-FRONTEND-FLOW.md](12-FRONTEND-FLOW.md) | Rute & API ringkas |
| [14-SIDANG-DEMO.md](14-SIDANG-DEMO.md) | Skrip sidang |
| [16-KETERBATASAN-DEMO.md](16-KETERBATASAN-DEMO.md) | Batasan penelitian |
| [05-WORKFLOW.md](05-WORKFLOW.md) | Alur bisnis end-to-end |

---

*Terakhir diselaraskan dengan UI TrustGive (DataTable scroll, modal campaign, verifikasi modal, filter URL Campaign saya).*
