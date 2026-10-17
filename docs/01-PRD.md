# Product Requirements Document (PRD)

**Produk:** zk-paillier-donation-system  
**Tahap:** prototipe penelitian / MVP demo sidang (lokal)  
**Status:** kebutuhan P0–P1 terpenuhi untuk happy path + reliability demo; FR-15 dan hardening produksi (Phase 4–5) belum

## 1. Visi Produk

Platform donasi yang memungkinkan pencatatan dapat diaudit, validasi nominal melalui proof, dan agregasi nilai terenkripsi, dengan model privasi yang dijelaskan secara transparan.

## 2. Masalah Pengguna

Donatur ingin mengetahui bahwa donasinya tercatat dan tidak dihitung dua kali. Penyelenggara ingin mengelola campaign dan mengetahui total donasi. Auditor ingin memeriksa konsistensi catatan tanpa bergantung sepenuhnya pada laporan manual. Administrator memerlukan penanganan kegagalan transaksi yang aman.

## 3. Aktor dan Kebutuhan

| Aktor | Kebutuhan |
|---|---|
| Donatur | Login (akun disediakan pengelola), mengirim donasi, melihat status dan referensi transaksi |
| Pengelola campaign | Membuat campaign, menetapkan target/batas, melihat ringkasan |
| Auditor | Memeriksa catatan blockchain, proof, dan konsistensi aggregate sesuai akses |
| Admin | Memantau transaksi tertunda, menjalankan reconciliation dengan audit trail |
| Pengunjung | Melihat campaign dan ringkasan yang boleh dipublikasikan |

## 4. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas | Status saat ini |
|---|---|---|---|
| FR-01 | Login JWT; bootstrap akun via API (tanpa UI daftar) | P0 | Sudah diuji |
| FR-02 | Autentikasi API | P0 | Sudah diuji |
| FR-03 | Buat dan daftar campaign | P0 | Sudah diuji |
| FR-04 | Registrasi maksimum donasi on-chain | P0 | Sudah diuji |
| FR-05 | Validasi proof Groth16 | P0 | Sudah diuji |
| FR-06 | Enkripsi nominal dengan Paillier | P0 | Sudah diuji |
| FR-07 | Simpan donasi dan rekam blockchain | P0 | Sudah diuji pada happy path |
| FR-08 | Hitung aggregate terenkripsi | P0 | Sudah diuji |
| FR-09 | Pencegahan duplicate/replay secara atomik | P0 | Sudah diuji (idempotency key, HTTP 200 replay; lihat [13-RELIABILITY.md](13-RELIABILITY.md)) |
| FR-10 | Retry, recovery, reconciliation | P0 | Sudah diuji (retry failed, admin + worker pending, reconcile agregat) |
| FR-11 | Arsip duplikasi historis untuk audit | P1 | Tabel + kebijakan canonical; baca-only via admin API/UI |
| FR-12 | UI daftar/detail campaign | P1 | MVP TrustGive |
| FR-13 | UI pengiriman dan status donasi | P1 | MVP TrustGive |
| FR-14 | Halaman verifikasi publik | P1 | MVP TrustGive (`GET /api/donations/:id/verify`) |
| FR-15 | Proof-ciphertext consistency | P0 penelitian | Belum diimplementasikan |

## 5. User Stories

- **US-01:** Sebagai donatur, saya ingin login dengan akun yang disediakan agar bisa mengirim donasi.
- **US-02:** Sebagai pengelola, saya ingin membuat campaign dengan batas nominal agar transaksi tervalidasi.
- **US-03:** Sebagai donatur, saya ingin mengetahui apakah donasi telah dicatat di blockchain.
- **US-04:** Sebagai donatur, saya ingin retry yang aman agar satu donasi tidak tercatat dua kali.
- **US-05:** Sebagai auditor, saya ingin memeriksa total donasi terenkripsi dan status transaksi.
- **US-06:** Sebagai admin, saya ingin mengetahui transaksi gagal/tertunda tanpa menghapus bukti historis.

## 6. Acceptance Criteria MVP

1. Registrasi/login dan akses protected endpoint berjalan.
2. Campaign valid dibuat dan batasnya tercatat di blockchain.
3. Proof valid diterima, proof salah atau batas terlampaui ditolak.
4. Transaksi valid tercatat di PostgreSQL dan memiliki bukti blockchain yang dapat dicek pada chain aktif.
5. Aggregate terdekripsi sesuai jumlah donasi confirmed yang sah.
6. Permintaan berulang dengan logical idempotency key yang sama tidak menambah donasi kedua.
7. Kegagalan RPC/DB memiliki jalur recovery yang diuji.
8. Pengguna dapat menyelesaikan happy path melalui UI setelah frontend dibuat.
9. Dokumentasi menyatakan secara jelas batas privasi prototipe.

Bukti kriteria 6–8 pada demo lokal: [13-RELIABILITY.md](13-RELIABILITY.md), [14-SIDANG-DEMO.md](14-SIDANG-DEMO.md), [09-ROADMAP.md](09-ROADMAP.md).

## 7. Kebutuhan Nonfungsional

- **Keamanan:** otorisasi, validasi, key management, pencegahan replay, audit trail.
- **Keandalan:** pemrosesan idempotent, status yang dapat dipulihkan, rekonsiliasi data.
- **Kinerja:** benchmark proof, enkripsi, verifikasi, RPC, dan agregasi sebelum menentukan SLO.
- **Maintainability:** modul terpisah, migration versioned, unit/integration/E2E tests.
- **Observability:** log terstruktur, korelasi donation ID/transaction hash, error reporting tanpa rahasia.

## 8. Tidak Termasuk MVP

Pembayaran uang sungguhan, settlement, penyaluran dana, compliance produksi, anonimitas penuh, dan deployment mainnet.

## 9. Risiko dan Dependensi

Ketersediaan RPC, penyimpanan kunci, trusted setup/verifying key, konsistensi state lintas DB–chain, dan perancangan protokol pengikat ciphertext–proof. Detailnya pada [KEAMANAN.md](KEAMANAN.md).
