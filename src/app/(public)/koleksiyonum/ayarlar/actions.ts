'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  // 1. Profil (Metadataları) Güncelle
  const updatePayload: any = { 
    full_name: fullName || null, 
    age: age,
  };
  
  const { error: profileError } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id);

  if (profileError) {
     return { error: 'Profil güncellenirken bir hata oluştu: ' + profileError.message };
  }

  // 2. Email değişikliği varsa AUTH tetikle
  if (newEmail && newEmail !== user.email) {
     const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });
     if (emailError) {
       return { error: 'Profil güncellendi ama e-posta değiştirilemedi: ' + emailError.message };
     }
     // Eğer başarıyla istek giderse toast mesajında bildirin
     revalidatePath('/koleksiyonum/ayarlar');
     revalidatePath('/koleksiyonum');
     return { success: true, message: 'Profil güncellendi. Yeni e-postana gönderilen onay linkine tıklamalısın!' };
  }

  revalidatePath('/koleksiyonum/ayarlar');
  revalidatePath('/koleksiyonum');
  
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    return { error: 'Şifre güncellenemedi: ' + error.message };
  }

  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Güvenli dosya adı oluştur
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  
  // Storage'a yetkili (admin) olarak yükle (RLS takılmaz)
  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    return { error: 'Görsel yüklenemedi. Lütfen "avatars" isminde public bir Storage kovanız olduğundan emin olun! (' + uploadError.message + ')' };
  }

  // Public URL'i al
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

  // Profile kaydet
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  if (profileError) {
    return { error: 'Görsel yüklendi ancak profile kaydedilemedi.' };
  }

  revalidatePath('/koleksiyonum/ayarlar');
  revalidatePath('/koleksiyonum');

  return { success: true, url: publicUrl };
}
