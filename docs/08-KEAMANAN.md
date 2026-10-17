# Keamanan, Threat Model, dan Keterbatasan

## 1. Pihak dan kemampuan

- **Publik:** dapat mengamati data blockchain yang dipublikasikan.
- **Backend/operator:** saat ini menerima amount plaintext dan memiliki akses operasional ke proses enkripsi.
- **Pemegang private key Paillier:** dapat mendekripsi ciphertext yang dapat diakses.
- **Penyerang API:** dapat mengirim input salah, proof tidak valid, request berulang, atau memanggil `POST /api/auth/register` jika endpoint bootstrap tidak dibatasi (hanya aman di demo lokal).
- **Gangguan RPC:** dapat menghasilkan transaksi yang statusnya belum diketahui backend.

## 2. Sifat yang sudah didemonstrasikan

- Enkripsi/dekripsi Paillier dan homomorphic addition pada pengujian.
- Verifikasi Groth16 untuk `amount > 0`, `amount <= campaign_max`, dan `Poseidon(amount, secret) == commitment`.
- Pencatatan on-chain pada lingkungan Hardhat yang aktif.

## 3. Kesenjangan kritis

**Tidak ada proof-to-ciphertext consistency:** backend dapat menyimpan ciphertext yang tidak sesuai dengan witness proof tanpa dideteksi oleh circuit saat ini. Penguatan membutuhkan desain protokol dan pengelolaan randomness enkripsi yang tepat.

**Tidak ada privasi terhadap backend:** amount dikirim dalam plaintext. Untuk mencapai tujuan lebih kuat, perlu mengevaluasi client-side encryption, proof generation, dan distribusi kepercayaan/kunci.

**Replay/idempotency:** migration `000006` + unique `idempotency_key`; replay mengembalikan HTTP 200; race insert ditangani dengan lookup ulang. Duplikat historis diarsipkan di `donations_duplicate_archive`.

**Distributed consistency:** keberhasilan chain tidak selalu sinkron dengan DB. Tersedia retry donasi `failed`, admin `reconcile-pending`, worker periodik `DONATION_PENDING_RECONCILE_SEC`, dan hitung ulang agregat — belum SLA produksi 24/7.

**Kunci dan data sensitif:** private key Paillier, signer EVM, JWT secret, dan data user memerlukan penyimpanan serta akses terkontrol.

## 4. Kebijakan data historis

Tabel `donations_duplicate_archive` (migration 000005) hanya untuk audit; kebijakan canonical ada di [13-RELIABILITY.md](13-RELIABILITY.md). Transaksi lama dari Hardhat yang sudah di-reset tidak dapat dianggap terverifikasi hanya berdasarkan tx hash.

## 5. Properti privasi target (Phase 4)

| Properti | Implementasi saat ini | Target penelitian |
|----------|----------------------|-------------------|
| Kerahasiaan nominal dari publik | Paillier pada agregat; nilai per-donasi tidak dipublikasikan di UI umum | Pertahankan; perjelas apa yang terlihat di chain |
| Kerahasiaan dari backend | **Tidak** — amount plaintext di API | Client-side encryption + proof tanpa reveal ke server |
| Integritas proof ↔ ciphertext | **Tidak** — circuit tidak memverifikasi ciphertext | Binding witness ke ciphertext yang disimpan |
| Anti-replay donasi | Idempotency key + unique index | Evaluasi commitment reuse & concurrent load |
| Konsistensi DB ↔ chain | Retry, rekonsiliasi pending, archive audit | Formalisasi state machine + bukti rekonsiliasi |

Detail implementasi reliability: [13-RELIABILITY.md](13-RELIABILITY.md).

## 6. Pengujian keamanan yang direncanakan

- Invalid proof dan public input mismatch.
- Replay proof/commitment dan concurrent duplicate submissions.
- Blockchain RPC timeout serta receipt tidak pasti.
- Kegagalan update status dan aggregate.
- Pengujian ciphertext mismatch terhadap nilai witness.
- Pemeriksaan akses private key dan kebocoran log.
- Pengujian pemulihan data setelah restart blockchain development.

## 7. Batas penggunaan

Prototipe tidak boleh digunakan untuk dana sungguhan atau dipromosikan sebagai anonimitas penuh sebelum audit, perbaikan integritas, dan validasi model privasi selesai.
