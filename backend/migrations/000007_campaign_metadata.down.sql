ALTER TABLE campaigns
    DROP COLUMN IF EXISTS image_url,
    DROP COLUMN IF EXISTS category,
    DROP COLUMN IF EXISTS location;
