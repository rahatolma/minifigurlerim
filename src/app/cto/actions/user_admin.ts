'use server';

import { revalidatePath } from 'next/cache';
import { 
  getAuthUserProfile,
  toggleUserApprovalAdminDal,
  deleteUserFromDBAdminDal,
  getUserDetailedInfoAdminDal
} from '@/services/action_dal';

export async function toggleUserApproval(userId: string, currentStatus: boolean) {
  const { user, profile } = await getAuthUserProfile();
  if (!user || profile?.role !== 'admin') {
    return { error: 'Bu işlemi yapmak için yetkiniz yok!' };
  }

  if (user.id === userId) {
    return { error: 'Kendi hesabınızın yetkisini değiştiremezsiniz.' };
  }

  try {
    await toggleUserApprovalAdminDal(userId, currentStatus);
    revalidatePath('/cto/kullanicilar', 'page');
    revalidatePath('/admin/kullanicilar', 'page');
    return { success: true };
  } catch (err: any) {
console.error(err);
    return { error: err.message };
  }
}

export async function deleteUserFromDB(userId: string) {
  const { user, profile } = await getAuthUserProfile();
  if (!user || profile?.role !== 'admin') {
    return { error: 'Yetkisiz İşlem' };
  }

  if (user.id === userId) {
    return { error: 'Kendi hesabınızı silemez/banlayamazsınız.' };
  }

  try {
    await deleteUserFromDBAdminDal(userId);
    revalidatePath('/cto/kullanicilar', 'page');
    revalidatePath('/admin/kullanicilar', 'page');
    return { success: true };
  } catch (err: any) {
console.error(err);
    return { error: err.message };
  }
}

export async function getUserDetailedInfo(targetUserId: string) {
  const { user, profile } = await getAuthUserProfile();
  if (!user || profile?.role !== 'admin') {
    return { error: 'Yetkisiz erişim.' };
  }

  try {
    const data = await getUserDetailedInfoAdminDal(targetUserId);
    return { ...data, success: true };
  } catch (err: any) {
console.error(err);
    return { error: err.message, success: false };
  }
}
