-- Migration: Add Unique Constraint to Minifigures Slug
-- This ensures no new duplicate slugs can be inserted into the database.

-- Drop any existing conflicting indexes if they were partially created
DROP INDEX IF EXISTS idx_minifigures_slug;

-- Create a unique index for fast lookups and constraint enforcement
CREATE UNIQUE INDEX idx_minifigures_slug ON minifigures (slug);

-- Add the unique constraint to the table schema
ALTER TABLE minifigures ADD CONSTRAINT minifigures_slug_key UNIQUE USING INDEX idx_minifigures_slug;
