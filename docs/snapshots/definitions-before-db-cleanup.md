# Definitions Architecture Snapshot (Phase 4B-1)

## Overview
This snapshot documents the state of the `definition_groups` and `categories` tables before any database cleanup operations are executed. In Phase 4B-1, certain legacy groups were intentionally **hidden from the Admin UI** to prevent data entry confusion, but they remain perfectly intact in the database.

## Hidden Definition Groups
The following group slugs have been hidden from the `/cto/tanimlar` and `/admin/tanimlar` routes:
- `marka` (Brand)
- `seri-adi` (Series Name)
- `seri-no` (Series Number)
- `seri-kategori` (Series Category)
- `seri-kategorisi` (Series Category - Duplicate)

## Why Are They Hidden?
These fields are **Entity fields** or **System properties**, not reusable taxonomies:
1. **Series Properties** (`seri-adi`, `seri-no`, `seri-kategori`): These belong natively to the `series` table. Managing them as abstract "Taxonomies" in a separate table creates duplication and breaks relational integrity.
2. **Brand** (`marka`): The platform is heavily focused on LEGO®. While `brand` exists natively as a column on the `minifigures` table, managing it via the dynamic definitions interface is unnecessary overhead.

## Future Action (Phase 4B-3 / Phase 4C)
These hidden records are scheduled for a formal database cleanup (DELETE migrations) in a subsequent phase, ONLY AFTER the duplicate prevention logic and `series` foreign-key constraints are fully validated.

## Rollback Procedure
If these fields need to be visible again in the UI before the DB cleanup, simply remove them from the `hiddenSlugs` array in `src/app/cto/(protected)/tanimlar/page.tsx` and `src/app/admin/(protected)/tanimlar/page.tsx`:
```typescript
const hiddenSlugs = ['marka', 'seri-adi', 'seri-no', 'seri-kategori', 'seri-kategorisi'];
```
