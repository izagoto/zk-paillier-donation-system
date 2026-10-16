# Teknologi yang Digunakan

| Teknologi | Peran | Alasan pemilihan / catatan |
|---|---|---|
| Go | Backend utama | Cocok untuk layanan API dan modul terstruktur |
| Gin | HTTP framework | Routing dan middleware API |
| PostgreSQL | Basis data relasional | Konsistensi dan query transaksi |
| golang-migrate | Versioning skema | Migration terurut dan dapat dilacak |
| JWT | Autentikasi | Access token untuk protected API; perlu kebijakan expiry/rotation |
| Paillier | Homomorphic encryption | Penjumlahan nominal dalam bentuk ciphertext |
| Circom | ZK circuit | Mendefinisikan constraint validitas donasi |
| Poseidon | Commitment hash | Commitment yang kompatibel dengan circuit |
| snarkjs | Tooling ZK | Proof generation, key dan verification tooling |
| Groth16 | zk-SNARK | Verifikasi proof ringkas; trusted setup harus dikelola |
| Solidity | Smart contract | Aturan pencatatan/verifikasi di EVM |
| Hardhat | Blockchain lokal | Deployment dan pengujian; chain dapat reset |
| Ethereum JSON-RPC | Integrasi backend–chain | Mengirim dan memeriksa transaksi |
| Git/GitHub | Version control | Kolaborasi dan riwayat perubahan |

## Integrasi teknologi

**Paillier** melindungi nominal yang disimpan sebagai ciphertext dan mendukung agregasi. **zk-SNARK** membuktikan constraint nominal terhadap commitment. **Blockchain** menyimpan catatan transaksi dan memverifikasi proof sesuai smart contract. **PostgreSQL** menyimpan status operasional yang dibutuhkan backend.

## Hal yang belum boleh diklaim

- Ciphertext Paillier belum dibuktikan konsisten dengan nominal di proof.
- Backend masih menerima nominal plaintext.
- Metadata transaksi on-chain tidak otomatis anonim.
- Hardhat lokal bukan bukti ketahanan jaringan produksi.

## Teknologi yang masih diputuskan

Frontend framework, strategi queue/job worker, key management produksi, observability stack, dan infrastruktur staging belum dipastikan. Pilih berdasarkan kebutuhan, bukan menambahkan stack hanya untuk memperbanyak teknologi.
