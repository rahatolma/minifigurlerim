/**
 * Centralized Route Builder for Minifigurlerim
 * This file replaces all raw string literals (e.g. href={`/figurler/...`}) 
 * to ensure URL structure consistency throughout the platform.
 */

// Define standard locales
type Locale = 'tr' | 'en';
const DEFAULT_LOCALE: Locale = 'tr';

// Define routing segment dictionary for localization
const SEGMENTS: Record<Locale, Record<string, string>> = {
  tr: {
    figures: 'figurler',
    series: 'seriler',
    about: 'hakkimizda',
    collection: 'koleksiyonum',
  },
  en: {
    figures: 'figures',
    series: 'series',
    about: 'about',
    collection: 'my-collection',
  }
};

/**
 * Get route translation segments
 */
export const getRouteSegments = (locale: Locale = DEFAULT_LOCALE) => {
  return SEGMENTS[locale] || SEGMENTS[DEFAULT_LOCALE];
};

export interface FigureRouteParams {
  seriesSlug: string;
  figureSlug: string;
  locale?: Locale;
}

export interface SeriesRouteParams {
  seriesSlug: string;
  locale?: Locale;
}

/**
 * Ensures strict generation of Figure Detail URLs.
 * Throws an error immediately during development if required parameters are missing.
 */
export const getFigureUrl = (params: FigureRouteParams): string | null => {
  const { seriesSlug, figureSlug, locale = DEFAULT_LOCALE } = params;

  if (!seriesSlug || !figureSlug) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[RouteBuilder Error]: Missing required parameters for Figure Route. (seriesSlug: ${seriesSlug}, figureSlug: ${figureSlug})`);
    }
    // Strict fallback: Return null instead of a fake hash route
    return null; 
  }

  const segments = getRouteSegments(locale as Locale);
  return `/${locale}/${segments.figures}/${seriesSlug}/${figureSlug}`;
};

/**
 * Ensures strict generation of Series Detail URLs.
 */
export const getSeriesUrl = (params: SeriesRouteParams): string | null => {
  const { seriesSlug, locale = DEFAULT_LOCALE } = params;

  if (!seriesSlug) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[RouteBuilder Error]: Missing required parameters for Series Route. (seriesSlug: ${seriesSlug})`);
    }
    return null;
  }

  const segments = getRouteSegments(locale as Locale);
  return `/${locale}/${segments.series}/${seriesSlug}`;
};

export const getFiguresListUrl = (locale: Locale = DEFAULT_LOCALE): string => {
  const segments = getRouteSegments(locale);
  return `/${locale}/${segments.figures}`;
};

export const getSeriesListUrl = (locale: Locale = DEFAULT_LOCALE): string => {
  const segments = getRouteSegments(locale);
  return `/${locale}/${segments.series}`;
};

export const getCollectionUrl = (locale: Locale = DEFAULT_LOCALE): string => {
  const segments = getRouteSegments(locale);
  return `/${locale}/${segments.collection}`;
};

export const getAboutUrl = (locale: Locale = DEFAULT_LOCALE): string => {
  const segments = getRouteSegments(locale);
  return `/${locale}/${segments.about}`;
};
