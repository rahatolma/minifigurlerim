import { cache } from 'react';

// Çevre değişkenleri
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_API_HOST = 'https://eu.i.posthog.com';

/**
 * Temel HogQL İstek Atıcı Helper Fonksiyonu
 */
async function fetchHogQL(query: string) {
    if (!POSTHOG_PROJECT_ID || !POSTHOG_PERSONAL_API_KEY) {
        console.warn('[Analytics Service] POSTHOG_PROJECT_ID veya POSTHOG_PERSONAL_API_KEY eksik.');
        return [];
    }

    try {
        const url = `${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: {
                    kind: 'HogQLQuery',
                    query: query
                }
            }),
            next: { revalidate: 3600 } // 1 saat önbellek (Performans için)
        });

        if (!response.ok) {
            console.error('[Analytics Service] PostHog API Hatası:', response.statusText);
            return [];
        }

        const data = await response.json();
        
        // PostHog query response formatı: { columns: [...], results: [ [...] ] }
        if (data.results && Array.isArray(data.results)) {
            // Sütun isimleri ile sonuçları eşleştirip temiz JSON objeleri döndürelim
            const columns = data.columns || [];
            return data.results.map((row: any[]) => {
                const obj: Record<string, any> = {};
                columns.forEach((col: string, index: number) => {
                    obj[col] = row[index];
                });
                return obj;
            });
        }
        
        return [];
    } catch (error) {
        console.error('[Analytics Service] Ağ hatası:', error);
        return [];
    }
}

/**
 * 1. Top Viewed Figures
 * En çok bakılan figürleri getirir.
 */
export const getTopViewedFigures = cache(async (days: number = 7, limit: number = 10) => {
    const query = `
        SELECT 
            properties.figure_slug AS figure_slug,
            count() AS view_count
        FROM events 
        WHERE event = 'view_figure' 
          AND timestamp >= now() - INTERVAL ${days} DAY 
          AND properties.figure_slug IS NOT NULL
        GROUP BY properties.figure_slug 
        ORDER BY view_count DESC 
        LIMIT ${limit}
    `;
    return await fetchHogQL(query);
});

/**
 * 2. Most Added to Collection
 * En çok koleksiyona eklenen (veya wishliste) figürleri getirir.
 */
export const getMostAddedToCollection = cache(async (days: number = 7, limit: number = 10) => {
    const query = `
        SELECT 
            properties.figure_slug AS figure_slug,
            count() AS add_count
        FROM events 
        WHERE event = 'add_to_collection' 
          AND timestamp >= now() - INTERVAL ${days} DAY 
          AND properties.figure_slug IS NOT NULL
        GROUP BY properties.figure_slug 
        ORDER BY add_count DESC 
        LIMIT ${limit}
    `;
    return await fetchHogQL(query);
});

/**
 * 3. Marketplace Clicks
 * Pazar yeri linklerine tıklanma sayısını getirir.
 */
export const getMarketplaceClicks = cache(async (days: number = 7, limit: number = 10) => {
    const query = `
        SELECT 
            properties.marketplace AS marketplace,
            count() AS click_count
        FROM events 
        WHERE event = 'click_marketplace' 
          AND timestamp >= now() - INTERVAL ${days} DAY 
          AND properties.marketplace IS NOT NULL
        GROUP BY properties.marketplace 
        ORDER BY click_count DESC 
        LIMIT ${limit}
    `;
    return await fetchHogQL(query);
});

/**
 * 4. Interest -> Action Funnel (Gelecek Kullanım İçin Stub)
 * Funnel hesaplamaları HogQL ile çok daha karmaşık olduğu için veya 
 * PostHog'un Funnel Trend API'si kullanılabileceği için şu an raw data çeker.
 */
export const getFunnelStats = cache(async (days: number = 7) => {
    // Burada toplam olay sayılarını çekip basit bir oranlama yapılabilir
    const query = `
        SELECT 
            event,
            count() AS total_count
        FROM events 
        WHERE event IN ('view_figure', 'add_to_collection', 'click_marketplace')
          AND timestamp >= now() - INTERVAL ${days} DAY 
        GROUP BY event
        ORDER BY total_count DESC
    `;
    return await fetchHogQL(query);
});
