import { createClient } from '@/utils/supabase/server';
import { cache } from 'react';

// ==========================================
// KULLANICI / AUTHENTICATED BÖLGESİ (PRIVATE)
// Bu dosyadaki tüm fonksiyonlar cookies() okur.
// SEO/Public sayfalara import edilmemelidir!
// ==========================================

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
        rarity_level,
        min_price,
        max_price,
        avg_price,
        value_score,
        demand_score,
        series (
          id,
          title,
          title_en,
          slug_tr,
          slug_en
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as any;
});

export const getUserSeriesStats = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('user_series_stats').select('id, user_id, series_id, completion_percent, owned_count, total_count').eq('user_id', userId);
  if (error) return [];
  return data as any;
});
