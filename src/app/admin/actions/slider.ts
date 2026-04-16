'use server';

import { getAuthUserProfile } from '@/services/action_dal';
import { createAdminClient } from '@/utils/supabase/admin';
import { AdminActionResponse } from '@/types/admin-action';

export async function saveSliderData(formData: any, isEdit: boolean, sliderId?: string): Promise<AdminActionResponse> {
  try {
    // 1. Yetki Kontrolü
    const { user, profile } = await getAuthUserProfile();
    if (!user || profile?.role !== 'admin') {
      throw new Error('Yetkisiz işlem: Admin yetkiniz bulunmuyor.');
    }

    // 2. Format ve Güvenlik Sanitizasyonu (Görsel URL Doğrulama)
    if (formData.image_url && typeof formData.image_url === 'string') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Sunucu yapılandırma hatası (Supabase URL eksik).');
      
      const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/minifigure-images/`;
      if (!formData.image_url.startsWith(expectedPrefix)) {
         throw new Error('Geçersiz görsel kaynağı! Yalnızca sisteme güvenli yüklenmiş görseller (minifigure-images bucket) kabul edilir.');
      }
    }

    // 3. Servis Rolü ile Veritabanı İstemcisi
    const adminClient = createAdminClient();

    // 4. Veritabanı Yazma İşlemi
    if (isEdit && sliderId) {
      const { data, error } = await adminClient
        .from('home_sliders')
        .update(formData)
        .eq('id', sliderId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Slayt bulunamadı veya güncellenemedi.');
      }
      return { success: true, message: 'Slayt başarıyla güncellendi! 🎉', data: data[0] };
    } else {
      const { data, error } = await adminClient
        .from('home_sliders')
        .insert([formData])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Yeni slayt oluşturulamadı.');
      }
      return { success: true, message: 'Yeni slayt başarıyla eklendi! 🎉', data: data[0] };
    }
  } catch (err: any) {
    console.error('[Action: saveSliderData] Error:', err);
    return { success: false, error: err.message || 'Bilinmeyen bir hata oluştu.' };
  }
}

export async function deleteSliderData(sliderId: string): Promise<AdminActionResponse> {
  try {
    const { user, profile } = await getAuthUserProfile();
    if (!user || profile?.role !== 'admin') {
      throw new Error('Yetkisiz işlem: Admin yetkiniz bulunmuyor.');
    }

    if (!sliderId) {
      throw new Error('Geçersiz ID.');
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('home_sliders')
      .delete()
      .eq('id', sliderId)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('Slider bulunamadı veya silinemedi.');
    }

    return { success: true, message: 'Slayt başarıyla silindi.' };
  } catch (err: any) {
    console.error('[Action: deleteSliderData] Error:', err);
    return { success: false, error: err.message || 'Bilinmeyen bir hata oluştu.' };
  }
}
