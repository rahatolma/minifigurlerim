'use server';

import { revalidatePath } from 'next/cache';
import { 
  getAuthUser, 
  updateUserProfileDal, 
  updateUserAuthEmailDal, 
  updateUserPasswordDal, 
  uploadAvatarAdminDal 
} from '@/services/action_dal';
import { validatePassword } from '@/utils/validations/password';

export async function updateProfile(formData: FormData) {
  const user = await getAuthUser();

  if (!user) {
    return { error: 'Oturum bulunamadı. Lütfen giriş yapın.' };
  }

  const fullName = formData.get('full_name') as string;
  const ageStr = formData.get('age') as string;
  const newEmail = formData.get('email') as string;

  let age: number | null = null;
  if (ageStr && !isNaN(Number(ageStr))) {
    age = Number(ageStr);
  }

  const updatePayload: any = { 
    full_name: fullName || null, 
    age: age,
  };
  
  try {
    const operation = updateUserProfileDal(user.id, updatePayload);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));
    await Promise.race([operation, timeout]);
  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
       console.error(JSON.stringify({ code: 'PROFILE_UPDATE_TIMEOUT', message: 'Action timed out after 8s', userId: user.id }));
       return { error: 'Profil güncellenirken zaman aşımı yaşandı.' };
    }
    console.error(JSON.stringify({ code: 'PROFILE_UPDATE_FAILED', error: err.message, userId: user.id }));
    return { error: 'Profil güncellenemedi, lütfen daha sonra tekrar deneyiniz.' };
  }

  if (newEmail && newEmail !== user.email) {
     try {
       const operation = updateUserAuthEmailDal(newEmail);
       const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));
       await Promise.race([operation, timeout]);
       
       revalidatePath('/koleksiyonum/ayarlar');
       revalidatePath('/koleksiyonum');
       return { success: true, message: 'Profil güncellendi. Yeni e-postana gönderilen onay linkine tıklamalısın!' };
     } catch (err: any) {
       if (err.message === 'TIMEOUT') {
          console.error(JSON.stringify({ code: 'EMAIL_UPDATE_TIMEOUT', message: 'Action timed out after 8s', userId: user.id }));
          return { error: 'Profil güncellendi ancak e-posta değişimi zaman aşımına uğradı.' };
       }
       console.error(JSON.stringify({ code: 'EMAIL_UPDATE_FAILED', error: err.message, userId: user.id }));
       return { error: 'Profil güncellendi ama e-posta sistemden dolayı değiştirilemedi.' };
     }
  }

  revalidatePath('/koleksiyonum/ayarlar');
  revalidatePath('/koleksiyonum');
  
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const user = await getAuthUser();

  if (!user) {
    return { error: 'Oturum bulunamadı.' };
  }

  const newPassword = formData.get('new_password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  if (newPassword !== confirmPassword) {
    return { error: 'Error_passwords_mismatch' };
  }

  const validation = validatePassword(newPassword);
  if (!validation.isValid) {
    return { error: 'Error_weak_password' };
  }

  try {
    const operation = updateUserPasswordDal(newPassword);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 8000));
    await Promise.race([operation, timeout]);
    return { success: true };
  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
       console.error(JSON.stringify({ code: 'PASSWORD_UPDATE_TIMEOUT', message: 'Action timed out after 8s', userId: user.id }));
       return { error: 'ERROR_TIMEOUT' };
    }
    console.error(JSON.stringify({ code: 'PASSWORD_UPDATE_FAILED', error: err.message, userId: user.id }));
    return { error: 'Error_update_failed' };
  }
}

export async function uploadAvatar(formData: FormData) {
  const user = await getAuthUser();

  if (!user) {
    return { error: 'Oturum bulunamadı.' };
  }

  const file = formData.get('file') as File;
  if (!file || file.size === 0) {
    return { error: 'Görsel dosyası seçilmedi.' };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Dosya boyutu 5 MB\'dan küçük olmalıdır.' };
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  
  try {
    const operation = uploadAvatarAdminDal(user.id, file, fileName);
    const timeout = new Promise<any>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 15000)); // 15s timeout file uploads
    const result = await Promise.race([operation, timeout]);
    
    revalidatePath('/koleksiyonum/ayarlar');
    revalidatePath('/koleksiyonum');
    return { success: true, url: result.url };
  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
       console.error(JSON.stringify({ code: 'AVATAR_UPLOAD_TIMEOUT', message: 'Action timed out after 15s', userId: user.id }));
       return { error: 'Görsel yüklenirken zaman aşımı yaşandı.' };
    }
    console.error(JSON.stringify({ code: 'AVATAR_UPLOAD_FAILED', error: err.message, userId: user.id }));
    return { error: 'Görsel yüklenemedi. ' + (err.message || '') };
  }
}
