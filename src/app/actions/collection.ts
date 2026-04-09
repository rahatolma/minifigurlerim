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
    await toggleUserCollectionDal(user.id, minifigureId, currentStatus, newStatus);
    revalidatePath('/figurler/[slug]', 'page');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
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
    await saveUserRatingDal(user.id, minifigureId, rating, comment);
    revalidatePath('/figurler/[slug]', 'page');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
