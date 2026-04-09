import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

/**
 * Data Access Layer (DAL)
 * Bileşen içlerinden doğrudan Supabase çağrısını önler, Next.js cache() ile tekrar eden SQL sorgularını birleştirir.
 */

// Tüm Serileri Getir
export const getSeriesList = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
});

// Seriye Ait Tüm Figürlerin Temel Bilgisini Getir (Önizleme İçin)
export const getPreviewFiguresForSeries = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('minifigures')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
});

// Önizleme veya son eklenen Figürler
export const getFeaturedMinifigures = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('minifigures')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) throw error;
  return data;
});

// Tüm Figürleri Getir (Katalog İçin)
export const getAllMinifigures = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('minifigures')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
});

// Tüm serileri dropdown vs için getir
export const getAllSeries = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
});

// Popüler Haberleri / Blogları Getir
export const getLatestNews = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) throw error;
  return data;
});

// Anasayfa Slaytlarını Getir
export const getHomeSliders = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('home_sliders')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
});

// Sadece en son 12 Seri Getir (Anasayfa)
export const getLatestSeries = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) throw error;
  return data;
});

// Sadece en son 12 Figür Getir (Anasayfa)
export const getLatestFigures = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('minifigures')
    .select('*, series(title)')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) throw error;
  return data;
});

// Single Seriyi Getir (Slug veya UUID bazlı detay)
export const getSeriesBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  let query = supabase.from('series').select('*');
  if (isUUID) {
    query = query.eq('id', slug);
  } else {
    query = query.or(`slug.eq.${slug},slug_en.eq.${slug}`);
  }
  
  const { data, error } = await query.single();
  
  // Return null if not found instead of throwing, so the page can handle notFound()
  if (error || !data) return null;
  return data;
});

// Serinin İçindeki Figürleri Getir (Katalog)
export const getFiguresBySeries = cache(async (seriesIdOrName: string, isId: boolean = false) => {
  const supabase = await createClient();
  const filterCol = isId ? 'series_id' : 'series_name';
  
  const { data, error } = await supabase
    .from('minifigures')
    .select('*')
    .eq(filterCol, seriesIdOrName)
    .order('figure_no', { ascending: true })
    .order('created_at', { ascending: true });
    
  if (error) return [];
  return data;
});

// Single Figürü Getir (Slug veya UUID)
export const getMinifigureBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const queryCol = isUUID ? 'id' : 'slug';

  const { data, error } = await supabase
    .from('minifigures')
    .select('*, series(slug)')
    .eq(queryCol, slug)
    .single();

  if (error || !data) return null;
  return data;
});

// Definitions Çekimi
export const getDefinitions = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('definition_groups').select('*');
  if (error) return [];
  return data;
});

// Figür İçin Finans/Fiyat Geçmişini Getir
export const getFigurePriceHistory = cache(async (figureId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('minifigure_price_history')
    .select('*')
    .eq('minifigure_id', figureId)
    .order('recorded_at', { ascending: true });
    
  if (error) return [];
  return data;
});

// Single Haber Getir (Slug)
export const getNewsBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
});

// Tüm Haberleri Getir
export const getAllNews = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Supabase Kolon Hatası: ${error.message} - Lütfen bu hatanın ekran görüntüsünü atın.`);
  return data;
});

// Kategorileri Getir
export const getCategoriesByType = cache(async (type: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data;
});

// Hakkımızda (About) Settings Getir
export const getAboutSettings = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('about_settings').select('*').eq('id', 1).single();
  if (error) return null;
  return data;
});

// İletişim (Contact) Settings Getir
export const getContactSettings = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('contact_settings').select('*').eq('id', 1).single();
  if (error) return null;
  return data;
});

// Aktif FAQ Listesini Getir
export const getActiveFaqs = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
    
  if (error) return [];
  return data;
});

// Dynamic CMS Sayfasını Getir
export const getPageBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data;
});

// Koleksiyonum ve Kullanıcı Metodları (Server Actions/Dynamic Routes için)
export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('username').eq('id', userId).single();
  if (error) return null;
  return data;
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
        rarity
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) return [];
  return data;
});

export const getTotalMinifiguresCount = cache(async () => {
  const supabase = await createClient();
  const { count, error } = await supabase.from('minifigures').select('*', { count: 'exact', head: true });
  if (error) return 0;
  return count || 0;
});

export const getUserSeriesStats = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('user_series_stats').select('*').eq('user_id', userId);
  if (error) return [];
  return data;
});

export const getMinifigurePriceHistoryBatch = cache(async (figureIds: string[]) => {
  if (!figureIds || figureIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('minifigure_price_history')
    .select('minifigure_id, value_usd')
    .in('minifigure_id', figureIds)
    .order('recorded_at', { ascending: true });
    
  if (error) return [];
  return data;
});
