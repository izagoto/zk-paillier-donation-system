-- Data demo untuk menguji scroll body DataTable (>5 baris per halaman).
-- Idempotent: ID tetap; aman dijalankan ulang.
-- Butuh akun demo: pengelola@demo.local, donatur@demo.local
-- Jalankan: psql "$DATABASE_URL" -f backend/scripts/seed_datatable_scroll.sql

DO $$
DECLARE
    org_id UUID;
    donor_id UUID;
    primary_campaign_id UUID;
    sample_cipher TEXT;
    i INT;
BEGIN
    SELECT id INTO org_id FROM users WHERE email = 'pengelola@demo.local' LIMIT 1;
    SELECT id INTO donor_id FROM users WHERE email = 'donatur@demo.local' LIMIT 1;

    IF org_id IS NULL OR donor_id IS NULL THEN
        RAISE NOTICE 'seed_datatable_scroll: lewati — buat akun demo dulu (docs/10-AKSES-LOGIN.md).';
        RETURN;
    END IF;

    SELECT encrypted_amount INTO sample_cipher
    FROM donations
    WHERE encrypted_amount IS NOT NULL AND encrypted_amount <> ''
    ORDER BY created_at DESC
    LIMIT 1;

    IF sample_cipher IS NULL THEN
        sample_cipher := 'seed-demo-ciphertext';
    END IF;

    -- Delapan campaign tambahan → tabel "Campaign saya" (>7 baris).
    FOR i IN 1..8 LOOP
        INSERT INTO campaigns (
            id,
            title,
            description,
            target_amount,
            max_donation,
            status,
            created_by,
            category,
            location
        )
        VALUES (
            ('d1000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
            'Demo scroll UI ' || i::text,
            'Campaign contoh untuk uji scroll tabel di halaman Campaign saya.',
            50000000,
            5000000,
            'active',
            org_id,
            'Demo',
            'Lokal'
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;

    SELECT id INTO primary_campaign_id
    FROM campaigns
    WHERE created_by = org_id
      AND status = 'active'
      AND title = 'Beasiswa SD Negeri Harapan'
    LIMIT 1;

    IF primary_campaign_id IS NULL THEN
        SELECT id INTO primary_campaign_id
        FROM campaigns
        WHERE created_by = org_id AND status = 'active'
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    IF primary_campaign_id IS NULL THEN
        RAISE NOTICE 'seed_datatable_scroll: tidak ada campaign aktif pengelola — buat campaign dulu.';
        RETURN;
    END IF;

    -- Sebelas donasi terkonfirmasi → riwayat donatur (>10), tab campaign, Donasi masuk organizer.
    FOR i IN 1..11 LOOP
        INSERT INTO donations (
            id,
            campaign_id,
            donor_id,
            commitment,
            encrypted_amount,
            zk_proof,
            tx_hash,
            status,
            idempotency_key,
            created_at
        )
        VALUES (
            ('d2000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
            primary_campaign_id,
            donor_id,
            '0xseedscrollcommit' || lpad(i::text, 4, '0'),
            sample_cipher,
            '{"seed":true}',
            '0xseedscrolltx' || lpad(i::text, 8, '0'),
            'confirmed',
            'seed-datatable-scroll-' || lpad(i::text, 3, '0'),
            NOW() - (i || ' hours')::interval
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;

    -- Enam baris archive → tabel admin "Cuplikan archive".
    FOR i IN 1..6 LOOP
        INSERT INTO donations_duplicate_archive (
            id,
            campaign_id,
            donor_id,
            commitment,
            encrypted_amount,
            zk_proof,
            tx_hash,
            status,
            created_at,
            archive_reason
        )
        VALUES (
            ('d3000000-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
            primary_campaign_id,
            donor_id,
            '0xseedarchivecommit' || lpad(i::text, 4, '0'),
            sample_cipher,
            '{"seed":true}',
            '0xseedarchivetx' || lpad(i::text, 8, '0'),
            'confirmed',
            NOW() - (i || ' days')::interval,
            'seed_datatable_scroll demo #' || i::text
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'seed_datatable_scroll: selesai (campaign utama %).', primary_campaign_id;
END $$;
