'use server';

import 'server-only';
import { getAuthUserProfile } from '@/services/action_dal';
import { createAdminClient } from '@/utils/supabase/admin';
import { AdminActionResponse } from '@/types/admin-action';
import { validateNamingConvention, normalizeSlug } from '@/utils/validations/naming-standards';
import { validateInteger } from '@/utils/validations/numeric';

export async function saveFigureData(formData: any, isEdit: boolean, figureId?: string): Promise<AdminActionResponse> {
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

    // 2.5 Naming Convention Enforcement (Mimari Zorunluluk)
    if (formData.title) validateNamingConvention(formData.title);
    if (formData.character) validateNamingConvention(formData.character);
    
     else if (formData.slug) {
      formData.slug = normalizeSlug(formData.slug);
    }

    // 3. Servis Rolü ile Veritabanı İstemcisi
    
    // --- PHASE 2: ADMIN VALIDATION CONTRACT ---
    // 1. Strict Required Fields
    if (!formData.series_id) throw new Error("Doğrulama Hatası: 'series_id' (Seri) zorunludur.");
    if (!formData.figure_code || String(formData.figure_code).trim() === '') throw new Error("Doğrulama Hatası: 'figure_code' zorunludur.");
    if (!formData.figure_name || String(formData.figure_name).trim() === '') throw new Error("Doğrulama Hatası: 'figure_name' zorunludur.");
    if (!formData.slug_tr || String(formData.slug_tr).trim() === '') throw new Error("Doğrulama Hatası: 'slug_tr' zorunludur.");
    
    // 2. Strict Numeric Enforcement (Rule 1)

    formData.piece_count = validateInteger(formData.piece_count, 'piece_count');
    // figure_number'ı Number'a parse ediyoruz ama string olarak db'deki yapıya uygun string-int atıyoruz
    formData.figure_number = String(validateInteger(formData.figure_number, 'figure_number'));
    
    // 3. Normalization
    formData.figure_code = String(formData.figure_code).trim();
    formData.slug_tr = normalizeSlug(String(formData.slug_tr).trim());
    if (formData.slug_en) formData.slug_en = normalizeSlug(String(formData.slug_en).trim());

    // 4. Legacy Mirroring (Source of Truth -> Fallback)
    // Bu sayede Front-End formunda gereksiz alan yollanmasa bile arka kapıda hizalanır.
    formData.slug = formData.slug_tr;
    formData.name = formData.figure_name;
    formData.code = formData.figure_code;

    const adminClient = createAdminClient();

    // 5. Duplicate Guard: figure_code (GLOBAL)
    let codeQuery = adminClient.from('minifigures').select('id').eq('figure_code', formData.figure_code);
    if (isEdit && figureId) codeQuery = codeQuery.neq('id', figureId);
    const { data: existingCode } = await codeQuery;
    if (existingCode && existingCode.length > 0) {
        throw new Error(`CRITICAL: '${formData.figure_code}' kodlu figür zaten var! Duplicate figure_code oluşturulamaz.`);
    }

    // 6. Duplicate Guard: slug_tr (SERIES CONTEXT)
    let slugQuery = adminClient.from('minifigures').select('id')
        .eq('slug_tr', formData.slug_tr)
        .eq('series_id', formData.series_id);
    if (isEdit && figureId) slugQuery = slugQuery.neq('id', figureId);
    const { data: existingSlugInSeries } = await slugQuery;
    if (existingSlugInSeries && existingSlugInSeries.length > 0) {
        throw new Error(`CRITICAL: Bu seri içerisinde '${formData.slug_tr}' URL'si zaten kullanımda!`);
    }


    

    // 5. Veritabanı Yazma İşlemi (DB Constraint Fallback Guard)
    try {
      if (isEdit && figureId) {
        const { data, error } = await adminClient
          .from('minifigures')
          .update(formData)
          .eq('id', figureId)
          .select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Figür bulunamadı veya güncellenemedi.');
        return { success: true, message: 'Figür başarıyla güncellendi! 🎉', data: data[0] };
      } else {
        const { data, error } = await adminClient
          .from('minifigures')
          .insert([formData])
          .select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Yeni figür oluşturulamadı.');
        return { success: true, message: 'Yeni figür başarıyla eklendi! 🎉', data: data[0] };
      }
    } catch (dbErr: any) {
       // Graceful DB constraint handling (Rule 3)
       if (dbErr.code === '23505') {
           if (dbErr.message?.includes('slug')) {
              throw new Error("Veritabanı Reddi: Bu Seri içerisinde bu Slug (URL) zaten mevcut.");
           } else if (dbErr.message?.includes('code')) {
              throw new Error("Veritabanı Reddi: Bu Figür Kodu (figure_code) sistemde zaten kullanımda.");
           }
       }
       throw dbErr;
    }
  } catch (err: any) {
    console.error('[Action: saveFigureData] Error:', err);
    return { success: false, error: err.message || 'Bilinmeyen bir hata oluştu.' };
  }
}

export async function deleteFigureData(figureId: string): Promise<AdminActionResponse> {
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
