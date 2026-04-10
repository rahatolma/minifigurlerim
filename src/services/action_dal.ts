import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

/**
 * Data Access Layer - Actions & Mutations
 * Page, Component, API ve Server Action katmanlarındaki tüm yazma (insert/update/delete) 
 * ve yetkili (admin) okuma işlemlerini tek bir merkezde toplar.
 */

// Helper: Get Admin Client
const getAdminClient = () => {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// ==========================================
// 1. KULLANICI (AUTH) İŞLEMLERİ
// ==========================================

export const getAuthUser = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
};

export const getAuthUserProfile = async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, profile: null };

  const { data: profile } = await supabase.from('profiles').select('is_approved, role').eq('id', user.id).single();
  return { user, profile };
};

export const signInWithPasswordDal = async (email: string, password: string) => {
  const supabase = await createClient();
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUpDal = async (email: string, password: string, termsAccepted: boolean) => {
  const supabase = await createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        terms_accepted: termsAccepted,
        terms_accepted_at: termsAccepted ? new Date().toISOString() : null,
      }
    }
  });
};

export const signOutDal = async () => {
  const supabase = await createClient();
  return supabase.auth.signOut();
};

export const signInWithOAuthDal = async (provider: any, redirectTo: string) => {
  const supabase = await createClient();
  return supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
};

export const exchangeCodeForSessionDal = async (code: string) => {
  const supabase = await createClient();
  return supabase.auth.exchangeCodeForSession(code);
};
export const updateUserProfileDal = async (userId: string, updates: any) => {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', userId);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const updateUserAuthEmailDal = async (email: string) => {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw new Error(error.message);
  return { success: true };
};

export const updateUserPasswordDal = async (password: string) => {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  return { success: true };
};

export const uploadAvatarAdminDal = async (userId: string, file: File, fileName: string) => {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin.storage.from('avatars').upload(fileName, file, {
    upsert: true,
  });
  if (error) throw new Error(error.message);
  
  const { data: publicData } = supabaseAdmin.storage.from('avatars').getPublicUrl(fileName);
  await supabaseAdmin.from('profiles').update({ avatar_url: publicData.publicUrl }).eq('id', userId);

  return { success: true, url: publicData.publicUrl };
};


// ==========================================
// 2. KOLEKSİYON (CÜZDAN) YÖNETİMİ
// ==========================================

export const toggleUserCollectionDal = async (userId: string, minifigureId: string, currentStatus: string | null, newStatus: string) => {
  const supabaseAdmin = getAdminClient();

  if (currentStatus === newStatus) {
    const { error } = await supabaseAdmin
      .from('user_collections')
      .delete()
      .eq('user_id', userId)
      .eq('minifigure_id', minifigureId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin
      .from('user_collections')
      .upsert({
        user_id: userId,
        minifigure_id: minifigureId,
        status: newStatus
      }, { onConflict: 'user_id, minifigure_id' });
    if (error) throw new Error(error.message);
  }

  // Pre-Compute Series Progress Cache Mechanism
  if (currentStatus === 'have' || newStatus === 'have') {
     try {
         const { data: figData } = await supabaseAdmin.from('minifigures').select('series_id, series_name').eq('id', minifigureId).single();
         if (figData?.series_id) {
             const { data: seriesFigs } = await supabaseAdmin.from('minifigures').select('id').eq('series_id', figData.series_id);
             const figIds = seriesFigs?.map((f: any) => f.id) || [];
             const finalTotal = figIds.length || 1; 
             
             let ownedCount = 0;
             if (figIds.length > 0) {
                 const { count } = await supabaseAdmin.from('user_collections')
                     .select('*', { count: 'exact', head: true })
                     .eq('user_id', userId)
                     .eq('status', 'have')
                     .in('minifigure_id', figIds);
                 ownedCount = count || 0;
             }
             
             const percent = parseFloat(((ownedCount / finalTotal) * 100).toFixed(2));
             await supabaseAdmin.from('user_series_stats').upsert({
                user_id: userId,
                series_id: figData.series_id,
                series_name: figData.series_name || 'Bilinmeyen Seri',
                owned_count: ownedCount,
                total_count: finalTotal,
                completion_percent: percent,
                updated_at: new Date().toISOString()
             }, { onConflict: 'user_id, series_id' });
         }
     } catch (err) {
         console.error('[GAMIFICATION CACHE ERROR]', err);
     }
  }
  return { success: true };
};

// ==========================================
// 3. PUANLAMA & YORUM (RATINGS) YÖNETİMİ
// ==========================================

export const saveUserRatingDal = async (userId: string, minifigureId: string, rating: number, comment?: string) => {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin
    .from('user_ratings')
    .upsert({
      user_id: userId,
      minifigure_id: minifigureId,
      rating: rating,
      comment: comment || null
    }, { onConflict: 'user_id, minifigure_id' });
    
  if (error) throw new Error(error.message);
  return { success: true };
};

// Yorumları (ve ekleyen profilleri) listeleme (Read Only - Component'ten taşındı)
export const getFigureRatings = async (minifigureId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_ratings')
    .select('id, rating, comment, created_at, profiles(username, avatar_url, role)')
    .eq('minifigure_id', minifigureId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// ==========================================
// 4. API & CRON TRACKING (MİMARİ) YÖNETİMİ
// ==========================================

export const trackUserViewDal = async (table: string, id: string) => {
  const supabase = await createClient();
  const { error } = await supabase.rpc('increment_page_view', {
    target_table: table,
    target_id: id
  });
  if (error) throw new Error(error.message);
  return { success: true };
};

export const syncMinifigurePriceAdminDal = async (minifigureId: string, newValue: number) => {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin
    .from('minifigures')
    .update({ value_usd: newValue })
    .eq('id', minifigureId);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const getMinifiguresForCronDal = async (limit: number = 50) => {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from('minifigures')
    .select('id, code, name')
    .not('code', 'is', null) // Kodu (örn: col123) olmayanları aratamayız
    .order('updated_at', { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
};

export const updateTranslationAdminDal = async (table: string, id: string, updates: any) => {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin
    .from(table)
    .update(updates)
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const getAdminUsersDal = async () => {
  const supabaseAdmin = getAdminClient();
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, username, avatar_url, created_at, is_approved, role')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return profiles;
};

export const getAdminBorsaFiguresDal = async () => {
  const supabaseAdmin = getAdminClient();
  let figures = [];
  let errorMsg = null;
  let fallbackErrorMsg = null;

  const { data, error } = await supabaseAdmin
    .from('minifigures')
    .select('id, name, figure_no, series_name, images, value_usd, affiliate_link')
    .order('series_name', { ascending: true })
    .order('figure_no', { ascending: true });

  if (error) {
     errorMsg = error.message;
     const fallback = await supabaseAdmin
        .from('minifigures')
        .select('id, name, figure_no, series_name, images, value_usd')
        .order('series_name', { ascending: true })
        .order('figure_no', { ascending: true });
     figures = fallback.data as any[] || [];
     fallbackErrorMsg = fallback.error?.message || null;
  } else {
     figures = data || [];
  }
  return { figures, error: errorMsg, fallbackError: fallbackErrorMsg };
};

export const getAdminFaqDal = async (id: string) => {
  const supabaseAdmin = getAdminClient();
  const { data } = await supabaseAdmin
    .from('faqs')
    .select('*')
    .eq('id', id)
    .single();
  return data;
};

export const getAdminDashboardMetricsDal = async () => {
  const supabaseAdmin = getAdminClient();

  const [
    { count: totalSeries },
    { count: totalFigures },
    { count: totalCollections }
  ] = await Promise.all([
    supabaseAdmin.from('series').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('minifigures').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('user_collections').select('*', { count: 'exact', head: true })
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: rawCollections } = await supabaseAdmin
    .from('user_collections')
    .select('created_at, status, minifigure_id')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .limit(5000);

  const [ { data: allFigures }, { data: allSeries } ] = await Promise.all([
    supabaseAdmin.from('minifigures').select('id, series_id'),
    supabaseAdmin.from('series').select('id, name, image_url')
  ]);

  return { totalSeries, totalFigures, totalCollections, rawCollections, allFigures, allSeries };
};

export const toggleUserApprovalAdminDal = async (userId: string, currentStatus: boolean) => {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin.from('profiles').update({ is_approved: !currentStatus }).eq('id', userId);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const deleteUserFromDBAdminDal = async (userId: string) => {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  return { success: true };
};

export const getUserDetailedInfoAdminDal = async (userId: string) => {
  const supabaseAdmin = getAdminClient();
  const { data: profile, error: profileErr } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
  if (profileErr) throw new Error(profileErr.message);

  const { data: collections } = await supabaseAdmin.from('user_collections')
    .select('minifigure_id, status, created_at, minifigures(name, figure_no, series_name)')
    .eq('user_id', userId);
  
  return { profile, collections: collections || [] };
};

export const updateBorsaDataAdminDal = async (minifigureId: string, valueUsd: number, affiliateLink: string | null) => {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin.from('minifigures').update({
    value_usd: valueUsd,
    affiliate_link: affiliateLink
  }).eq('id', minifigureId);
  if (error) throw new Error(error.message);
  return { success: true };
};
