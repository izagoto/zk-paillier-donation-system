-- Opsional: tutup campaign uji/E2E agar tidak muncul di beranda (status != active).
-- Jalankan: psql "$DATABASE_URL" -f scripts/cleanup_demo_campaigns.sql

UPDATE campaigns
SET status = 'closed'
WHERE status = 'active'
  AND (
    title ILIKE '%test%'
    OR title ILIKE '%uji%'
    OR title ILIKE '%e2e%'
    OR title ILIKE '%blockchain%'
  );
