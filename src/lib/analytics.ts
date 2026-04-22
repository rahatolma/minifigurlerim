import posthog from 'posthog-js';

// --- Event Dictionary ---
type AnalyticsEvent = 
  | 'view_figure' 
  | 'add_to_collection' 
  | 'remove_from_collection' 
  | 'add_to_watchlist' 
  | 'remove_from_watchlist' 
  | 'click_marketplace' 
  | 'click_similar_figure';

// --- Standard Property Contracts ---
export interface FigureTrackingProps {
  figure_id: string;
  figure_slug: string;
  series_id: string;
  series_slug: string;
  locale: string;
  source_area: 'figure_detail' | 'similar_figures' | 'market_block';
}

export interface MarketplaceTrackingProps extends FigureTrackingProps {
  marketplace: string;
}

// --- Best-Effort Client-Side Deduplication ---
// Kullanıcının aynı figürü kısa süre içinde peş peşe görüntülemesini/tıklamasını (F5 Spam dahil) engelleyerek spam oluşturmasını önler.
const DEDUP_WINDOW_MS = 10000; // 10 saniye içinde aynı event aynı payload ile tekrar gönderilemez.

function isDuplicate(eventName: AnalyticsEvent, dedupKey: string): boolean {
    const key = `posthog_dedup_${eventName}_${dedupKey}`;
    const now = Date.now();
    
    if (typeof window === 'undefined') return false; // Sadece client'ta çalışır

    try {
        const lastFiredStr = sessionStorage.getItem(key);
        if (lastFiredStr) {
            const lastFired = parseInt(lastFiredStr, 10);
            if (now - lastFired < DEDUP_WINDOW_MS) {
                return true; // Duplicate caught (Session bazlı)
            }
        }
        
        sessionStorage.setItem(key, now.toString());
    } catch (e) {
        // sessionStorage kullanılamıyorsa (örn. gizli sekme sınırları) dedup yapılamaz, evente izin ver
        console.error('[Analytics] SessionStorage not available for deduplication', e);
    }
    
    return false;
}

// --- Tracking Helpers ---

export const trackViewFigure = (props: FigureTrackingProps, posthogInstance?: any) => {
    // Dedup key: figure_id (Bir figür bir defa detay sayfası açıldığında sayılır)
    if (isDuplicate('view_figure', props.figure_id)) {
        console.debug('[Analytics] Deduplicated: view_figure', props.figure_id);
        return;
    }
    
    console.log('[Analytics] Fired: view_figure', props);
    const ph = posthogInstance || posthog;
    ph.capture('view_figure', { ...props });
};

export const trackAddToCollection = (props: FigureTrackingProps) => {
    console.log('[Analytics] Fired: add_to_collection', props);
    posthog.capture('add_to_collection', { ...props });
};

export const trackRemoveFromCollection = (props: FigureTrackingProps) => {
    console.log('[Analytics] Fired: remove_from_collection', props);
    posthog.capture('remove_from_collection', { ...props });
};

export const trackAddToWatchlist = (props: FigureTrackingProps) => {
    console.log('[Analytics] Fired: add_to_watchlist', props);
    posthog.capture('add_to_watchlist', { ...props });
};

export const trackRemoveFromWatchlist = (props: FigureTrackingProps) => {
    console.log('[Analytics] Fired: remove_from_watchlist', props);
    posthog.capture('remove_from_watchlist', { ...props });
};

export const trackClickMarketplace = (props: MarketplaceTrackingProps) => {
    if (isDuplicate('click_marketplace', `${props.figure_id}_${props.marketplace}`)) {
        console.debug('[Analytics] Deduplicated: click_marketplace', props.marketplace);
        return;
    }
    console.log('[Analytics] Fired: click_marketplace', props);
    posthog.capture('click_marketplace', { ...props });
};

export const trackClickSimilarFigure = (props: FigureTrackingProps) => {
    console.log('[Analytics] Fired: click_similar_figure', props);
    posthog.capture('click_similar_figure', { ...props });
};
