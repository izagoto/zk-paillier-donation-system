ALTER TABLE donations
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS donations_idempotency_key_unique
    ON donations (idempotency_key)
    WHERE idempotency_key IS NOT NULL AND idempotency_key <> '';
