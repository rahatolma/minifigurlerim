'use server';

import { revalidatePath } from 'next/cache';
import { getAuthUserProfile, toggleUserCollectionDal, saveUserRatingDal } from '@/services/action_dal';
import { actionLog } from '@/utils/logger';
import { createClient } from '@/utils/supabase/server';

// In-memory rate limiter cache to guard against UI-level rapid clicking (Spam guard)
const softRateLimitCache = new Map<string, number>();

interface SeriesRelation {
  slug_tr: string | null;
  slug_en: string | null;
}

interface MinifigureQueryResult {
  slug_tr: string | null;
  slug_en: string | null;
  series: SeriesRelation | SeriesRelation[] | null;
}

async function targetedRevalidate(minifigureId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('minifigures').select('slug_tr, slug_en, series(slug_tr, slug_en)').eq('id', minifigureId).single();
    
    if (data) {
        const fig = data as unknown as MinifigureQueryResult;
        const seriesData = Array.isArray(fig.series) ? fig.series[0] : fig.series;
        if (seriesData?.slug_tr && fig.slug_tr) {
            revalidatePath(`/tr/figurler/${seriesData.slug_tr}/${fig.slug_tr}`);
            revalidatePath(`/tr/figurler/${seriesData.slug_tr}`);
        }
        if (seriesData?.slug_en && fig.slug_en) {
            revalidatePath(`/en/figures/${seriesData.slug_en}/${fig.slug_en}`);
            revalidatePath(`/en/figures/${seriesData.slug_en}`);
        }
    }
  } catch (err) {
      console.error('[Targeted Revalidate Error]', err);
  }
  
  // Koleksiyon sayfalarını revalidate et
  revalidatePath('/tr/koleksiyonum');
  revalidatePath('/en/collection');
}

export async function toggleCollectionStatus(minifigureId: string, currentStatus: 'have' | 'want' | null, newStatus: 'have' | 'want') {
  const { user, profile } = await getAuthUserProfile();

  if (!user) {
    return { error: 'Giriş yapmanız gerekiyor.' };
  }

  if (profile?.role === 'banned') return { error: 'Hesabınız yasaklanmıştır.' };
  if (!profile?.is_approved && profile?.role !== 'admin') {
    return { error: 'Koleksiyon işlemleri için hesabınızın yönetici tarafından onaylanması bekleniyor.', code: 'UNAPPROVED_USER' };
  }

  // Rate Limiting (1.5 seconds)
  const rlKey = `toggle-${user.id}-${minifigureId}`;
  const now = Date.now();
  const lastAction = softRateLimitCache.get(rlKey) || 0;
  if (now - lastAction < 1500) {
    actionLog('warn', { action: 'toggleCollection_Spam', user_id: user.id, entity_id: minifigureId, success: false, message: 'Rate limit tripped' });
    return { error: 'Çok hızlı işlem yapıyorsunuz. Lütfen biraz bekleyin.' };
  }
  softRateLimitCache.set(rlKey, now);

  try {
    const operation = toggleUserCollectionDal(user.id, minifigureId, currentStatus, newStatus);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));
    await Promise.race([operation, timeout]);
    
    actionLog('info', { action: 'toggleCollection', user_id: user.id, entity_id: minifigureId, success: true, message: `Changed from ${currentStatus} to ${newStatus}` });
    await targetedRevalidate(minifigureId);
    return { success: true };
  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
       actionLog('warn', { action: 'toggleCollection', user_id: user.id, entity_id: minifigureId, success: false, message: 'Action timed out after 8s' });
       return { error: 'İşlem zaman aşımına uğradı, lütfen tekrar deneyiniz.' };
    }
    actionLog('error', { action: 'toggleCollection', user_id: user.id, entity_id: minifigureId, success: false, message: err.message });
    return { error: 'Koleksiyon güncellenemedi, sistem yöneticisine bildirilmiştir.' };
  }
}

export async function saveRating(minifigureId: string, rating: number, comment?: string) {
  const { user, profile } = await getAuthUserProfile();

  if (!user) {
    return { error: 'Giriş yapmanız gerekiyor.' };
  }

  if (profile?.role === 'banned') return { error: 'Hesabınız yasaklanmıştır.' };
  if (!profile?.is_approved && profile?.role !== 'admin') {
    return { error: 'Puan verebilmek için hesabınızın yönetici tarafından onaylanması bekleniyor.' };
  }

  try {
    const operation = saveUserRatingDal(user.id, minifigureId, rating, comment);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));
    await Promise.race([operation, timeout]);
    
    actionLog('info', { action: 'saveRating', user_id: user.id, entity_id: minifigureId, success: true, metadata: { rating }});
    await targetedRevalidate(minifigureId);
    return { success: true };
  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
       actionLog('warn', { action: 'saveRating', user_id: user.id, entity_id: minifigureId, success: false, message: 'Action timed out after 8s' });
       return { error: 'Yorum kaydedilirken zaman aşımı yaşandı.' };
    }
    actionLog('error', { action: 'saveRating', user_id: user.id, entity_id: minifigureId, success: false, message: err.message });
    return { error: 'Puanlama yapılamadı, sistem yöneticilerine bildirilmiştir.' };
  }
}
