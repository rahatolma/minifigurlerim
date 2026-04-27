'use server';

import 'server-only';
import { getAuthUserProfile } from '@/services/action_dal';
import { createAdminClient } from '@/utils/supabase/admin';
import { AdminActionResponse } from '@/types/cto-action';
import { validateNamingConvention, normalizeSlug } from '@/utils/validations/naming-standards';
import { generateENContent } from '@/services/aiGenerator';

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

    // 2.5 Naming Convention Enforcement (Mimari Zorunluluk)
    if (formData.title) validateNamingConvention(formData.title);
    if (formData.category) validateNamingConvention(formData.category);
    
    // Slug mekanik standartlaması
    if (formData.title && (!formData.slug || formData.slug.trim() === '')) {
      formData.slug = normalizeSlug(formData.title);
    } else if (formData.slug) {
      formData.slug = normalizeSlug(formData.slug);
    }

    // 3. Servis Rolü ile Veritabanı İstemcisi
    const adminClient = createAdminClient();

    // 4. Veritabanı Yazma İşlemi
    let savedEntity;
    let message = '';

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
      
      savedEntity = data[0];
      message = 'Seri GÜNCELLENDİ ve içindeki tüm figürler otomatik eşitlendi! 🎉';

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
        message = 'Seri güncellendi ama içindeki figürler eşitlenemedi. 🎉';
      }
    } else {
      const { data, error } = await adminClient
        .from('series')
        .insert([formData])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Yeni seri oluşturulamadı.');
      }
      
      savedEntity = data[0];
      message = 'Yeni seri başarıyla eklendi! 🎉';
    }

    // 5. Asenkron AI Translation Job (Non-blocking)
    const isManualOverride = savedEntity.en_translation_status === 'manual_override';
    const forceRegenerate = formData.en_translation_status === 'queued';
    const trSourceData = { title: savedEntity.title, category: savedEntity.category, content_blocks: savedEntity.content_blocks };
    
    // We import this dynamically to avoid circular dependencies if any, but regular import is fine.
    const { queueTranslationJobIfNeeded } = await import('@/services/aiTranslationPipeline');
    
    const { queued, hash, error: queueError } = await queueTranslationJobIfNeeded(
      'series',
      savedEntity.id,
      trSourceData,
      savedEntity.en_source_hash || null,
      isManualOverride,
      forceRegenerate
    );

    if (queued) {
      console.log(`[Auto-Generate] Queued EN translation job for series: ${savedEntity.id} with hash: ${hash}`);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004';
      // Fire and forget (may not trigger depending on Vercel environment, but good enough for Phase 1 / local)
      const expectedSecret = process.env.CRON_SECRET || process.env.API_SECRET;
      fetch(`${siteUrl}/api/jobs/process-translation`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(expectedSecret ? { 'Authorization': `Bearer ${expectedSecret}` } : {})
        },
        body: JSON.stringify({ jobId: null })
      }).catch(e => console.error('Failed to trigger job processor:', e));
    }

    return { success: true, message, data: savedEntity };
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
