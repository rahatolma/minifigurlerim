'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function toggleCollectionStatus(minifigureId: string, currentStatus: string | null, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Giriş yapmanız gerekiyor.' };
  }

  // Admin / Sistem onayı kontrolü (Faz 3 Borsa Kuralı)
  const { data: profile } = await supabase.from('profiles').select('is_approved, role').eq('id', user.id).single();
  
  if (profile?.role === 'banned') return { error: 'Hesabınız yasaklanmıştır.' };
  if (!profile?.is_approved && profile?.role !== 'admin') {
    return { error: 'Koleksiyon işlemleri için hesabınızın yönetici tarafından onaylanması bekleniyor.' };
  }

  // RLS bypass için yetkili client
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Eğer mevcut durumla yenisi aynıysa => Kaldır (Sil)
  if (currentStatus === newStatus) {
    const { error } = await supabaseAdmin
      .from('user_collections')
      .delete()
      .eq('user_id', user.id)
      .eq('minifigure_id', minifigureId);
      
    if (error) return { error: error.message };
  } else {
    // Farklıysa (Veya Yoksa) => Ekle / Güncelle (Upsert)
    const { error } = await supabaseAdmin
      .from('user_collections')
      .upsert({
        user_id: user.id,
        minifigure_id: minifigureId,
        status: newStatus
      }, { onConflict: 'user_id, minifigure_id' }); // Veritabanı unique constraint üzerinden günceller
      
    if (error) return { error: error.message };
  }

  // ===============================================
  // YENİ MİMARİ: PRE-COMPUTE SERİ İLERLEMESİ CACHE
  // ===============================================
  // Sadece "have" durumu eklendiyse veya silindiyse hesap yapılır
  if (currentStatus === 'have' || newStatus === 'have') {
     try {
         // 1. İlgili figürün ait olduğu seriyi bul
         const { data: figData } = await supabaseAdmin.from('minifigures').select('series_id, series_name').eq('id', minifigureId).single();
         
         if (figData?.series_id) {
             // 2. O serideki toplam figürleri bul
             const { data: seriesFigs } = await supabaseAdmin.from('minifigures').select('id').eq('series_id', figData.series_id);
             const figIds = seriesFigs?.map(f => f.id) || [];
             const finalTotal = figIds.length || 1; 
             
             // 3. Kullanıcının bu serideki "sahip olduğu (have)" figür sayısını bul
             let ownedCount = 0;
             if (figIds.length > 0) {
                 const { count } = await supabaseAdmin.from('user_collections')
                     .select('*', { count: 'exact', head: true })
                     .eq('user_id', user.id)
                     .eq('status', 'have')
                     .in('minifigure_id', figIds);
                 ownedCount = count || 0;
             }
             
             const percent = parseFloat(((ownedCount / finalTotal) * 100).toFixed(2));
             
             // 4. Tabloya Cache Olarak Yaz (Upsert constraint üzerinden çalışır)
             await supabaseAdmin.from('user_series_stats').upsert({
                user_id: user.id,
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

  revalidatePath('/figurler/[slug]', 'page');
  return { success: true };
}

export async function saveRating(minifigureId: string, rating: number, comment?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Giriş yapmanız gerekiyor.' };
  }

  // Admin / Sistem onayı kontrolü
  const { data: profile } = await supabase.from('profiles').select('is_approved, role').eq('id', user.id).single();
  
  if (profile?.role === 'banned') return { error: 'Hesabınız yasaklanmıştır.' };
  if (!profile?.is_approved && profile?.role !== 'admin') {
    return { error: 'Puan verebilmek için hesabınızın yönetici tarafından onaylanması bekleniyor.' };
  }

  // RLS bypass için yetkili client
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('user_ratings')
    .upsert({
      user_id: user.id,
      minifigure_id: minifigureId,
      rating: rating,
      comment: comment || null
    }, { onConflict: 'user_id, minifigure_id' });
    
  if (error) return { error: error.message };

  revalidatePath('/figurler/[slug]', 'page');
  return { success: true };
}
