import { createClient } from "@/utils/supabase/server";

import { createPublicClient } from '@/utils/supabase/public';
import { notFound } from 'next/navigation';
import { sanitizeFilter, captureDalError } from '@/utils/dalHelpers';

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
  release_year: string ;
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

// Tüm Serileri Getir
export const getSeriesList = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('series').select('id, title, slug_tr, slug_en, description, description_blocks_en, is_active, release_year, category, category_main, cover_image_url, hero_image_url, content_blocks, series_no, rarity, figure_count, is_published, total_views, title_en')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as any;
});

// Seriye Ait Tüm Figürlerin Temel Bilgisini Getir (Önizleme İçin)
export const getPreviewFiguresForSeries = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigures').select('id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as any;
});

// Önizleme veya son eklenen Figürler
export const getFeaturedMinifigures = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigures').select('id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) throw error;
  return data as any;
});

// Tüm Figürleri Getir (Katalog İçin)
export const getAllMinifigures = cache(async (): Promise<RawListFigureDTO[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigures').select('id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as any;
});

// Tüm serileri dropdown vs için getir
export const getAllSeries = cache(async (): Promise<SeriesDTO[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('series').select('id, title, slug_tr, slug_en, description, description_blocks_en, is_active, release_year, category, category_main, cover_image_url, hero_image_url, content_blocks, series_no, rarity, figure_count, is_published, total_views, title_en')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as any;
});

// Popüler Haberleri / Blogları Getir
export const getLatestNews = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('news').select('id, title, slug, summary, content, cover_image_url, status, total_views, daily_views, min_read, created_at, cover_image_vertical_url, title_en, content_blocks_en')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) throw error;
  return data as any;
});

// Anasayfa Slaytlarını Getir
export const getHomeSliders = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('home_sliders')
    .select('id, title, subtitle, button1_text, button1_link, button2_text, button2_link, image_url, is_active, sort_order, created_at, location')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as any;
});

// Sadece en son 12 Seri Getir (Anasayfa) - Gerçek Kronolojik Sıralama (Yıl/Ay)
export const getLatestSeries = cache(async (): Promise<SeriesDTO[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('series').select('id, title, slug_tr, slug_en, description, description_blocks_en, is_active, release_year, category, category_main, cover_image_url, hero_image_url, content_blocks, series_no, rarity, figure_count, is_published, total_views, title_en')
    .order('created_at', { ascending: false })
    .limit(100); // Havuzu geniş tuttuk ki JS ile kronolojik dizebilelim

  if (error) throw error;
  
  if (!data) return [];

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
       const months = ['ocak','şubat','mart','nisan','mayıs','haziran','temmuz','ağustos','eylül','ekim','kasım','aralık'];
       const index = months.indexOf(m);
       if (index !== -1) month = index + 1;
    } else if (item.created_at) {
       month = new Date(item.created_at).getMonth() + 1;
    }
    return (year * 100) + month; 
  };

  const sortedData = [...(data as any[])].sort((a, b) => {
    const scoreA = extractYearMonthScore(a);
    const scoreB = extractYearMonthScore(b);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return sortedData.slice(0, 12);
});

// Sadece en son 12 Figür Getir (Anasayfa)
export const getLatestFigures = cache(async (): Promise<RawListFigureDTO[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigures').select('id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published, series(id, slug_tr, slug_en, title, title_en)')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) throw error;
  if (error) throw error;
  return data as any;
});

// Explore Sayfası İçin Figürleri Getir
export const getExploreFigures = cache(async (limit = 24): Promise<RawListFigureDTO[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigures').select('id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published, series(id, slug_tr, slug_en, title, title_en)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as any;
});

// En Çok Talep Gören 6 Figür (Anasayfa)
export const getTopDemandedFigures = cache(async (limit = 6) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigures').select('id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published, series(id, slug_tr, slug_en, title, title_en)')
    .not('demand_score', 'is', null) // Sadece skoru hesaplanmışlar
    .order('demand_score', { ascending: false })
    .order('view_count_30d', { ascending: false }) // Eşitlik durumunda etkileşime bak
    .limit(limit);

  if (error) throw error;
  return data as any;
});

// En Değerli 6 Figür (Anasayfa)
export const getTopValuedFigures = cache(async (limit = 6) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigures').select('id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published, series(id, slug_tr, slug_en, title, title_en)')
    .not('value_score', 'is', null) // Sadece skoru hesaplanmışlar
    .order('value_score', { ascending: false })
    .limit(limit * 2); // Havuzu azıcık geniş tut, tekrarı önlemek için JS ile kırpacağız

  if (error) throw error;
  return data as any;
});

// Single Seriyi Getir (Slug veya UUID bazlı detay)
export const getSeriesBySlug = cache(async (slug: string) => {
  const supabase = createPublicClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  let query = supabase.from('series').select('id, title, slug_tr, slug_en, description, description_blocks_en, is_active, release_year, category, category_main, cover_image_url, hero_image_url, content_blocks, series_no, rarity, figure_count, is_published, total_views, title_en');
  if (isUUID) {
    query = query.eq('id', slug);
  } else {
    query = query.or(`slug.eq.${slug},slug_en.eq.${slug}`);
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
    .from('minifigures').select('id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published, series(id, slug_tr, slug_en, title, title_en)')
    .eq(filterCol, seriesIdOrName)
    .order('figure_no', { ascending: true })
    .order('created_at', { ascending: true });
    
  if (error) return [];
  return data as any;
});

// Single Figürü Getir (Slug veya UUID)
export const getMinifigureBySlug = cache(async (slug: string) => {
  const supabase = createPublicClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const queryCol = isUUID ? 'id' : 'slug';

  const { data, error } = await supabase
    .from('minifigures').select('id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published, series(id, slug_tr, slug_en, title, title_en)')
    .eq(queryCol, slug)
    .single();

  if (error || !data) return null;
  return data as any;
});

// Definitions Çekimi
export const getDefinitions = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('definition_groups').select('id, created_at, name, slug');
  if (error) return [];
  return data as any;
});

// Figür İçin Finans/Fiyat Geçmişini Getir
export const getFigurePriceHistory = cache(async (figureId: string) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigure_price_history')
    .select('id, minifigure_id, value_usd, recorded_at')
    .eq('minifigure_id', figureId)
    .order('recorded_at', { ascending: true });
    
  if (error) return [];
  return data as any;
});

// Single Haber Getir (Slug)
export const getNewsBySlug = cache(async (slug: string) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('news').select('id, title, slug, summary, content, cover_image_url, status, total_views, daily_views, min_read, created_at, cover_image_vertical_url, title_en, content_blocks_en')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as any;
});

// Tüm Haberleri Getir
export const getAllNews = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('news').select('id, title, slug, summary, content, cover_image_url, status, total_views, daily_views, min_read, created_at, cover_image_vertical_url, title_en, content_blocks_en')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Supabase Kolon Hatası: ${error.message} - Lütfen bu hatanın ekran görüntüsünü atın.`);
  return data as any;
});

// Kategorileri Getir
export const getCategoriesByType = cache(async (type: string) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('categories').select('id, created_at, name, slug, type')
    .eq('type', type)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data as any;
});

// Hakkımızda (About) Settings Getir
export const getAboutSettings = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('about_settings').select('id, hero_image_url, quote_text, quote_author, boss_image_url, boss_title, boss_subtitle, boss_desc, main_title, main_text, mid_image_url, mid_title, mid_subtitle, mid_desc, small_image_url, small_title, small_subtitle, small_desc, join_image_url, join_title, join_text, join_btn_text, join_btn_link, created_at, content, content_en, updated_at').eq('id', 1).single();
  if (error) return null;
  return data as any;
});

// İletişim (Contact) Settings Getir
export const getContactSettings = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('contact_settings').select('id, address, phone, email, updated_at').eq('id', 1).single();
  if (error) return null;
  return data as any;
});

// Aktif FAQ Listesini Getir
export const getActiveFaqs = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('faqs').select('id, question, answer, sort_order, is_active, created_at, question_en, answer_en, order_num')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
    
  if (error) return [];
  return data as any;
});

// Dynamic CMS Sayfasını Getir
export const getPageBySlug = cache(async (slug: string) => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('pages').select('id, slug, title, title_en, content_blocks, content_blocks_en, seo_metadata, created_at, updated_at')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as any;
});

// Koleksiyonum ve Kullanıcı Metodları (Server Actions/Dynamic Routes için)
export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('username').eq('id', userId).single();
  if (error) return null;
  return data as any;
});

export const getUserCollectionsWithDetails = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_collections')
    .select(`
      status,
      created_at,
      minifigures (
        id,
        slug,
        name,
        images,
        series_name,
        series_id,
        value_usd,
        role,
        type,
        rarity,
        min_price,
        max_price,
        avg_price,
        value_score,
        demand_score
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) return [];
  return data as any;
});

export const getTotalMinifiguresCount = cache(async () => {
  const supabase = createPublicClient();
  const { count, error } = await supabase.from('minifigures').select('id', { count: 'exact', head: true });
  if (error) return 0;
  return count || 0;
});

export const getUserSeriesStats = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('user_series_stats').select('id, user_id, series_id, completion_percent, owned_count, total_count').eq('user_id', userId);
  if (error) return [];
  return data as any;
});

export const getMinifigurePriceHistoryBatch = cache(async (figureIds: string[]) => {
  if (!figureIds || figureIds.length === 0) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigure_price_history')
    .select('minifigure_id, value_usd')
    .in('minifigure_id', figureIds)
    .order('recorded_at', { ascending: true });
    
  if (error) return [];
  return data as any;
});

export const getMinifigureFilterOptions = cache(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('minifigures')
    .select('role, type, rarity')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as any;
});


// Paginated getMinifigures for list
export const getMinifigureListItems = cache(async (
  filters: { series?: string; role?: string; type?: string; rarity?: string } = {},
  limit: number = 36,
  offset: number = 0
): Promise<{ data: RawListFigureDTO[], count: number | null }> => {
  const supabase = createPublicClient();
  let query = supabase
    .from('minifigures').select('id, created_at, series_id, name, brand, category, series_name, series_no, figure_no, role, type, code, piece_count, body_material, rarity, value_usd, release_year, images, total_views, daily_views, custom_attributes, description, release_month, slug, affiliate_link, name_en, series_name_en, role_en, description_en, min_price, max_price, avg_price, rarity_score, series_score, view_count_30d, collection_count_30d, favorite_count_30d, rating_count, value_score, demand_score, figure_name, slug_tr, slug_en, figure_number, figure_code, character_name, short_description_tr, short_description_en, figure_role, figure_type, price_updated_at, rarity_level, accessory_count, main_color, thumbnail_url, is_featured, is_active, is_published, series(id, slug_tr, slug_en, title, title_en)', { count: "exact" });

  const safeSeries = sanitizeFilter(filters.series);
  if (safeSeries) {
    const isId = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(safeSeries);
    const filterCol = isId ? 'series_id' : 'series_name';
    query = query.eq(filterCol, safeSeries);
  }
  const safeRole = sanitizeFilter(filters.role);
  if (safeRole) query = query.eq('role', safeRole);
  
  const safeType = sanitizeFilter(filters.type);
  if (safeType) query = query.eq('type', safeType);
  
  const safeRarity = sanitizeFilter(filters.rarity);
  if (safeRarity) query = query.eq('rarity', safeRarity);

  query = query.eq('is_published', true).order('created_at', { ascending: false }).range(offset, offset + limit - 1);

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
        .from('series').select('id, title, slug_tr, slug_en, description, description_blocks_en, is_active, release_year, category, category_main, cover_image_url, hero_image_url, content_blocks, series_no, rarity, figure_count, is_published, total_views, title_en');

    query = query.eq('is_published', true);
    
    const safeCategory = sanitizeFilter(filters.category);
    if (safeCategory) query = query.eq('category', safeCategory);
    
    const safeSeries = sanitizeFilter(filters.series);
    if (safeSeries) query = query.eq('slug_tr', safeSeries);
    
    // Sort logic would typically be here, but we pass sortParam and it looks like UI handles it, or we can handle it if needed.
    // For now we just return standard sorting and UI does the rest.
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      captureDalError('getSeriesListItems', error, { filters, sortParam });
      throw error;
    }
    
    return data as any;
});

