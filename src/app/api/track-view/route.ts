import { NextResponse } from 'next/server';
import { trackUserViewDal } from '@/services/action_dal';
import { headers } from 'next/headers';

// Basit Memory-bazlı IP Rate Limiting Koruması (Vercel Lambda'da yeterli koruma sağlar)
const viewCache = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table, id } = body;

    // Sadece yetkili listelenen tablolar API tarafından kabul edilir 
    if (!table || !id || (table !== 'series' && table !== 'minifigures')) {
      return NextResponse.json({ error: 'Geçersiz parametre veya yetkisiz tablo isteği' }, { status: 400 });
    }

    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for') || reqHeaders.get('x-real-ip') || 'unknown';
    
    // IP Bazlı Bot Kalkanı: Aynı kullanıcı, aynı sayfayı izole bir 30 saniye boyunca art arda tetikleyemez
    const cacheKey = `${ip}_${table}_${id}`;
    const lastHit = viewCache.get(cacheKey);
    const now = Date.now();
    
    if (lastHit && now - lastHit < 30000) {
      return NextResponse.json({ message: 'Rate limited (Ignored)' }, { status: 429 });
    }
    
    viewCache.set(cacheKey, now);

    // Güvenli Server-Side RPC Tetikleyicisi
    await trackUserViewDal(table, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track View API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
