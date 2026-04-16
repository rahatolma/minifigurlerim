'use server';

import 'server-only';
import { getAuthUserProfile } from '@/services/action_dal';
import { createAdminClient } from '@/utils/supabase/admin';
import { AdminActionResponse } from '@/types/admin-action';

export async function saveSeriesData(formData: any, isEdit: boolean, seriesId?: string): Promise<AdminActionResponse> {
  try {
    // 1. Yetki Kontrolü
    const { user, profile } = await getAuthUserProfile();
    if (!user || profile?.role !== 'admin') {
      throw new Error('Yetkisiz işlem: Admin yetkiniz bulunmuyor.');
    }

    // 2. Format ve Güvenlik Sanitizasyonu (Görsel URL Doğrulama)
    if (formData.showcase_images && Array.isArray(formData.showcase_images)) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Sunucu yapılandırma hatası (Supabase URL eksik).');
      
      const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/minifigure-images/`;
      for (const img of formData.showcase_images) {
        if (typeof img === 'string' && img.trim() !== '' && !img.startsWith(expectedPrefix)) {
           throw new Error('Geçersiz görsel kaynağı! Yalnızca sisteme güvenli yüklenmiş görseller kabul edilir.');
        }
      }
    }

    // 3. Servis Rolü ile Veritabanı İstemcisi
    const adminClient = createAdminClient();

    // 4. Veritabanı Yazma İşlemi
    if (isEdit && seriesId) {
      const { data, error } = await adminClient
        .from('series')
        .update(formData)
        .eq('id', seriesId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Seri bulunamadı veya güncellenemedi.');
      }

      // Kaskad Güncelleme
      const cascadePayload = {
        category: formData.category,
        series_name: formData.title,
        series_no: formData.series_no
      };
      
      const { error: cascadeError } = await adminClient
        .from('minifigures')
        .update(cascadePayload)
        .eq('series_id', seriesId);

      if (cascadeError) {
        console.error("Figürler kaskad güncellenirken hata:", cascadeError);
        return { success: true, message: 'Seri güncellendi ama içindeki figürler eşitlenemedi. 🎉', data: data[0] };
      }

      return { success: true, message: 'Seri GÜNCELLENDİ ve içindeki tüm figürler otomatik eşitlendi! 🎉', data: data[0] };
    } else {
      const { data, error } = await adminClient
        .from('series')
        .insert([formData])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Yeni seri oluşturulamadı.');
      }
      return { success: true, message: 'Yeni seri başarıyla eklendi! 🎉', data: data[0] };
    }
  } catch (err: any) {
    console.error('[Action: saveSeriesData] Error:', err);
    return { success: false, error: err.message || 'Bilinmeyen bir hata oluştu.' };
  }
}

export async function deleteSeriesData(seriesId: string): Promise<AdminActionResponse> {
  try {
    const { user, profile } = await getAuthUserProfile();
    if (!user || profile?.role !== 'admin') {
      throw new Error('Yetkisiz işlem: Admin yetkiniz bulunmuyor.');
    }

    if (!seriesId) {
      throw new Error('Geçersiz ID.');
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('series')
      .delete()
      .eq('id', seriesId)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('Seri bulunamadı veya silinemedi.');
    }

    return { success: true, message: 'Seri başarıyla silindi.' };
  } catch (err: any) {
    console.error('[Action: deleteSeriesData] Error:', err);
    return { success: false, error: err.message || 'Bilinmeyen bir hata oluştu.' };
  }
}
