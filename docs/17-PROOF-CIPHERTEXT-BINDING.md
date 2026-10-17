# Desain: proof-to-ciphertext binding (Phase 4)

**Status:** desain penelitian; **belum** diimplementasikan di circuit/API saat ini.

## Masalah

Circuit Groth16 saat ini membuktikan:

- `amount > 0`
- `amount <= campaign_max`
- `Poseidon(amount, secret) == commitment`

Backend kemudian mengenkripsi `amount` dengan Paillier dan menyimpan ciphertext terpisah. Penyerang (atau bug server) dapat menyimpan ciphertext untuk nominal **berbeda** dari witness proof tanpa terdeteksi oleh verifier zk.

## Target properti

**Binding:** untuk donasi yang diterima, verifier (dan auditor) yakin bahwa ciphertext Paillier `C` yang disimpan adalah enkripsi dari `amount` yang sama dengan yang dipakai dalam proof.

## Arah desain (opsi)

### Opsi A — Public input ciphertext hash

1. Client (atau server terpercaya di demo) menghitung `C = Enc_pk(amount)`.
2. Circuit menambahkan constraint: `H(C) == public_input_ciphertext_digest` (atau komitmen terhadap byte ciphertext).
3. Verifier Groth16 memeriksa digest; backend menolak jika body `encrypted_amount` tidak cocok.

**Trade-off:** ukuran public input dan kompleksitas circuit; perlu encoding ciphertext ke field finite yang kompatibel dengan Circom.

### Opsi B — Proof of correct encryption (sub-circuit)

Sub-bukti bahwa `C` adalah hasil operasi Paillier yang benar dengan randomness terikat ke commitment.

**Trade-off:** sangat mahal; biasanya membutuhkan MPC atau arsitektur dua fase.

### Opsi C — Server-honest dengan audit sampling (bukan kriptografi kuat)

Logging deterministik `(commitment, ciphertext, proof_hash)` dan audit manual — **hanya** untuk demo, tidak memenuhi klaim privasi kuat.

Prototipe TrustGive saat ini mendekati **Opsi C** dengan enkripsi di server.

## Langkah implementasi berikutnya (jika dilanjutkan)

1. Tentukan representasi `C` di circuit (bit decomposition vs hash).
2. Perbarui `zk/circuits` + trusted setup / verifying key.
3. Ubah API donasi: kirim ciphertext dari klien atau verifikasi hash di handler sebelum insert.
4. Tambah test negatif: proof valid + ciphertext salah → **ditolak**.

Lihat juga [08-KEAMANAN.md](08-KEAMANAN.md) §5 dan [16-KETERBATASAN-DEMO.md](16-KETERBATASAN-DEMO.md).
