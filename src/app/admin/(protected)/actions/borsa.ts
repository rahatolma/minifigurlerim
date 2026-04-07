'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateBorsaData(minifigureId: string, valueUsd: number, affiliateLink: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Oturum bulunamadı.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Sadece Yöneticiler piyasa işlemi yapabilir.' };

  // 1. Minifigür Tablosunu Güncelle (Affiliate Kolonu yoksa hata verebilir, onu yönetelim)
  const updatePayload: any = { value_usd: valueUsd };
  if (affiliateLink !== undefined) {
    updatePayload.affiliate_link = affiliateLink;
  }

  const { error: updateError } = await supabase
    .from('minifigures')
    .update(updatePayload)
    .eq('id', minifigureId);

  if (updateError) {
    if (updateError.message.includes('affiliate_link')) {
      return { error: "affiliate_link sütunu veritabanında bulunamadı. Lütfen Supabase SQL Editor üzerinden şu komutu çalıştırın: ALTER TABLE minifigures ADD COLUMN IF NOT EXISTS affiliate_link TEXT;" };
    }
    return { error: updateError.message };
  }

  // 2. Fiyat Geçmişi Tablosuna (Log/History) Ekle (Zaten var olan tablo)
  const { error: historyError } = await supabase
    .from('minifigure_price_history')
    .insert({
      minifigure_id: minifigureId,
      value_usd: valueUsd
    });

  if (historyError) {
      console.warn("History Tablosuna yazılamadı:", historyError);
      // Fiyat geçmişi tablosu yoksa veya hatalıysa, ana işlem başarıldığı için sessizce devam edebiliriz ya da hata basarız.
  }

  revalidatePath('/admin/borsa');
  revalidatePath('/koleksiyonum');
  revalidatePath('/figurler/[slug]', 'page');

  return { success: true };
}
