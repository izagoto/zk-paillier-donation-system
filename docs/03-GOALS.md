# Goals dan Indikator Keberhasilan

## Visi

Membangun prototipe donasi yang **dapat diaudit**, **mendukung agregasi terenkripsi**, dan **memiliki bukti validitas yang terukur**, tanpa menyamakan kemampuan saat ini dengan privasi end-to-end.

| ID | Goal | Indikator keberhasilan | Tahap |
|---|---|---|---|
| G-01 | Pencatatan transparan | Receipt dan data transaksi dapat dibaca pada chain aktif | Dasar diuji |
| G-02 | Agregasi Paillier | Dekripsi aggregate = jumlah donasi confirmed yang sah | Dasar diuji |
| G-03 | Validasi zk-SNARK | Proof valid diterima, invalid ditolak | Dasar diuji |
| G-04 | Anti-replay | Retry tidak menciptakan logical donation kedua | MVP sidang (idempotency + retry tanpa baris baru) |
| G-05 | Keandalan | Pemulihan dan rekonsiliasi dapat diuji pada kegagalan | MVP sidang (admin, worker pending, skrip smoke; bukan staging produksi) |
| G-06 | Usabilitas | Happy path tersedia melalui frontend | MVP TrustGive |
| G-07 | Privasi yang lebih kuat | Bukti mengikat ciphertext ke witness; threat model terpenuhi | Riset lanjutan |
| G-08 | Evaluasi ilmiah | Benchmark dan hasil pengujian dapat direproduksi | Direncanakan |

## Prioritas pengerjaan

**P0 (MVP sidang):** integritas data, idempotency, recovery, konsistensi aggregate — **selesai untuk demo lokal** ([09-ROADMAP.md](09-ROADMAP.md) Phase 2).  
**P1:** UI, dokumentasi API — **MVP TrustGive selesai**; observability dan pengujian E2E otomatis masih direncanakan (Phase 5).  
**P2:** proof-to-ciphertext binding, benchmark, deployment staging (Phase 4–5).

## Definisi selesai

Sebuah goal dianggap selesai hanya jika implementasi, pengujian positif/negatif, dokumentasi, dan bukti hasilnya tersedia. Satu demo happy path bukan bukti sistem siap produksi.
