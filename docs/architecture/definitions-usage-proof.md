# Definitions Usage Proof Report

## Objective
This report verifies that hiding (and eventually deleting) the legacy definition groups (`marka`, `seri-adi`, `seri-no`, `seri-kategori`, `seri-kategorisi`) does NOT break the public application, collection logic, or the admin figure creation flow.

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
**Is it dependent on hidden groups?** No.
Figure cards display the series name and rarity. The series name is pulled directly from the `minifigures` table (`figure.series_name` or `figure.series.title`), and rarity is pulled via the `rarity_level` (or `rarity_id`).

### Public Figure Detail Page (`/figurler/[slug]/page.tsx`)
**Is it dependent on hidden groups?** No.
The detail page fetches the figure and populates breadcrumbs/metadata using `figure.series_name` and `figure.category`. These are native text columns or JOINs to the `series` table.

### Collection Filters (`/koleksiyonum`)
**Is it dependent on hidden groups?** No.
Filters are generated based on actual distinct values in the `series` table or the native `rarity` relations.

## 3. Admin Route Proof

### Admin Figure Edit/New Form (`/cto/figurler/yeni/page.tsx`)
**Does it break if we hide these groups?** No.
The code inherently recognizes these as special or native fields. In fact, the dynamic attribute renderer already explicitly ignores them:
```typescript
{defGroups.filter(g => !['figur-rolu', 'figur-tipi', 'nadirlik-derecesi', 'marka', 'seri-adi', 'seri-no', 'seri-kategori'].includes(g.slug)).length > 0 && ...}
```
The form relies on `seriesList` (fetched from `series` table) to populate the "Seri Adı" dropdown, not the definitions table.

## Conclusion
The UI hiding in Phase 4B-1 is completely safe. The platform is decoupled from these specific taxonomy records, making them purely vestigial data.
