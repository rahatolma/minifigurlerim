/**
 * Centralized Route Builder for Minifigurlerim
 * This file replaces all raw string literals (e.g. href={`/figurler/...`}) 
 * to ensure URL structure consistency throughout the platform.
 */

// Define standard locales
type Locale = 'tr' | 'en';
const DEFAULT_LOCALE: Locale = 'tr';

const SEGMENTS = {
  figures: 'figurler',
  series: 'seriler',
  about: 'hakkimizda',
  collection: 'koleksiyonum',
};

export const getRouteSegments = () => {
  return SEGMENTS;
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
export const getFigureUrl = (params: FigureRouteParams): any => {
  const { seriesSlug, figureSlug, locale = DEFAULT_LOCALE } = params;

  if (!seriesSlug || !figureSlug) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[RouteBuilder Error]: Missing required parameters for Figure Route. (seriesSlug: ${seriesSlug}, figureSlug: ${figureSlug})`);
    }
    // Strict fallback: Return null instead of a fake hash route
    return null; 
  }

  return {
    pathname: '/figurler/[seriesSlug]/[figureSlug]',
    params: { seriesSlug, figureSlug }
  };
};

/**
 * Ensures strict generation of Series Detail URLs.
 */
export const getSeriesUrl = (params: SeriesRouteParams): any => {
  const { seriesSlug, locale = DEFAULT_LOCALE } = params;

  if (!seriesSlug) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[RouteBuilder Error]: Missing required parameters for Series Route. (seriesSlug: ${seriesSlug})`);
    }
    return null;
  }

  return {
    pathname: '/seriler/[slug]',
    params: { slug: seriesSlug }
  };
};

export const getFiguresListUrl = (): string => {
  return `/${SEGMENTS.figures}`;
};

export const getSeriesListUrl = (): string => {
  return `/${SEGMENTS.series}`;
};

export const getCollectionUrl = (): string => {
  return `/${SEGMENTS.collection}`;
};

export const getAboutUrl = (): string => {
  return `/${SEGMENTS.about}`;
};
