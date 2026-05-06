import posthog from 'posthog-js';

// --- Event Dictionary ---
export type AnalyticsEvent = 
  | 'view_figure' 
  | 'series_view'
  | 'filter_used'
  | 'search_used'
  | 'language_switched'
  | 'cta_clicked'
  | 'login_started'
  | 'signup_started'
  | 'add_to_collection' 
  | 'remove_from_collection' 
  | 'add_to_watchlist' 
  | 'remove_from_watchlist' 
  | 'click_marketplace' 
  | 'click_similar_figure';

// --- Standard Property Contracts ---

// Base payload that every event should try to include
export interface BaseTrackingProps {
  locale: string;
  route: string;
  source_section?: string;
  entity_type?: 'figure' | 'series' | 'page' | 'other';
  entity_id?: string;
  slug?: string;
  series_id?: string;
  figure_id?: string;
}

export interface FigureTrackingProps extends BaseTrackingProps {
  figure_id: string;
  figure_slug: string;
  series_id: string;
  series_slug: string;
}

export interface SeriesTrackingProps extends BaseTrackingProps {
  series_id: string;
  series_slug: string;
}

export interface FilterSearchTrackingProps extends BaseTrackingProps {
  filter_type: string;
  filter_value: string;
  results_count?: number;
}

export interface CtaTrackingProps extends BaseTrackingProps {
  cta_name: string;
  cta_type: 'primary' | 'secondary' | 'link';
}

export interface MarketplaceTrackingProps extends FigureTrackingProps {
  marketplace: string;
}

export interface AuthTrackingProps extends BaseTrackingProps {
  auth_provider?: string;
  auth_type?: 'login' | 'signup';
}

// --- Environment Helpers ---
export const isProductionEnvironment = () => {
  if (typeof window === 'undefined') {
    return false; // Server-context guard: Analytics client-side çalışmalı
  }
  return window.location.hostname === 'minifigurlerim.com' || window.location.hostname === 'www.minifigurlerim.com';
};

export const shouldTrackAnalytics = () => {
    return isProductionEnvironment();
};

// --- Best-Effort Client-Side Deduplication ---
const DEDUP_WINDOW_MS = 10000;

function isDuplicate(eventName: AnalyticsEvent, dedupKey: string): boolean {
    const key = `posthog_dedup_${eventName}_${dedupKey}`;
    const now = Date.now();
    
    if (typeof window === 'undefined') return false;

    try {
        const lastFiredStr = sessionStorage.getItem(key);
        if (lastFiredStr) {
            const lastFired = parseInt(lastFiredStr, 10);
            if (now - lastFired < DEDUP_WINDOW_MS) {
                return true;
            }
        }
        sessionStorage.setItem(key, now.toString());
    } catch (e) {
        console.error('[Analytics] SessionStorage not available for deduplication', e);
    }
    return false;
}

// --- Tracking Helpers ---

export const trackEvent = (eventName: AnalyticsEvent, props: BaseTrackingProps, dedupKey?: string, posthogInstance?: any) => {
    if (!shouldTrackAnalytics()) {
        console.log(`[analytics:debug] event skipped (not production): ${eventName}`, props);
        return;
    }

    const ph = posthogInstance || posthog;
    
    // PostHog initialized mı kontrolü (production bile olsa init edilmemişse patlamaması için)
    if (!ph || !ph.__loaded) {
        console.log(`[analytics:debug] PostHog not initialized, event skipped: ${eventName}`);
        return;
    }

    if (dedupKey && isDuplicate(eventName, dedupKey)) {
        console.debug(`[Analytics] Deduplicated: ${eventName}`, dedupKey);
        return;
    }
    console.log(`[Analytics] Fired: ${eventName}`, props);
    ph.capture(eventName, { ...props });
};

export const trackViewFigure = (props: FigureTrackingProps, posthogInstance?: any) => {
    trackEvent('view_figure', { ...props, entity_type: 'figure', slug: props.figure_slug }, props.figure_id, posthogInstance);
};

export const trackViewSeries = (props: SeriesTrackingProps, posthogInstance?: any) => {
    trackEvent('series_view', { ...props, entity_type: 'series', slug: props.series_slug }, props.series_id, posthogInstance);
};

export const trackFilterUsed = (props: FilterSearchTrackingProps) => {
    trackEvent('filter_used', props, `${props.filter_type}_${props.filter_value}`);
};

export const trackSearchUsed = (props: FilterSearchTrackingProps) => {
    trackEvent('search_used', props, props.filter_value);
};

export const trackLanguageSwitched = (props: BaseTrackingProps & { from_lang: string, to_lang: string }) => {
    trackEvent('language_switched', props);
};

export const trackCtaClicked = (props: CtaTrackingProps) => {
    trackEvent('cta_clicked', props, props.cta_name);
};

export const trackAuthStarted = (props: AuthTrackingProps) => {
    const eventName = props.auth_type === 'login' ? 'login_started' : 'signup_started';
    trackEvent(eventName, props);
};

export const trackAddToCollection = (props: FigureTrackingProps) => {
    trackEvent('add_to_collection', props);
};

export const trackRemoveFromCollection = (props: FigureTrackingProps) => {
    trackEvent('remove_from_collection', props);
};

export const trackAddToWatchlist = (props: FigureTrackingProps) => {
    trackEvent('add_to_watchlist', props);
};

export const trackRemoveFromWatchlist = (props: FigureTrackingProps) => {
    trackEvent('remove_from_watchlist', props);
};

export const trackClickMarketplace = (props: MarketplaceTrackingProps) => {
    trackEvent('click_marketplace', props, `${props.figure_id}_${props.marketplace}`);
};

export const trackClickSimilarFigure = (props: FigureTrackingProps) => {
    trackEvent('click_similar_figure', props);
};

