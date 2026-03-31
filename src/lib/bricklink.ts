import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

/**
 * BrickLink API'sinden o günkü ortalama satış değerini çeker.
 * BrickLink eşsiz ID yapısına göre hem MINIFIG hem SET kategorisinde sorgu dener.
 */
export async function getBrickLinkPrice(itemNo: string): Promise<number | null> {
    const consumerKey = process.env.BRICKLINK_CONSUMER_KEY;
    const consumerSecret = process.env.BRICKLINK_CONSUMER_SECRET;
    const tokenValue = process.env.BRICKLINK_TOKEN_VALUE;
    const tokenSecret = process.env.BRICKLINK_TOKEN_SECRET;

    if (!consumerKey || !consumerSecret || !tokenValue || !tokenSecret) {
        throw new Error('BrickLink API keys are heavily required in .env.local to access live Wall Street prices.');
    }

    const oauth = new OAuth({
        consumer: { key: consumerKey, secret: consumerSecret },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
            return crypto.createHmac('sha1', key).update(base_string).digest('base64');
        },
    });

    const token = {
        key: tokenValue,
        secret: tokenSecret,
    };

    // BrickLink, figürler için (MINIFIG) ve CMF paketleri için (SET) iki farklı kategori sunar.
    const tryFetch = async (type: string) => {
        const url = `https://api.bricklink.com/api/store/v1/items/${type}/${itemNo}/price?guide_type=sold&new_or_used=U`;
        const request_data = { url, method: 'GET' };
        const headers = oauth.toHeader(oauth.authorize(request_data, token)) as unknown as Record<string, string>;

        const res = await fetch(url, { method: 'GET', headers, next: { revalidate: 3600 } });
        if (!res.ok) return null;
        
        const json = await res.json();
        // BrickLink yapısında meta.code 200 ise başarılı demektir.
        if (json.meta && json.meta.code === 200 && json.data) {
            // "avg_price" doğrudan kullanılmış (U) geçmiş satışlarının gerçek ortalamasıdır.
            return json.data.avg_price ? parseFloat(json.data.avg_price) : null;
        }
        return null;
    };

    // 1. Önce Minifig olarak dene (Örn: col015)
    let price = await tryFetch('MINIFIG');
    
    // 2. Bulamazsa Set olarak dene (Örn: 8683-1 CMF paketleri aslında set'tir)
    if (!price) {
        price = await tryFetch('SET');
    }

    return price;
}
