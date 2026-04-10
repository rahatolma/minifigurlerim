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

  try {
    await toggleUserApprovalAdminDal(userId, currentStatus);
    revalidatePath('/admin/kullanicilar');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteUserFromDB(userId: string) {
  const { user, profile } = await getAuthUserProfile();
  if (!user || profile?.role !== 'admin') {
    return { error: 'Yetkisiz İşlem' };
  }

  try {
    await deleteUserFromDBAdminDal(userId);
    revalidatePath('/admin/kullanicilar');
    return { success: true };
  } catch (err: any) {
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
    return { error: err.message, success: false };
  }
}
