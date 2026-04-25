-- Add en_status column to track English content quality
-- States: 'missing', 'draft', 'reviewed'

ALTER TABLE minifigures
ADD COLUMN IF NOT EXISTS en_status varchar(20) DEFAULT 'missing';

ALTER TABLE series
ADD COLUMN IF NOT EXISTS en_status varchar(20) DEFAULT 'missing';

ALTER TABLE news
ADD COLUMN IF NOT EXISTS en_status varchar(20) DEFAULT 'missing';

-- Update existing records that have en content to 'draft'
UPDATE minifigures SET en_status = 'draft' WHERE name_en IS NOT NULL AND name_en != '';
UPDATE series SET en_status = 'draft' WHERE title_en IS NOT NULL AND title_en != '';
UPDATE news SET en_status = 'draft' WHERE title_en IS NOT NULL AND title_en != '';
