import { NextResponse } from 'next/server';
import { getBrickLinkPrice } from '@/lib/bricklink';
import { getMinifiguresForCronDal, syncMinifigurePriceAdminDal } from '@/services/action_dal';

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


    // ŞİMDİLİK LIMIT 50: API rate limitini aşmamak için parça parça.
    const minifigures = await getMinifiguresForCronDal(50);

    if (!minifigures || minifigures.length === 0) {
      return NextResponse.json({ message: 'No minifigures valid for update' });
    }

    let updatedCount = 0;
    const errors: string[] = [];

    for (const fig of minifigures) {
      try {
         const newValue = await getBrickLinkPrice(fig.code);
         
         if (newValue !== null && newValue > 0) {
            await syncMinifigurePriceAdminDal(fig.id, newValue);
            updatedCount++;
         }
      } catch (err: any) {
         errors.push(`Failed to fetch API or update DB for ${fig.code}: ${err.message}`);
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
