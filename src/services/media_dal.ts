'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function uploadEntityMedia(formData: FormData): Promise<string> {
  const file = formData.get('file') as File;
  const entityType = formData.get('entityType') as string; // 'series', 'figures', 'about', 'blog', 'site'
  const slug = formData.get('slug') as string;
  const field = formData.get('field') as string || 'main'; // e.g. cover, hero, main, boss

  if (!file || !entityType || !slug) {
     throw new Error("Eksik dosya veya metadata (file, entityType, slug gerekli)");
  }

  // Boyut kontrolü (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
      throw new Error("Dosya boyutu 5MB'dan büyük olamaz.");
  }

  // Sadece yetkilendirilmiş Mime kontrolleri
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
      throw new Error("Sadece JPEG, PNG, WEBP, AVIF ve SVG dosyaları desteklenir.");
  }

  // Temiz İsimlendirme standardı: {entityType}/{slug}/{field}-{timestamp}.{ext}
  const timestamp = new Date().getTime();
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${entityType}/${slug}/${field}-${timestamp}.${ext}`;

  const supabaseAdmin = getAdminClient();

  const { data, error } = await supabaseAdmin.storage
    .from('minifigure-images') // User specifically requested to NOT use new media bucket, stick to 'minifigure-images'
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error("Upload Error:", error);
    throw new Error(`Medya yükleme hatası: ${error.message}`);
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from('minifigure-images').getPublicUrl(fileName);
  return publicUrl;
}
