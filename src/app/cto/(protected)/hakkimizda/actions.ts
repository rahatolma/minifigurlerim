'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const getAdminClient = () => {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function updateAboutSettingsAction(payload: any) {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin.from('about_settings').upsert({ id: 1, ...payload }).select();
  if (error) {
    console.error("updateAboutSettingsAction Error: ", error);
    throw new Error(error.message || 'Bilinmeyen bir hata oluştu');
  }
  
  // Spesifik Invalidation: Sadece Hakkımızda rotalarını hedef al
  // Balyoz (layout) çözümü yerine spesifik route path'leri kullanıyoruz.
  revalidatePath('/[locale]/(public)/hakkimizda', 'page');
  revalidatePath('/tr/hakkimizda');
  revalidatePath('/en/about');
  
  return data;
}
