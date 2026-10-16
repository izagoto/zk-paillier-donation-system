-- Perkaya campaign demo untuk tampilan sidang (idempotent: hanya baris tanpa metadata).
-- Jalankan: psql "$DATABASE_URL" -f backend/scripts/seed_demo_presentation.sql

UPDATE campaigns c
SET
    title = 'Beasiswa SD Negeri Harapan',
    description = 'Mengumpulkan dana operasional beasiswa dan perlengkapan sekolah untuk 40 siswa kurang mampu di pedesaan.',
    category = 'Pendidikan',
    location = 'Jawa Tengah',
    image_url = 'https://images.unsplash.com/photo-1497486753465-80a99bd0f6c7?w=800&q=80'
WHERE c.id = (
    SELECT id FROM campaigns
    WHERE (category IS NULL OR category = '')
      AND created_by = (SELECT id FROM users WHERE email = 'pengelola@demo.local' LIMIT 1)
    ORDER BY created_at ASC
    LIMIT 1
);

UPDATE campaigns c
SET
    title = 'Bantuan Pangan Keluarga',
    description = 'Paket sembako bulanan untuk keluarga lansia dan penyandang disabilitas di lingkungan sekitar.',
    category = 'Sosial',
    location = 'Jakarta',
    image_url = 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80'
WHERE c.id = (
    SELECT id FROM campaigns
    WHERE (category IS NULL OR category = '')
      AND created_by = (SELECT id FROM users WHERE email = 'pengelola@demo.local' LIMIT 1)
    ORDER BY created_at ASC
    OFFSET 1
    LIMIT 1
);

UPDATE campaigns c
SET
    title = 'Perbaikan Sumur Bersih',
    description = 'Renovasi sumur dan filter air untuk dua dusun yang kesulitan akses air minum aman.',
    category = 'Kesehatan',
    location = 'Nusa Tenggara Timur',
    image_url = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80'
WHERE c.id = (
    SELECT id FROM campaigns
    WHERE (category IS NULL OR category = '')
      AND created_by = (SELECT id FROM users WHERE email = 'pengelola@demo.local' LIMIT 1)
    ORDER BY created_at ASC
    OFFSET 2
    LIMIT 1
);
