import { createPublicClient } from '@/utils/supabase/public';
import { notFound } from 'next/navigation';
import { sanitizeFilter, captureDalError } from '@/utils/dalHelpers';
import { normalizeRarityKey } from '@/utils/filterHelpers';

import { RawListFigureDTO } from '@/utils/figureMapper';

export interface SeriesDTO {
  id: string;
  name: string;
  title: string;
  title_en: string;
  slug_tr: string;
  slug: string;
  slug_en: string;
  series_no: string;
  category_main: string;
  category: string;
  manual_rarity: string;
  rarity: string;
  base_url: string;
  cover_image_url: string;
  figure_count: number;
  total_views: number;
  created_at: string;
  updated_at: string;
  description: string;
  description_en: string;
  is_active: boolean;
  is_published: boolean;
  release_year: string;
  blocks: any;
  [key: string]: any;
}

export type PostDTO = Record<string, any>;
export type FaqDTO = Record<string, any>;
export type UserCollectionDTO = Record<string, any>;

import { cache } from 'react';

/**
 * Data Access Layer (DAL)
 * Bileşen içlerinden doğrudan Supabase çağrısını önler, Next.js cache() ile tekrar eden SQL sorgularını birleştirir.
 */

const extractYearMonthScore = (item: any) => {
  let year = 2010;
  if (item.release_year) {
    const parsed = parseInt(String(item.release_year).trim().replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 1900) year = parsed;
  } else if (item.created_at) {
    year = new Date(item.created_at).getFullYear();
  }

  let month = 1;
  if (item.release_month) {
    const m = String(item.release_month).trim().toLowerCase();
    const months = ['ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos', 'eylül', 'ekim', 'kasım', 'aralık'];
    const index = months.indexOf(m);
  }
  return (year * 100) + month;
};

import { MINIFIGURES_SELECT_FIELDS } from '@/utils/queries';

// Tüm Serileri Getir
export const getSeriesList = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('series').select('id, title, slug_tr, slug_en, description, description_blocks_en, is_active, release_year, category, category_main, cover_image_url, hero_image_url, content_blocks, series_no, rarity, figure_count, is_published, total_views, title_en, en_status, en_translation_status')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as any;
});

// Tüm Figürleri Getir (Katalog İçin)
export const getAllMinifigures = cache(async (): Promise<RawListFigureDTO[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigures').select(MINIFIGURES_SELECT_FIELDS)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as any;
});

// Tüm serileri dropdown vs için getir
export const getAllSeries = cache(async (): Promise<SeriesDTO[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('series').select('id, title, slug_tr, slug_en, description, description_blocks_en, is_active, release_year, category, category_main, cover_image_url, hero_image_url, content_blocks, series_no, rarity, figure_count, is_published, total_views, title_en, en_status, en_translation_status')
    .order('created_at', { ascending: false });

  if (error) throw error;

  let sortedData = [...(data as any[])];
  sortedData.sort((a, b) => {
    const scoreA = extractYearMonthScore(a);
    const scoreB = extractYearMonthScore(b);
    if (scoreB !== scoreA) return scoreB - scoreA;
    const _noA = parseInt(a.series_no) || 0;
    const _noB = parseInt(b.series_no) || 0;
    return _noB - _noA;
  });

  return sortedData as any;
});

// Single Seriyi Getir (Slug veya UUID bazlı detay)
export const getSeriesBySlug = cache(async (slug: string, locale?: string) => {
  const supabase = createPublicClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let query = supabase.from('series').select('id, title, slug, slug_tr, slug_en, description, description_blocks_en, is_active, release_year, category, category_main, cover_image_url, hero_image_url, content_blocks, series_no, rarity, figure_count, is_published, total_views, title_en, en_status, en_translation_status');
  if (isUUID) {
    query = query.eq('id', slug);
  } else {
    // Search all slugs regardless of locale so that bi-directional redirects can catch mismatched slugs
    query = query.or(`slug.eq.${slug},slug_tr.eq.${slug},slug_en.eq.${slug}`);
  }

  const { data, error } = await query.single();

  // Return null if not found instead of throwing, so the page can handle notFound()
  if (error || !data) return null;
  return data as any;
});

// Serinin İçindeki Figürleri Getir (Katalog)
export const getFiguresBySeries = cache(async (seriesIdOrName: string, isId: boolean = false) => {
  const supabase = createPublicClient();
  const filterCol = isId ? 'series_id' : 'series_name';

  const { data, error } = await supabase
    .from('minifigures').select(`${MINIFIGURES_SELECT_FIELDS}, series(id, slug_tr, slug_en, title, title_en, release_year, release_month)`)
    .eq(filterCol, seriesIdOrName)
    .order('figure_number', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return [];

  const sortedData = data.sort((a: any, b: any) => {
    const numA = parseInt(a.figure_number || '0');
    const numB = parseInt(b.figure_number || '0');
    return numA - numB;
  });

  return sortedData as any;
});

// Single Figürü Getir (Slug veya UUID)
export const getMinifigureBySlug = cache(async (slug: string, locale?: string, seriesSlug?: string) => {
  const supabase = createPublicClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const queryCol = isUUID ? 'id' : 'slug';

  let selectRaw = MINIFIGURES_SELECT_FIELDS;

  if (seriesSlug) {
    selectRaw += ', series!inner(id, slug_tr, slug_en, title, title_en, series_no, category, category_main, release_year, release_month, release_month_tr, release_date)';
  } else {
    selectRaw += ', series(id, slug_tr, slug_en, title, title_en, series_no, category, category_main, release_year, release_month, release_month_tr, release_date)';
  }

  let query = supabase.from('minifigures').select(selectRaw);

  if (isUUID) {
    query = query.eq('id', slug);
  } else {
    if (locale === 'en') {
      query = query.or(`slug_en.eq.${slug},slug.eq.${slug}`);
    } else if (locale === 'tr') {
      query = query.or(`slug_tr.eq.${slug},slug.eq.${slug}`);
    } else {
      query = query.or(`slug.eq.${slug},slug_tr.eq.${slug},slug_en.eq.${slug}`);
    }

    if (seriesSlug) {
      if (locale === 'en') {
        query = query.or(`slug_en.eq.${seriesSlug},slug.eq.${seriesSlug}`, { foreignTable: 'series' });
      } else if (locale === 'tr') {
        query = query.or(`slug_tr.eq.${seriesSlug},slug.eq.${seriesSlug}`, { foreignTable: 'series' });
      } else {
        query = query.or(`slug.eq.${seriesSlug},slug_tr.eq.${seriesSlug},slug_en.eq.${seriesSlug}`, { foreignTable: 'series' });
      }
    }
  }

  const { data, error } = await query
    .order('is_published', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0] as any;
});

export const getMinifigureFilterOptions = cache(async (
  filters: { series?: string } = {}
) => {
  const supabase = createPublicClient();
  let selectRaw = 'role, type, rarity, rarity_level';
  
  const safeSeries = sanitizeFilter(filters.series);
  const isId = safeSeries ? /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(safeSeries) : false;

  if (safeSeries && safeSeries !== 'all' && !isId) {
    selectRaw += ', series!inner(id, slug_tr, slug_en, slug)';
  }

  let query = supabase
    .from('minifigures')
    .select(selectRaw)
    .order('created_at', { ascending: false });

  if (safeSeries && safeSeries !== 'all') {
    if (isId) {
      query = query.eq('series_id', safeSeries);
    } else {
      query = query.or(`slug.eq.${safeSeries},slug_tr.eq.${safeSeries},slug_en.eq.${safeSeries}`, { foreignTable: 'series' });
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  // Read-time Normalization for Rarity
  data.forEach((row: any) => {
    row.normalized_rarity = normalizeRarityKey(row.rarity, row.rarity_level);
  });

  return data as any;
});

// Paginated getMinifigures for list
export const getMinifigureListItems = cache(async (
  filters: { series?: string; role?: string; type?: string; rarity?: string; sort?: string } = {},
  limit: number = 36,
  offset: number = 0
): Promise<{ data: RawListFigureDTO[], count: number | null }> => {
  const supabase = createPublicClient();
  let selectRaw = 'id, created_at, series_id, name, brand, category, series_name, series_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published';
  
  const safeSeries = sanitizeFilter(filters.series);
  const isId = safeSeries ? /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(safeSeries) : false;

  if (safeSeries && !isId) {
    selectRaw += ', series!inner(id, slug_tr, slug_en, slug, title, title_en, release_year, release_month, series_no)';
  } else {
    selectRaw += ', series(id, slug_tr, slug_en, slug, title, title_en, release_year, release_month, series_no)';
  }

  let query = supabase
    .from('minifigures').select(selectRaw, { count: "exact" });

  if (safeSeries) {
    if (isId) {
      query = query.eq('series_id', safeSeries);
    } else {
      query = query.or(`slug.eq.${safeSeries},slug_tr.eq.${safeSeries},slug_en.eq.${safeSeries}`, { foreignTable: 'series' });
    }
  }
  const safeRole = sanitizeFilter(filters.role);
  if (safeRole) query = query.eq('role', safeRole);

  const safeType = sanitizeFilter(filters.type);
  if (safeType) query = query.eq('type', safeType);

  const safeRarity = sanitizeFilter(filters.rarity);
  if (safeRarity) {
    const reverseRarityMap: Record<string, string[]> = {
      'common': ['Yaygın', 'Yaygin', 'common'],
      'rare': ['Nadir', 'rare'],
      'epic': ['Çok Nadir', 'Cok Nadir', 'Destansı', 'Destansi', 'epic'],
      'legendary': ['Efsanevi', 'legendary']
    };
    const mappedValues = reverseRarityMap[safeRarity.toLowerCase()] || [safeRarity];
    const orConditions = mappedValues.flatMap(v => [`rarity.eq."${v}"`, `rarity_level.eq."${v}"`]);
    query = query.or(orConditions.join(','));
  }

  query = query.eq('is_published', true);

  const sortParam = filters.sort || 'newest';
  switch (sortParam) {
    case 'popular':
      query = query.order('total_views', { ascending: false, nullsFirst: false })
        .order('series(release_year)', { ascending: false, nullsFirst: false })
        .order('series(series_no)', { ascending: false, nullsFirst: false });
      break;
    case 'value_desc':
      query = query.order('value_score', { ascending: false, nullsFirst: false })
        .order('series(release_year)', { ascending: false, nullsFirst: false })
        .order('series(series_no)', { ascending: false, nullsFirst: false });
      break;
    case 'oldest':
      query = query.order('series(release_year)', { ascending: true, nullsFirst: false })
        .order('series(series_no)', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });
      break;
    case 'newest':
    default:
      query = query.order('series(release_year)', { ascending: false, nullsFirst: false })
        .order('series(series_no)', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    captureDalError('getMinifigureListItems', error, { filters, limit, offset });
    throw error;
  }

  return { data: data as any, count };
});

export const getSeriesListItems = cache(async (
  filters: { category?: string; series?: string } = {},
  sortParam?: string
): Promise<SeriesDTO[]> => {
  const supabase = createPublicClient();
  let query = supabase
    .from('series_with_value_summary')
    .select('id, title, slug_tr, slug_en, description, description_blocks_en, is_active, release_year, category, category_main, cover_image_url, hero_image_url, content_blocks, series_no, rarity, original_figure_count, is_published, total_views, title_en, en_status, en_translation_status, created_at, total_value_score, active_figure_count');

  query = query.eq('is_published', true);

  const safeCategory = sanitizeFilter(filters.category);
  if (safeCategory) query = query.eq('category', safeCategory);

  const safeSeries = sanitizeFilter(filters.series);
  if (safeSeries) query = query.eq('slug_tr', safeSeries);

  // Uygulama sıralaması
  switch (sortParam) {
    case 'popular':
      query = query
        .order('total_views', { ascending: false })
        .order('release_year', { ascending: false })
        .order('series_no', { ascending: false, nullsFirst: false });
      break;
    case 'oldest':
      query = query
        .order('release_year', { ascending: true })
        .order('series_no', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });
      break;
    case 'value_desc':
      query = query
        .order('total_value_score', { ascending: false })
        .order('release_year', { ascending: false })
        .order('series_no', { ascending: true, nullsFirst: false });
      break;
    case 'newest':
    default:
      query = query
        .order('release_year', { ascending: false })
        .order('series_no', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) {
    captureDalError('getSeriesListItems', error, { filters, sortParam });
    throw error;
  }

  // Restore figure_count alias for frontend compatibility
  const mappedData = data?.map(row => ({
    ...row,
    figure_count: row.original_figure_count
  })) || [];

  // JS Sıralama (Database string number karşılaştırması hatalarını önlemek için)
  let sortedData = [...(mappedData as any[])];

  switch (sortParam) {
    case 'popular':
      sortedData.sort((a, b) => {
        if (b.total_views !== a.total_views) return (b.total_views || 0) - (a.total_views || 0);
        const scoreA = extractYearMonthScore(a);
        const scoreB = extractYearMonthScore(b);
        if (scoreB !== scoreA) return scoreB - scoreA;
        const _noA = parseInt(a.series_no) || 0;
        const _noB = parseInt(b.series_no) || 0;
        return _noB - _noA;
      });
      break;
    case 'oldest':
      sortedData.sort((a, b) => {
        const scoreA = extractYearMonthScore(a);
        const scoreB = extractYearMonthScore(b);
        if (scoreA !== scoreB) return scoreA - scoreB;
        const _noA = parseInt(a.series_no) || 0;
        const _noB = parseInt(b.series_no) || 0;
        return _noA - _noB;
      });
      break;
    case 'value_desc':
      // Sorted exactly via DB (total_value_score)
      break;
    case 'newest':
    default:
      sortedData.sort((a, b) => {
        const scoreA = extractYearMonthScore(a);
        const scoreB = extractYearMonthScore(b);
        if (scoreB !== scoreA) return scoreB - scoreA;
        const _noA = parseInt(a.series_no) || 0;
        const _noB = parseInt(b.series_no) || 0;
        return _noB - _noA;
      });
      break;
  }

  return sortedData as any;
});

