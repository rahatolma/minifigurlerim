# Collection Domain Model Freeze

This document serves as the single source of truth for the final domain architecture of the Minifigurlerim Collection System. It outlines the current constraints, the finalized target model, product decisions, and a safe, backward-compatible migration strategy.

## 1. Current Collection Model
- **Table Structure:** The `user_collections` table stores the state of a user's collection.
- **Status Logic:** Relies on a single `status` string enum (`'have'` or `'want'`).
- **Constraints:** A strict `UNIQUE(user_id, minifigure_id)` constraint ensures only one record exists per user per figure.
- **Trigger Behavior:** A database trigger (`trg_sync_user_collections`) automatically updates global counters (`collection_count_30d` and `favorite_count_30d`) in the `minifigures` table based on the `status` value.
- **Capabilities & Limits:** Users can either "have" or "want" a figure. They cannot specify ownership of multiple quantities, nor can they simultaneously "have" and "want" the same figure.

## 2. Final Target Model
The target model expands the capabilities while preserving the high-performance constraints of the database:
- `owned_qty`: `integer`, `DEFAULT 0`
- `want_qty`: `integer`, `DEFAULT 0`
- `for_trade_qty`: `integer`, `DEFAULT 0`
- `condition_notes`: `text`, `NULLABLE`
- **Constraints:** The `UNIQUE(user_id, minifigure_id)` constraint is **strictly preserved** to prevent database bloat and race conditions.
- **Series Completion Stats:** Calculated based on `DISTINCT minifigure_id` where `owned_qty > 0`, ensuring that possessing multiple duplicates of the same figure does not artificially inflate the series completion percentage.

## 3. Explicit Product Decisions
- **Multiple Quantities:** Supported. Users can indicate they own duplicates of the same figure.
- **Simultaneous "Have" and "Want":** Supported. A user can own a figure (e.g., loose) but still have it on their wishlist (e.g., seeking a sealed copy).
- **Trade Intent:** Groundwork for `for_trade_qty` is laid down at the database level, but will remain hidden from the UI in this phase.
- **Deferred Financials:** Tracking specific "Acquisition Price" or "Acquisition Date" is intentionally postponed to avoid complexity with averaged costs across multiple quantities.
- **Deferred Media:** Custom user-uploaded photos of their specific figures are postponed due to S3 storage costs and moderation requirements.
- **Deferred Profiles:** Public collector profiles/showcases are scheduled for a future phase after the domain model is proven.

## 4. Migration Strategy
To ensure zero downtime and zero data loss, the migration will be executed in four distinct phases:

### Phase 1 — Additive Migration
- Add the new columns (`owned_qty`, `want_qty`, `for_trade_qty`, `condition_notes`) to the schema.
- Retain the existing `status` column.
- Execute data backfill:
  - Records where `status = 'have'` → `owned_qty = 1`
  - Records where `status = 'want'` → `want_qty = 1`

### Phase 2 — DAL Compatibility
- Update the Data Access Layer (DAL) to read from and prioritize the new quantity columns.
- The `status` column acts as a strict fallback to ensure backward compatibility.

### Phase 3 — UI Interaction Update
- Transition the UI to an `owned_qty` and `want_qty` interaction paradigm.
- Separate "Bende Var" and "İstiyorum" buttons to allow simultaneous toggling/incrementing.
- Enable users to declare both possession and desire concurrently.

### Phase 4 — Cleanup
- Safely `DROP` the legacy `status` column only after all UI and DAL components have fully migrated and stabilized in production.

## 5. Trigger Strategy
Global interaction counts (`collection_count_30d`, `favorite_count_30d`) represent *unique users*, not total piece quantities:
- When `owned_qty` transitions from `0 → 1`: Counter increments by `+1`.
- When `owned_qty` transitions from `1 → 2`: Counter does **not** change.
- When `owned_qty` transitions from `1 → 0`: Counter decrements by `-1`.
- The exact same distinct user counting logic applies to `want_qty` and `favorite_count_30d`.

## 6. Data Integrity Rules
- **Non-Negative Constraints:** All quantity fields (`owned_qty`, `want_qty`, `for_trade_qty`) must strictly be `>= 0`.
- **Trade Limit Validation:** `for_trade_qty` must be `<= owned_qty` (a user cannot trade more than they own).
- **Row Hygiene:** No orphan rows permitted.
- **Duplicate Prevention:** No duplicate rows permitted (`UNIQUE(user_id, minifigure_id)` enforcement).
- **Concurrency:** Existing race condition protections via `UPSERT onConflict` logic are preserved.

## 7. Rollback Plan
- **Safety:** The additive nature of Phase 1 makes rolling back completely safe.
- **Backward Compatibility:** The existing UI and APIs can continue reading and writing to the `status` column without disruption.
- **Zero Impact:** If issues arise, reverting the DAL/UI code to previous commits will seamlessly restore standard operation without requiring immediate database column rollbacks.

## 8. Intentionally Postponed
The following features are formally excluded from this iteration to maintain focus on the core interaction loop:
- Acquisition Price and Date tracking.
- Detailed Condition grading (e.g., Sealed, Used, Damaged).
- Public Collection Showcase & Leaderboards.
- P2P Marketplace features.
- User-uploaded photos of specific physical figures.
