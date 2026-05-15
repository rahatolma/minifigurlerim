# Definitions Usage Proof Report

## Objective
This report verifies the current dependencies on the legacy definition groups (`marka`, `seri-adi`, `seri-no`, `seri-kategori`, `seri-kategorisi`) to ensure hiding them from the UI is stable.

## 1. Native Database Columns (The Single Source of Truth)

The platform architecture already relies on native database columns for these entities, bypassing the `categories` taxonomy tables.

### `series` Table Native Columns
- `title` (Series Name)
- `category` (Series Category)
- `series_no` (Series Number)

### `minifigures` Table Native Columns
- `brand` (Brand)
- `series_id` (Foreign Key to `series`)
- `series_name` (Denormalized)
- `category` (Denormalized)
- `figure_role_id` (Foreign Key to `categories` taxonomy)
- `figure_type_id` (Foreign Key to `categories` taxonomy)
- `rarity_id` (Foreign Key to `categories` taxonomy)

## 2. Public Route Proof

### Public Figure Card (`FigureCard.tsx` / `FigureCardClient.tsx`)
**Dependency Check:** No known active dependency found in audited routes.
Figure cards display the series name and rarity. The series name is pulled directly from the `minifigures` table (`figure.series_name` or `figure.series.title`), and rarity is pulled via the `rarity_level` (or `rarity_id`).

### Public Figure Detail Page (`/figurler/[slug]/page.tsx`)
**Dependency Check:** No known active dependency found in audited routes.
The detail page fetches the figure and populates breadcrumbs/metadata using `figure.series_name` and `figure.category`. These are native text columns or JOINs to the `series` table.

### Collection Filters (`/koleksiyonum`)
**Dependency Check:** No known active dependency found in audited routes.
Filters are generated based on actual distinct values in the `series` table or the native `rarity` relations.

## 3. Admin Route Proof

### Admin Figure Edit/New Form (`/cto/figurler/yeni/page.tsx` & `[id]/page.tsx`)
**Dependency Check:** No known active dependency found in audited routes.
The code inherently recognizes these as special or native fields. The dynamic attribute renderer explicitly filters them:
```typescript
{defGroups.filter(g => !['figur-rolu', 'figur-tipi', 'nadirlik-derecesi', 'marka', 'seri-adi', 'seri-no', 'seri-kategori', 'seri-kategorisi'].includes(g.slug)).length > 0 && ...}
```
*Note: The duplicate group slug `seri-kategorisi` was successfully added to the explicit exclusion filter list in Phase 4B-1 to prevent it from leaking into the form.*

The form relies on `seriesList` (fetched from `series` table) to populate the "Seri Adı" dropdown, not the definitions table.

## Conclusion
Currently treated as legacy/hidden groups. DB deletion requires separate migration review in the future. Hiding them from the UI in Phase 4B-1 does not break audited routes.
