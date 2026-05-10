'use server';

import { revalidatePath } from 'next/cache';
import { 
  getAuthUserProfile,
  toggleUserApprovalAdminDal,
  banUserAdminDal,
  unbanUserAdminDal,
  getUserDetailedInfoAdminDal
} from '@/services/action_dal';

export async function toggleUserApproval(userId: string, currentStatus: boolean, currentStatusText?: string) {
  const { user, profile } = await getAuthUserProfile();
  if (!user || profile?.role !== 'admin') {
    return { error: 'Bu işlemi yapmak için yetkiniz yok!' };
  }

  if (user.id === userId) {
    return { error: 'Kendi hesabınızın yetkisini değiştiremezsiniz.' };
  }

  try {
    await toggleUserApprovalAdminDal(user.id, userId, currentStatus, currentStatusText);
    revalidatePath('/cto/kullanicilar', 'page');
    revalidatePath('/admin/kullanicilar', 'page');
    return { success: true };
  } catch (err: any) {
console.error(err);
    return { error: err.message };
  }
}

export async function banUserAction(userId: string, reason: string) {
  const { user, profile } = await getAuthUserProfile();
  if (!user || profile?.role !== 'admin') {
    return { error: 'Yetkisiz İşlem' };
  }

  if (user.id === userId) {
    return { error: 'Kendi hesabınızı banlayamazsınız.' };
  }

  try {
    await banUserAdminDal(user.id, userId, reason);
    revalidatePath('/cto/kullanicilar', 'page');
    revalidatePath('/admin/kullanicilar', 'page');
    return { success: true };
  } catch (err: any) {
console.error(err);
    return { error: err.message };
  }
}

export async function unbanUserAction(userId: string, reason: string) {
  const { user, profile } = await getAuthUserProfile();
  if (!user || profile?.role !== 'admin') {
    return { error: 'Yetkisiz İşlem' };
  }

  try {
    await unbanUserAdminDal(user.id, userId, reason);
    revalidatePath('/cto/kullanicilar', 'page');
    revalidatePath('/admin/kullanicilar', 'page');
    return { success: true };
  } catch (err: any) {
console.error(err);
    return { error: err.message };
  }
}

// Left for backward compatibility for now during Phase 1 if components still import it
export async function deleteUserFromDB(userId: string) {
  return banUserAction(userId, 'Migration öncesi legacy silme çağrısı (Soft-Ban uygulandı)');
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
