# Goals dan Indikator Keberhasilan

## Visi

Membangun prototipe donasi yang **dapat diaudit**, **mendukung agregasi terenkripsi**, dan **memiliki bukti validitas yang terukur**, tanpa menyamakan kemampuan saat ini dengan privasi end-to-end.

| ID | Goal | Indikator keberhasilan | Tahap |
|---|---|---|---|
| G-01 | Pencatatan transparan | Receipt dan data transaksi dapat dibaca pada chain aktif | Dasar diuji |
| G-02 | Agregasi Paillier | Dekripsi aggregate = jumlah donasi confirmed yang sah | Dasar diuji |
| G-03 | Validasi zk-SNARK | Proof valid diterima, invalid ditolak | Dasar diuji |
| G-04 | Anti-replay | Retry tidak menciptakan logical donation kedua | Sedang dikerjakan |
| G-05 | Keandalan | Pemulihan dan rekonsiliasi dapat diuji pada kegagalan | Belum selesai |
| G-06 | Usabilitas | Happy path tersedia melalui frontend | Direncanakan |
| G-07 | Privasi yang lebih kuat | Bukti mengikat ciphertext ke witness; threat model terpenuhi | Riset lanjutan |
| G-08 | Evaluasi ilmiah | Benchmark dan hasil pengujian dapat direproduksi | Direncanakan |

## Prioritas pengerjaan

**P0:** integritas data, idempotency, recovery, konsistensi aggregate, correctness kriptografi.  
**P1:** UI, dokumentasi API, observability, pengujian menyeluruh.  
**P2:** peningkatan protokol privasi, benchmark skala lebih besar, deployment staging.

## Definisi selesai

Sebuah goal dianggap selesai hanya jika implementasi, pengujian positif/negatif, dokumentasi, dan bukti hasilnya tersedia. Satu demo happy path bukan bukti sistem siap produksi.
