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
// Kullanıcının aynı figürü kısa süre içinde peş peşe görüntülemesini/tıklamasını engelleyerek spam oluşturmasını önler.
const EVENT_CACHE = new Map<string, number>();
const DEDUP_WINDOW_MS = 10000; // 10 saniye içinde aynı event aynı payload ile tekrar gönderilemez.

function isDuplicate(eventName: AnalyticsEvent, dedupKey: string): boolean {
    const key = `${eventName}_${dedupKey}`;
    const now = Date.now();
    const lastFired = EVENT_CACHE.get(key);
    
    if (lastFired && (now - lastFired) < DEDUP_WINDOW_MS) {
        return true; // Duplicate caught
    }
    
    EVENT_CACHE.set(key, now);
    return false;
}

// --- Tracking Helpers ---

export const trackViewFigure = (props: FigureTrackingProps) => {
    // Dedup key: figure_id (Bir figür bir defa detay sayfası açıldığında sayılır)
    if (isDuplicate('view_figure', props.figure_id)) {
        console.debug('[Analytics] Deduplicated: view_figure', props.figure_id);
        return;
    }
    
    console.log('[Analytics] Fired: view_figure', props);
    posthog.capture('view_figure', { ...props });
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
