'use server';

import { revalidatePath } from 'next/cache';
import { 
  getAuthUser, 
  updateUserProfileDal, 
  updateUserAuthEmailDal, 
  updateUserPasswordDal, 
  uploadAvatarAdminDal 
} from '@/services/action_dal';

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
    await updateUserProfileDal(user.id, updatePayload);
  } catch (err: any) {
    return { error: 'Profil güncellenirken bir hata oluştu: ' + err.message };
  }

  if (newEmail && newEmail !== user.email) {
     try {
       await updateUserAuthEmailDal(newEmail);
       revalidatePath('/koleksiyonum/ayarlar');
       revalidatePath('/koleksiyonum');
       return { success: true, message: 'Profil güncellendi. Yeni e-postana gönderilen onay linkine tıklamalısın!' };
     } catch (err: any) {
       return { error: 'Profil güncellendi ama e-posta değiştirilemedi: ' + err.message };
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

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Şifreniz en az 6 karakter olmalıdır.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Girdiğiniz şifreler eşleşmiyor!' };
  }

  try {
    await updateUserPasswordDal(newPassword);
    return { success: true };
  } catch (err: any) {
    return { error: 'Şifre güncellenemedi: ' + err.message };
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
    const result = await uploadAvatarAdminDal(user.id, file, fileName);
    revalidatePath('/koleksiyonum/ayarlar');
    revalidatePath('/koleksiyonum');
    return { success: true, url: result.url };
  } catch (err: any) {
    return { error: err.message };
  }
}
