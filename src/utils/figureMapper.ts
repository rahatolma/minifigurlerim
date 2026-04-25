import * as Sentry from '@sentry/nextjs';

export interface FigureCardData {
  id: string;
  figure_name: string;
  figure_slug_tr: string;
  figure_slug_en: string | null;
  figure_code: string | null;
  figure_number: string | null;
  image_url: string | null;
  min_price: number | null;
  max_price: number | null;
  avg_price: number | null;
  rarity_level: string;
  value_score: number | null;
  demand_score: number | null;
  figure_role: string | null;
  figure_type: string | null;
  is_featured: boolean;
  series_id: string;
  series_name: string;
  series_slug_tr: string;
  series_slug_en: string | null;
  series_number: string | null;
  category_main: string;
  final_rarity: string | null;
}

export interface FigureDetailData extends FigureCardData {
  character_name: string | null;
  short_description_tr: string | null;
  short_description_en: string | null;
  piece_count: number | null;
  accessory_count: number | null;
  main_color: string | null;
  thumbnail_url: string | null;
  price_updated_at: string | null;
  is_active: boolean;
  is_published: boolean;
  // Series Extended
  product_code: string | null;
  category_sub: string | null;
  release_date: string | null;
  release_year: string | null;
  release_month: string | null;
  release_month_tr: string | null;
  release_month_en: string | null;
  manual_rarity: string | null;
  computed_rarity: string | null;
  is_limited_production: boolean;
  is_special_production: boolean;
  custom_attributes?: any;
}

/**
 * Normalizes a raw database row (minifigures joined with series) into the strict FigureCardData contract.
 * Fallbacks are safely handled here to ensure pure UI rendering.
 */
// Type-Safe Contract Definition for DB projection mismatch safety
export interface RawListFigureDTO {
  id: string;
  name: string;
  figure_name: string;
  slug_tr: string;
  slug: string;
  slug_en: string;
  figure_code: string;
  code: string;
  figure_number: string;
  thumbnail_url: string;
  image_url: string;
  images: string[];
  min_price: number;
  max_price: number;
  avg_price: number;
  value_usd: number;
  rarity_level: string;
  rarity: string;
  value_score: number;
  demand_score: number;
  figure_role: string;
  role: string;
  figure_type: string;
  type: string;
  is_featured: boolean;
  created_at: string;
  series_id: string;
  series: {
    id: string;
    series_name: string;
    title: string;
    slug_tr: string;
    slug: string;
    slug_en: string;
    series_no: string;
    category_main: string;
    category: string;
    manual_rarity: string;
    rarity: string;
    final_rarity: string;
  };
  
  // Dual-Read Fields from PostgREST Joins (Migration Phase)
  figure_role_id?: string;
  figure_type_id?: string;
  rarity_id?: string;
  role_def?: { name: string };
  type_def?: { name: string };
  rarity_def?: { name: string };
}

// Runtime Contract Guard (Strict Enterprise Validation)
function validateListFigureContract(row: any): boolean {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
     Sentry.captureMessage("MAPPER CONTRACT VIOLATION: Gelen veri geçerli bir JSON objesi değil", "fatal");
     return false;
  }
  
  if (row.thumbnail_url === undefined && row.image_url === undefined && row.images === undefined) {
     Sentry.captureMessage(`MAPPER THUMBNAIL MISSING: Figür ${row.id || 'Bilinmiyor'} fotografsiz. DAL projection hatasi.`, "warning");
  }

  // Soft fail if ID doesn't exist
  if (!row.id) {
     Sentry.captureException(new Error("Gelen figür objesinde ID yok!"));
     return false;
  }

  return true;
}

// --- Relation Normalizer ---
// Supabase bazen relations'ları array olarak döndürür (özellikle inner join olmayan durumlarda).
// Bu fonksiyon array/obje karmaşasını çözer ve güvenli bir obje döndürür.
function normalizeRelation(relation: any): any {
  if (!relation) return {};
  if (Array.isArray(relation)) {
    return relation.length > 0 ? relation[0] : {};
  }
  return relation;
}

export function mapFigureForCard(row: RawListFigureDTO | any, locale: string = 'tr'): FigureCardData | null {
  const isValid = validateListFigureContract(row);
  if (!isValid) return null; // Hard fail: Bozuk kayidi render etme

  const series = normalizeRelation(row.series);
  
  // Determine if we should show English content
  const isEn = locale === 'en' && row.en_status !== 'missing';

  // 1. Figure Name Fallbacks
  const figure_name = isEn && row.name_en ? row.name_en : (row.figure_name || row.name || 'İsimsiz Figür');
  
  // 2. Slug Fallbacks
  const figure_slug_tr = isEn && row.slug_en ? row.slug_en : (row.slug_tr || row.slug || '');
  const figure_slug_en = row.slug_en || null;
  
  // 3. Code & Number
  const figure_code = row.figure_code || row.code || null;
  if (!figure_code) {
    console.warn(`[Mapper] Figure missing figure_code. ID: ${row.id}`);
  }
  const figure_number = row.figure_number || null;
  
  // 4. Rarity levels (DUAL-READ)
  // Önce Supabase Migration A'dan gelen yeni Relation aranır, yoksa legacy string değerleri kullanılır.
  const rarity_def = normalizeRelation(row.rarity_def);
  const rarity_level = rarity_def.name || row.rarity_level || row.rarity || 'Yaygın';
  
  
  // 5. SERIES MAPPING
  const series_id = series.id || row.series_id || '';
  
  const isSeriesEn = locale === 'en' && series.en_status !== 'missing';
  const series_name = isSeriesEn && series.title_en ? series.title_en : (series.series_name || series.title || row.series_name || 'Bilinmeyen Seri');
  const series_slug_tr = isSeriesEn && series.slug_en ? series.slug_en : (series.slug_tr || series.slug || '');
  const series_slug_en = series.slug_en || null;
  const series_number = series.series_number || series.series_no || series.number || null;
  const category_main = series.category_main || series.category || null;
  
  const manual_rarity = series.manual_rarity || series.rarity || null;
  const final_rarity = series.final_rarity || manual_rarity || null;

  const image_url = row.thumbnail_url || row.image_url || (row.images && Array.isArray(row.images) && row.images.length > 0 ? row.images[0] : null);
  if (!image_url) {
    Sentry.captureMessage(`MAPPER THUMBNAIL MISSING: Figür [ID:${row.id}] fotografsiz veya hatalı.`, "warning");
  }

  if (!figure_slug_tr) {
    Sentry.captureMessage(`MAPPER SLUG MISSING: Figür [ID:${row.id}] slug içermiyor. Routing kırılabilir.`, "error");
  }

  if (!series_slug_tr || !series_id) {
    Sentry.captureMessage(`MAPPER SERIES DATA MISSING: Figür [ID:${row.id}] seri relation verisi eksik.`, "warning");
  }

  return {
    id: row.id,
    figure_name,
    figure_slug_tr,
    figure_slug_en,
    figure_code,
    figure_number,
    image_url,
    min_price: row.min_price || null,
    max_price: row.max_price || null,
    avg_price: row.avg_price || null,
    rarity_level,
    value_score: row.value_score || null,
    demand_score: row.demand_score || null,
    
    // Dual-Read Fallbacks
    figure_role: row.role_def?.name || row.figure_role || row.role || null,
    figure_type: row.type_def?.name || row.figure_type || row.type || null,
    
    is_featured: !!row.is_featured,
    
    // Extracted Series
    series_id,
    series_name,
    series_slug_tr,
    series_slug_en,
    series_number,
    category_main,
    final_rarity
  };
}

/**
 * Normalizes a raw database row (minifigures joined with series) into the strict FigureDetailData contract.
 */
export function mapFigureForDetail(row: any, locale: string = 'tr'): FigureDetailData | null {
  const baseCard = mapFigureForCard(row, locale);
  if (!baseCard) return null;
  
  const series = normalizeRelation(row.series);

  const isEn = locale === 'en' && row.en_status !== 'missing';
  const short_description_tr = isEn && row.short_description_en ? row.short_description_en : (row.short_description_tr || row.description || null);
  const release_date = series.release_date || null;
  const release_year = series.release_year || (release_date ? release_date.substring(0, 4) : null);
  const manual_rarity = series.manual_rarity || series.rarity || null;

  return {
    ...baseCard,
    character_name: row.character_name || null,
    short_description_tr,
    short_description_en: row.short_description_en || null,
    piece_count: typeof row.piece_count === 'number' ? row.piece_count : null,
    accessory_count: typeof row.accessory_count === 'number' ? row.accessory_count : null,
    main_color: row.main_color || null,
    thumbnail_url: row.thumbnail_url || null,
    price_updated_at: row.price_updated_at || null,
    is_active: row.is_active !== false,
    is_published: row.is_published !== false,
    
    // Extended Series
    product_code: series.product_code || null,
    category_sub: series.category_sub || null,
    release_date,
    release_year,
    release_month: series.release_month || null,
    release_month_tr: series.release_month_tr || null,
    release_month_en: series.release_month_en || null,
    manual_rarity,
    computed_rarity: series.computed_rarity || null,
    is_limited_production: !!series.is_limited_production,
    is_special_production: !!series.is_special_production,
    custom_attributes: row.custom_attributes || null
  };
}
