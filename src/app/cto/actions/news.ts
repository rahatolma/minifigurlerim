'use server';

import 'server-only';
import { getAuthUserProfile } from '@/services/action_dal';
import { createAdminClient } from '@/utils/supabase/admin';
import { AdminActionResponse } from '@/types/cto-action';

export async function saveNewsData(formData: any, isEdit: boolean, newsId?: string): Promise<AdminActionResponse> {
  try {
    // 1. Yetki Kontrolü
    const { user, profile } = await getAuthUserProfile();
    if (!user || profile?.role !== 'admin') {
      throw new Error('Yetkisiz işlem: Admin yetkiniz bulunmuyor.');
    }

    // 2. Format ve Güvenlik Sanitizasyonu (Görsel URL Doğrulama)
    if (formData.cover_image && typeof formData.cover_image === 'string') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Sunucu yapılandırma hatası (Supabase URL eksik).');
      
      const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/minifigure-images/`;
      if (formData.cover_image.trim() !== '' && !formData.cover_image.startsWith(expectedPrefix)) {
          throw new Error('Geçersiz görsel kaynağı! Yalnızca sisteme güvenli yüklenmiş görseller kabul edilir.');
      }
    }

    // 3. Servis Rolü ile Veritabanı İstemcisi
    const adminClient = createAdminClient();

    // 4. Veritabanı Yazma İşlemi
    if (isEdit && newsId) {
      const { data, error } = await adminClient
        .from('news')
        .update(formData)
        .eq('id', newsId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Haber bulunamadı veya güncellenemedi.');
      }
      return { success: true, message: 'Haber başarıyla güncellendi! 🎉', data: data[0] };
    } else {
      const { data, error } = await adminClient
        .from('news')
        .insert([formData])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Yeni haber oluşturulamadı.');
      }
      return { success: true, message: 'Yeni haber başarıyla eklendi! 🎉', data: data[0] };
    }
  } catch (err: any) {
    console.error('[Action: saveNewsData] Error:', err);
    return { success: false, error: err.message || 'Bilinmeyen bir hata oluştu.' };
  }
}

export async function deleteNewsData(newsId: string): Promise<AdminActionResponse> {
  try {
    const { user, profile } = await getAuthUserProfile();
    if (!user || profile?.role !== 'admin') {
      throw new Error('Yetkisiz işlem: Admin yetkiniz bulunmuyor.');
    }

    if (!newsId) {
      throw new Error('Geçersiz ID.');
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('news')
      .delete()
      .eq('id', newsId)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('Haber bulunamadı veya silinemedi.');
    }

    return { success: true, message: 'Haber başarıyla silindi.' };
  } catch (err: any) {
    console.error('[Action: deleteNewsData] Error:', err);
    return { success: false, error: err.message || 'Bilinmeyen bir hata oluştu.' };
  }
}
