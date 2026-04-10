'use server';

import { revalidatePath } from 'next/cache';
import { getAuthUserProfile, toggleUserCollectionDal, saveUserRatingDal } from '@/services/action_dal';

export async function toggleCollectionStatus(minifigureId: string, currentStatus: string | null, newStatus: string) {
  const { user, profile } = await getAuthUserProfile();

  if (!user) {
    return { error: 'Giriş yapmanız gerekiyor.' };
  }

  if (profile?.role === 'banned') return { error: 'Hesabınız yasaklanmıştır.' };
  if (!profile?.is_approved && profile?.role !== 'admin') {
    return { error: 'Koleksiyon işlemleri için hesabınızın yönetici tarafından onaylanması bekleniyor.' };
  }

  try {
    const operation = toggleUserCollectionDal(user.id, minifigureId, currentStatus, newStatus);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));
    await Promise.race([operation, timeout]);
    
    revalidatePath('/figurler/[slug]', 'page');
    return { success: true };
  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
       console.error(JSON.stringify({ code: 'COLLECTION_TOGGLE_TIMEOUT', message: 'Action timed out after 8s', userId: user.id, minifigureId }));
       return { error: 'İşlem zaman aşımına uğradı, lütfen tekrar deneyiniz.' };
    }
    console.error(JSON.stringify({ code: 'COLLECTION_TOGGLE_FAILED', error: err.message, userId: user.id, minifigureId }));
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
    
    revalidatePath('/figurler/[slug]', 'page');
    return { success: true };
  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
       console.error(JSON.stringify({ code: 'COMMENT_SUBMIT_TIMEOUT', message: 'Action timed out after 8s', userId: user.id, minifigureId }));
       return { error: 'Yorum kaydedilirken zaman aşımı yaşandı.' };
    }
    console.error(JSON.stringify({ code: 'COMMENT_SUBMIT_FAILED', error: err.message, userId: user.id, minifigureId }));
    return { error: 'Puanlama yapılamadı, sistem yöneticilerine bildirilmiştir.' };
  }
}
