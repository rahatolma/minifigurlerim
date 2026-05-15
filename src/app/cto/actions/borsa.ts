'use server';

import { revalidatePath } from 'next/cache';
import { getAuthUserProfile, updateBorsaDataAdminDal } from '@/services/action_dal';

export async function updateBorsaData(minifigureId: string, valueUsd: number, affiliateLink: string | null) {
  const { user, profile } = await getAuthUserProfile();

  if (!user || profile?.role !== 'admin') {
    return { error: 'Sadece Yöneticiler piyasa işlemi yapabilir.' };
  }

  try {
    await updateBorsaDataAdminDal(minifigureId, valueUsd, affiliateLink);
    revalidatePath('/cto/borsa');
    revalidatePath('/koleksiyonum');
    revalidatePath('/figurler/[slug]', 'page');
    return { success: true };
  } catch (err: any) {
console.error(err);
    return { error: err.message };
  }
}
