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

**Replay/idempotency:** duplicate logical donation historis sudah ditemukan. Unique constraint dan penanganan concurrent retry belum diterapkan secara lengkap.

**Distributed consistency:** keberhasilan chain tidak menjamin update database/aggregate berhasil. Diperlukan recovery dan reconciliation.

**Kunci dan data sensitif:** private key Paillier, signer EVM, JWT secret, dan data user memerlukan penyimpanan serta akses terkontrol.

## 4. Kebijakan data historis

Tabel `donations_duplicate_archive` telah dibuat pada migration 000005. Tidak boleh memindahkan record atau mengubah aggregate sebelum tersedia kebijakan canonical record yang dapat diaudit. Transaksi lama dari Hardhat yang sudah di-reset tidak dapat dianggap terverifikasi hanya berdasarkan tx hash.

## 5. Pengujian keamanan yang direncanakan

- Invalid proof dan public input mismatch.
- Replay proof/commitment dan concurrent duplicate submissions.
- Blockchain RPC timeout serta receipt tidak pasti.
- Kegagalan update status dan aggregate.
- Pengujian ciphertext mismatch terhadap nilai witness.
- Pemeriksaan akses private key dan kebocoran log.
- Pengujian pemulihan data setelah restart blockchain development.

## 6. Batas penggunaan

Prototipe tidak boleh digunakan untuk dana sungguhan atau dipromosikan sebagai anonimitas penuh sebelum audit, perbaikan integritas, dan validasi model privasi selesai.
