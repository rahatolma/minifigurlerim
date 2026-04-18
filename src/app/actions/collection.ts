'use server';

import { revalidatePath } from 'next/cache';
import { getAuthUserProfile, toggleUserCollectionDal, saveUserRatingDal } from '@/services/action_dal';
import { actionLog } from '@/utils/logger';

// In-memory rate limiter cache to guard against UI-level rapid clicking (Spam guard)
const softRateLimitCache = new Map<string, number>();

export async function toggleCollectionStatus(minifigureId: string, currentStatus: 'have' | 'want' | null, newStatus: 'have' | 'want') {
  const { user, profile } = await getAuthUserProfile();

  if (!user) {
    return { error: 'Giriş yapmanız gerekiyor.' };
  }

  if (profile?.role === 'banned') return { error: 'Hesabınız yasaklanmıştır.' };
  if (!profile?.is_approved && profile?.role !== 'admin') {
    return { error: 'Koleksiyon işlemleri için hesabınızın yönetici tarafından onaylanması bekleniyor.' };
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
    revalidatePath('/figurler/[slug]', 'page');
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
    revalidatePath('/figurler/[slug]', 'page');
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
