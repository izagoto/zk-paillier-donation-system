CREATE TABLE donations_duplicate_archive (
    id UUID PRIMARY KEY,
    campaign_id UUID NOT NULL,
    donor_id UUID NOT NULL,
    commitment TEXT NOT NULL,
    encrypted_amount TEXT NOT NULL,
    zk_proof TEXT,
    tx_hash VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archive_reason TEXT NOT NULL
);
