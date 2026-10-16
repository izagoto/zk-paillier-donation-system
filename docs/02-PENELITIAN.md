# Dasar Penelitian

## Judul

**Perancangan Sistem Donasi Transparan Berbasis Blockchain dengan Paillier Homomorphic Encryption dan zk-SNARK untuk Menjamin Privasi Donatur**

Judul ini adalah **arah penelitian**; frasa “menjamin privasi” merupakan target yang harus dibuktikan secara empiris dan formal, **belum merupakan klaim atas implementasi sekarang**.

## 1. Latar Belakang

Donasi digital memerlukan kepercayaan antara donatur, pengelola kampanye, dan pihak yang memeriksa penggunaan sistem. Dalam pendekatan terpusat, rekam transaksi dan perhitungan total donasi bergantung pada operator layanan. Transparansi dapat ditingkatkan melalui pencatatan yang dapat diperiksa, tetapi membuka seluruh detail transaksi juga dapat mengungkap informasi finansial individual.

Blockchain menawarkan pencatatan transaksi yang dapat diverifikasi pada jaringan yang digunakan. Namun, data yang dipublikasikan secara langsung dapat menimbulkan risiko privasi. Paillier Homomorphic Encryption memungkinkan penjumlahan ciphertext tanpa mendekripsi setiap nilai individual. Sementara itu, zk-SNARK memungkinkan verifikasi pernyataan tentang witness privat, misalnya nominal berada dalam rentang yang diperbolehkan.

Integrasi ketiganya menimbulkan tantangan penelitian: memastikan bukti kriptografis terkait dengan data terenkripsi yang benar, mengelola siapa yang mengetahui nominal dan kunci, serta menjaga konsistensi antara basis data dan blockchain ketika proses gagal. Proyek ini mengembangkan prototipe dan mengevaluasi tantangan tersebut secara bertahap.

## 2. Rumusan Masalah

1. Bagaimana merancang arsitektur sistem donasi yang menggabungkan backend, PostgreSQL, blockchain, Paillier, dan zk-SNARK?
2. Bagaimana merekam dan memverifikasi transaksi donasi tanpa harus memublikasikan nominal plaintext pada blockchain?
3. Bagaimana melakukan agregasi nominal terenkripsi menggunakan sifat homomorfik Paillier dan memeriksa ketepatan hasilnya?
4. Bagaimana membuktikan validitas rentang nominal donasi menggunakan zk-SNARK?
5. Bagaimana mengikat nilai yang dibuktikan oleh zk-SNARK dengan ciphertext Paillier agar tidak dapat dipasangkan secara tidak konsisten?
6. Bagaimana menghindari transaksi ganda dan menjaga konsistensi antara PostgreSQL, blockchain, dan aggregate saat terjadi kegagalan?
7. Bagaimana mengevaluasi correctness, privasi, performa, dan keandalan sistem secara terukur?

## 3. Tujuan Penelitian

- Merancang dan mengimplementasikan prototipe sistem donasi berbasis blockchain.
- Mengimplementasikan enkripsi dan agregasi homomorfik Paillier.
- Mengimplementasikan validasi constraint donasi dengan zk-SNARK.
- Meneliti desain proof-to-ciphertext consistency sebagai penguatan protokol.
- Menguji mekanisme idempotency, pemulihan transaksi, dan rekonsiliasi aggregate.
- Mengevaluasi ketepatan, batas privasi, biaya komputasi, dan reliabilitas.

## 4. Batasan Masalah

1. Implementasi awal menggunakan blockchain lokal Hardhat/EVM, bukan mainnet.
2. Nominal donasi direpresentasikan sebagai bilangan bulat nonnegatif dalam satuan yang ditetapkan aplikasi.
3. Proof saat ini hanya mencakup batas nominal dan Poseidon commitment; hubungan ke ciphertext Paillier masih penelitian lanjutan.
4. Backend saat ini menerima nominal plaintext; karena itu backend **bukan pihak yang tidak mengetahui nominal**.
5. Private key Paillier dikelola dalam lingkungan pengembangan; belum ada key custody produksi atau threshold decryption.
6. Sistem belum mengintegrasikan payment gateway, settlement, pencairan dana, KYC/AML, atau transaksi keuangan sungguhan.
7. Fokus pengujian pada prototipe, correctness kriptografi, keamanan aplikasi, dan keandalan proses; bukan audit formal seluruh library.
8. Data historis pada blockchain lokal dapat hilang ketika node di-reset; verifikasi historis dibatasi bukti yang tersedia.

## 5. Manfaat dan Kontribusi yang Diharapkan

- Referensi arsitektur untuk integrasi blockchain dan komputasi terenkripsi.
- Prototipe untuk mengevaluasi agregasi donasi dengan privasi terbatas.
- Evaluasi empiris biaya proof generation, verification, enkripsi, dan agregasi.
- Analisis kesenjangan keamanan antara prototipe awal dan protokol yang mengikat proof dengan ciphertext.

## 6. Metode Evaluasi

Uji correctness (nominal, proof, aggregate), uji negatif (proof salah, replay, ciphertext tidak cocok), uji kegagalan (RPC timeout, database error), serta benchmark waktu dan penggunaan sumber daya. Setiap klaim privasi harus dinilai terhadap pihak yang dapat mengamati data: publik, operator backend, operator blockchain, dan pemegang kunci.
