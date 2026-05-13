-- Migration: Collection Domain Model Freeze - Phase 1 (Additive)
-- Description: Adds quantity and trade intent columns to user_collections table.
-- Maintains backward compatibility with legacy `status` column.

-- 1. Add new columns with defaults and non-negative constraints
ALTER TABLE user_collections
ADD COLUMN owned_qty integer DEFAULT 0 NOT NULL CHECK (owned_qty >= 0),
ADD COLUMN want_qty integer DEFAULT 0 NOT NULL CHECK (want_qty >= 0),
ADD COLUMN for_trade_qty integer DEFAULT 0 NOT NULL CHECK (for_trade_qty >= 0),
ADD COLUMN condition_notes text;

-- 2. Add business logic constraint (cannot trade more than owned)
ALTER TABLE user_collections
ADD CONSTRAINT check_trade_qty_limit CHECK (for_trade_qty <= owned_qty);

-- 3. Backfill data based on legacy status column
UPDATE user_collections SET owned_qty = 1 WHERE status = 'have';
UPDATE user_collections SET want_qty = 1 WHERE status = 'want';

-- Rollback SQL (For Documentation purposes):
-- ALTER TABLE user_collections DROP COLUMN condition_notes, DROP COLUMN for_trade_qty, DROP COLUMN want_qty, DROP COLUMN owned_qty;
