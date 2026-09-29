CREATE TABLE campaign_aggregates (
    campaign_id UUID PRIMARY KEY REFERENCES campaigns(id),
    encrypted_total TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);