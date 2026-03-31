import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getBrickLinkPrice } from '@/lib/bricklink';

// Bu Route'un Vercel veya dış cron hizmetleri tarafından tetiklenirken 
// max süre limitine takılmaması için ayarlamalar:
export const maxDuration = 60; // saniye (Veritabanı büyükse Vercel Max limitleri zorlanabilir)
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Yetkilendirme Kontrolü (Cron'u herkesin dışarıdan URL ile tetiklememesi için)
    // Örn: GET /api/cron/sync-prices?key=GİZLİ_ŞİFRE
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    
    // Gerçek ortama (Production) çıktığında env değişkeninden CRON şifreni çekmelisin
    if (key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    // 2. Sunucu Tabanlı Admin Client (Bypass RLS)
    // Otomasyon işleri anonim olamaz, Service Role Key kullanılarak full yetkiyle bağlanır.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ŞİMDİLİK LIMIT 50: API rate limitini aşmamak için parça parça.
    // 'updated_at' ascending ile sıraya diziyoruz ki her çalışmada "en eski güncellenmişleri" seçip tüm kataloğu günlerce turlayabilsin.
    const { data: minifigures, error } = await supabaseAdmin
      .from('minifigures')
      .select('id, code, name')
      .not('code', 'is', null) // Kodu (örn: col123) olmayanları aratamayız
      .order('updated_at', { ascending: true })
      .limit(50);

    if (error) throw error;
    if (!minifigures || minifigures.length === 0) {
      return NextResponse.json({ message: 'No minifigures valid for update' });
    }

    let updatedCount = 0;
    const errors: string[] = [];

    // 4. Döngüyle her bir ürünün canlı fiyatını API'den sorgula
    for (const fig of minifigures) {
      try {
         // BrickLink Price Guide'dan resmi veriyi çekiyoruz (artık Rebrickable sahte verisi değil!)
         const newValue = await getBrickLinkPrice(fig.code);
         
         if (newValue !== null && newValue > 0) {
            // value_usd kolonunu güncelliyoruz!
            // Supabase'deki 'trigger_log_price_change' (Tetikleyici) bizim için o eski ve yeni değer 
            // arasındaki farkı yakalayıp 'minifigure_price_history' tablosuna arşivleyecek! ✨
            const { error: updateError } = await supabaseAdmin
              .from('minifigures')
              .update({ value_usd: newValue })
              .eq('id', fig.id);

            if (updateError) {
               errors.push(`Failed to update DB for ${fig.code}: ${updateError.message}`);
            } else {
               updatedCount++;
            }
         }
      } catch (err: any) {
         errors.push(`Failed to fetch API for ${fig.code}: ${err.message}`);
      }
    }

    // 5. Rapor Döndür
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} minifigure prices out of ${minifigures.length}.`,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
