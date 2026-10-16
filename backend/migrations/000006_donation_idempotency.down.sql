DROP INDEX IF EXISTS donations_idempotency_key_unique;

ALTER TABLE donations
    DROP COLUMN IF EXISTS idempotency_key;
