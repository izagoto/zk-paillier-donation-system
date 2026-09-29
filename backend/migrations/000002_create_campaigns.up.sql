CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount NUMERIC(20, 0) NOT NULL,
    max_donation NUMERIC(20, 0) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);