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

  const { data: profile } = await supabase.from('profiles').select('is_approved, role, status, avatar_url, full_name, username, age').eq('id', user.id).single();
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

export const toggleUserCollectionDal = async (userId: string, minifigureId: string, currentStatus: 'have' | 'want' | null, newStatus: 'have' | 'want') => {
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

  // --- MİMARİ KOPUKLUK DÜZELTMESİ (Real-Time Metrics Sync) ---
  try {
      const { data: figStats } = await supabaseAdmin
          .from('minifigures')
          .select('collection_count_30d, favorite_count_30d')
          .eq('id', minifigureId)
          .single();

      if (figStats) {
          let colCount = figStats.collection_count_30d || 0;
          let favCount = figStats.favorite_count_30d || 0;

          if (currentStatus === newStatus) {
              // SİLME (DELETE) İŞLEMİ
              if (currentStatus === 'have') colCount = Math.max(0, colCount - 1);
              if (currentStatus === 'want') favCount = Math.max(0, favCount - 1);
          } else {
              // GÜNCELLEME VEYA YENİ EKLEME (UPSERT)
              if (currentStatus === 'have') colCount = Math.max(0, colCount - 1);
              if (currentStatus === 'want') favCount = Math.max(0, favCount - 1);

              if (newStatus === 'have') colCount += 1;
              if (newStatus === 'want') favCount += 1;
          }

          await supabaseAdmin.from('minifigures').update({
              collection_count_30d: colCount,
              favorite_count_30d: favCount
          }).eq('id', minifigureId);
      }
  } catch (metricsErr) {
      console.error('[METRICS SYNC ERROR]', metricsErr);
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
                     .select(String('id'), { count: 'exact', head: true })
                     .eq('user_id', userId)
                     .eq('status', 'have')
                     .in('minifigure_id', figIds);
                 ownedCount = count || 0;
             }
             
             const percent = parseFloat(((ownedCount / finalTotal) * 100).toFixed(2));
             
             if (ownedCount === 0) {
                 // Temizlik: Sıfıra düşen serinin çöp kalıntısını kasada (user_series_stats) bırakma.
                 await supabaseAdmin.from('user_series_stats').delete()
                 .eq('user_id', userId)
                 .eq('series_id', figData.series_id);
             } else {
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

export const saveUserRatingDal = async (userId: string, minifigureId: string, rating: number) => {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin
    .from('user_ratings')
    .upsert({
      user_id: userId,
      minifigure_id: minifigureId,
      rating: rating
    }, { onConflict: 'user_id, minifigure_id' });
    
  if (error) throw new Error(error.message);
  return { success: true };
};

// Yorumları (ve ekleyen profilleri) listeleme (Read Only - Component'ten taşındı)
export const getFigureRatings = async (minifigureId: string) => {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from('user_ratings')
    .select('id, rating, created_at, profiles(username, avatar_url, role)')
    .eq('minifigure_id', minifigureId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
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
  return data || [];
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

export const getAdminUsersDal = async (page: number = 1, limit: number = 25, search?: string, statusFilter?: string) => {
  const supabaseAdmin = getAdminClient();
  const safeLimit = Math.min(limit, 100);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabaseAdmin
    .from('profiles')
    .select('id, username, avatar_url, created_at, is_approved, role, status, email', { count: 'exact' });

  if (search) {
    query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
  }
  
  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: profiles, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { profiles: profiles || [], count: count || 0 };
};

export const getAdminAuditLogsDal = async (page: number = 1, limit: number = 25, targetUserId?: string, actionFilter?: string) => {
  const supabaseAdmin = getAdminClient();
  const safeLimit = Math.min(limit, 100);
  const from = (page - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let query = supabaseAdmin
    .from('admin_audit_logs')
    .select(`
      id, 
      action, 
      reason, 
      created_at, 
      previous_state,
      new_state,
      actor_admin_id,
      target_user_id,
      actor:profiles!admin_audit_logs_actor_admin_id_fkey(username, email, role),
      target:profiles!admin_audit_logs_target_user_id_fkey(username, email, role)
    `, { count: 'exact' });

  if (actionFilter && actionFilter !== 'all') {
    query = query.eq('action', actionFilter);
  }
  
  if (targetUserId) {
    query = query.eq('target_user_id', targetUserId);
  }

  const { data: logs, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { logs: logs || [], count: count || 0 };
};

export const getAdminBorsaFiguresDal = async () => {
  const supabaseAdmin = getAdminClient();
  let figures = [];
  let errorMsg = null;
  let fallbackErrorMsg = null;

  const { data, error } = await supabaseAdmin
    .from('minifigures')
    .select('id, name, figure_number, series_name, images, value_usd, affiliate_link')
    .order('series_name', { ascending: true })
    .order('figure_number', { ascending: true });

  if (error) {
     errorMsg = error.message;
     const fallback = await supabaseAdmin
        .from('minifigures')
        .select('id, name, figure_number, series_name, images, value_usd')
        .order('series_name', { ascending: true })
        .order('figure_number', { ascending: true });
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
    .from('faqs').select(String('id, question, answer, sort_order, is_active, created_at, question_en, answer_en, order_num'))
    .eq('id', id)
    .single();
  return data || null;
};

export const getAdminDashboardMetricsDal = async () => {
  const supabaseAdmin = getAdminClient();

  const [
    { count: totalSeries },
    { count: totalFigures },
    { count: totalCollections }
  ] = await Promise.all([
    supabaseAdmin.from('series').select(String('id'), { count: 'exact', head: true }),
    supabaseAdmin.from('minifigures').select(String('id'), { count: 'exact', head: true }),
    supabaseAdmin.from('user_collections').select(String('id'), { count: 'exact', head: true })
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

export const logAdminActionDal = async (actorId: string, targetId: string, action: string, prevState: any, newState: any, reason?: string) => {
  const supabaseAdmin = getAdminClient();
  const { error } = await supabaseAdmin.from('admin_audit_logs').insert({
    actor_admin_id: actorId,
    target_user_id: targetId,
    action: action,
    previous_state: prevState,
    new_state: newState,
    reason: reason || null
  });
  if (error) console.error('[AUDIT LOG ERROR]', error.message);
};

export const toggleUserApprovalAdminDal = async (adminId: string, userId: string, currentStatus: boolean, currentStatusText?: string) => {
  if (!userId) throw new Error("Kullanıcı ID'si geçersiz.");
  if (adminId === userId) throw new Error("Kendi hesabınız üzerinde onay işlemi yapamazsınız.");
  
  // Backward compatibility check
  const actualCurrentStatus = currentStatusText || (currentStatus ? 'active' : 'pending');
  const newStatus = actualCurrentStatus === 'active' ? 'pending' : 'active';
  const actionName = actualCurrentStatus === 'active' ? 'revoke_approval' : 'approve_user';

  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ status: newStatus, is_approved: newStatus === 'active' }) // is_approved is kept synced
    .eq('id', userId)
    .select();
    
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Belirtilen kullanıcı bulunamadı veya güncellenemedi.");
  
  await logAdminActionDal(adminId, userId, actionName, { status: actualCurrentStatus, is_approved: currentStatus }, { status: newStatus, is_approved: newStatus === 'active' });
  return { success: true };
};

export const banUserAdminDal = async (adminId: string, userId: string, reason: string) => {
  if (!userId) throw new Error("Kullanıcı ID'si geçersiz.");
  if (adminId === userId) throw new Error("Kendi hesabınızı yasaklayamazsınız.");
  
  const supabaseAdmin = getAdminClient();
  const { data: currentUser } = await supabaseAdmin.from('profiles').select('status, role').eq('id', userId).single();

  const { error } = await supabaseAdmin.from('profiles').update({
    status: 'banned',
    banned_at: new Date().toISOString(),
    banned_by: adminId,
    banned_reason: reason || 'Kural ihlali'
  }).eq('id', userId);

  if (error) throw new Error(error.message);

  await logAdminActionDal(adminId, userId, 'ban_user', currentUser, { status: 'banned' }, reason);
  return { success: true };
};

export const unbanUserAdminDal = async (adminId: string, userId: string, reason: string) => {
  if (!userId) throw new Error("Kullanıcı ID'si geçersiz.");
  if (adminId === userId) throw new Error("Kendi hesabınız üzerinde işlem yapamazsınız.");
  
  const supabaseAdmin = getAdminClient();
  const { data: currentUser } = await supabaseAdmin.from('profiles').select('status, role').eq('id', userId).single();

  const { error } = await supabaseAdmin.from('profiles').update({
    status: 'pending', // Revert to pending
    banned_at: null,
    banned_by: null,
    banned_reason: null
  }).eq('id', userId);

  if (error) throw new Error(error.message);

  await logAdminActionDal(adminId, userId, 'unban_user', currentUser, { status: 'pending' }, reason);
  return { success: true };
};

export const getUserDetailedInfoAdminDal = async (userId: string) => {
  const supabaseAdmin = getAdminClient();
  const { data: profile, error: profileErr } = await supabaseAdmin.from('profiles').select(String('id, username, avatar_url, created_at, is_approved, role, full_name, age, email, is_admin')).eq('id', userId).single();
  if (profileErr) throw new Error(profileErr.message);

  const { data: collections } = await supabaseAdmin.from('user_collections')
    .select('minifigure_id, status, created_at, minifigures(name, figure_number, series_name)')
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

export const getSimilarFiguresDal = async (seriesId: string, currentFigureId: string, limit: number = 4) => {
  const supabaseAdmin = getAdminClient();
  
  // 1. Same series figures (excluding current)
  const { data: seriesData, error: seriesError } = await supabaseAdmin
    .from('minifigures')
    .select('id, name, slug_tr, slug_en, series_name, rarity_level, thumbnail_url, images, series(id, title, title_en, slug_tr, slug_en)')
    .eq('series_id', seriesId)
    .not('id', 'eq', currentFigureId)
    .limit(limit);
    
  if (seriesError) throw new Error(seriesError.message);
  
  let result = seriesData || [];
  
  // 2. Popular figures fallback (if not enough in series)
  if (result.length < limit) {
     const remaining = limit - result.length;
     const excludeIds = [currentFigureId, ...result.map(f => f.id)];
     
     const { data: popularData, error: popularError } = await supabaseAdmin
        .from('minifigures')
        .select('id, name, slug_tr, slug_en, series_name, rarity_level, thumbnail_url, images, series(id, title, title_en, slug_tr, slug_en)')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .order('total_views', { ascending: false, nullsFirst: false })
        .limit(remaining);
        
     if (!popularError && popularData) {
        result = [...result, ...popularData];
     }
  }
  
  return result;
};
