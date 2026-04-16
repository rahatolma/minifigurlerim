'use server';

import 'server-only';
import { getAuthUserProfile } from '@/services/action_dal';
import { createAdminClient } from '@/utils/supabase/admin';

export async function saveFigureData(formData: any, isEdit: boolean, figureId?: string) {
  try {
    // 1. Yetki Kontrolü
    const { user, profile } = await getAuthUserProfile();
    if (!user || profile?.role !== 'admin') {
      throw new Error('Yetkisiz işlem: Admin yetkiniz bulunmuyor.');
    }

    // 2. Format ve Güvenlik Sanitizasyonu (Görsel URL Doğrulama)
    if (formData.images && Array.isArray(formData.images)) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Sunucu yapılandırma hatası (Supabase URL eksik).');
      
      const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/minifigure-images/`;
      for (const img of formData.images) {
        if (typeof img === 'string' && img.trim() !== '' && !img.startsWith(expectedPrefix)) {
           throw new Error('Geçersiz görsel kaynağı! Yalnızca sisteme güvenli yüklenmiş görseller kabul edilir.');
        }
      }
    }

    // 3. Servis Rolü ile Veritabanı İstemcisi
    const adminClient = createAdminClient();

    // 4. Veritabanı Yazma İşlemi
    if (isEdit && figureId) {
      const { data, error } = await adminClient
        .from('minifigures')
        .update(formData)
        .eq('id', figureId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Figür bulunamadı veya güncellenemedi.');
      }
      return { success: true, message: 'Figür başarıyla güncellendi! 🎉', data: data[0] };
    } else {
      const { data, error } = await adminClient
        .from('minifigures')
        .insert([formData])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Yeni figür oluşturulamadı.');
      }
      return { success: true, message: 'Yeni figür başarıyla eklendi! 🎉', data: data[0] };
    }
  } catch (err: any) {
    console.error('[Action: saveFigureData] Error:', err);
    return { success: false, error: err.message || 'Bilinmeyen bir hata oluştu.' };
  }
}

export async function deleteFigureData(figureId: string) {
  try {
    const { user, profile } = await getAuthUserProfile();
    if (!user || profile?.role !== 'admin') {
      throw new Error('Yetkisiz işlem: Admin yetkiniz bulunmuyor.');
    }

    if (!figureId) {
      throw new Error('Geçersiz ID.');
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('minifigures')
      .delete()
      .eq('id', figureId)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('Figür bulunamadı veya silinemedi.');
    }

    return { success: true, message: 'Figür başarıyla silindi.' };
  } catch (err: any) {
    console.error('[Action: deleteFigureData] Error:', err);
    return { success: false, error: err.message || 'Bilinmeyen bir hata oluştu.' };
  }
}
