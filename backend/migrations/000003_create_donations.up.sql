CREATE TABLE donations (
    id UUID PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    donor_id UUID NOT NULL REFERENCES users(id),

    commitment TEXT NOT NULL,
    encrypted_amount TEXT NOT NULL,
    zk_proof TEXT,

    tx_hash VARCHAR(255),

    status VARCHAR(50) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);