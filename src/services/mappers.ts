import { getLocalizedCategory, getLocalizedRarity } from '@/utils/taxonomy';

export interface SeriesCardViewModel {
  id: string;
  seriesId: string;
  familyLabel: string | null;
  title: string;
  imageUrl: string;
  year: string | number;
  seriesNo: string | null;
  totalFigures: number;
  categoryLabel: string;
  rarityLabel: string;
  latestFigureName?: string | null;
  labels: {
    figures: string; // The translation template with {count} e.g. "12 Figür" or "{count} Figures" wait, the component handles the dynamic number, so maybe pass a function or pre-formatted string.
    completion: string;
    latestAdded: string;
    completeSeries: string;
    noneYet: string;
    loginRequired1: string;
    loginRequired2: string;
    categoryDefault: string;
    defaultImage: string;
    percentTemplate: string;
  }
  targetHref: string;
}

export type TranslatorFn = (key: string, values?: Record<string, any>) => string;

export interface SeriesRow {
  id: string;
  slug?: string;
  slug_en?: string;
  title: string;
  title_en?: string;
  cover_image_url?: string;
  release_year?: string | number;
  created_at?: string;
  series_no?: string;
  figure_count?: number;
  category?: string;
  rarity?: string;
  en_status?: string;
  [key: string]: any;
}

import { getSeriesUrl } from '@/utils/routeBuilder';

export function mapSeriesToCardViewModel(
  series: SeriesRow, 
  locale: string, 
  tTax: TranslatorFn, 
  tCard: TranslatorFn, 
  tCommon: TranslatorFn,
  seriesFigStats?: any
): SeriesCardViewModel {
  const totalFigures = series.figure_count || (seriesFigStats ? seriesFigStats[series.id]?.count : 0) || 0;
  
  const finalId = (locale === 'en' && series.en_status !== 'missing' && series.slug_en) ? series.slug_en : (series.slug || series.id);
  const rawTitle = (locale === 'en' && series.en_status !== 'missing' && series.title_en) ? series.title_en : series.title;

  let familyLabel: string | null = null;
  let finalTitle = rawTitle;

  if (rawTitle) {
    const match = rawTitle.match(/^(?:(?:\d+\.\s*)?LEGO.?\s*(?:Minifigürler|Minifigures)\s*(?:Serisi|Series)?[:\s-]*)/i);
    if (match && rawTitle.length > match[0].length) {
      const rawPrefix = rawTitle.substring(0, match[0].length).trim();
      familyLabel = rawPrefix.replace(/[:-]$/, '').trim();
      let suffix = rawTitle.substring(match[0].length).trim();
      finalTitle = suffix.replace(/^[:-]\s*/, '');
    }
  }

  const realCategory = series.category_main || series.category;

  return {
    id: finalId,
    seriesId: series.id,
    familyLabel,
    title: finalTitle,
    imageUrl: series.cover_image_url || '',
    year: series.release_year || (series.created_at ? new Date(series.created_at).getFullYear() : '2010'),
    seriesNo: series.series_no || null,
    totalFigures,
    categoryLabel: (realCategory && getLocalizedCategory(realCategory, tTax, locale)) || tCard('CategoryDefault'),
    rarityLabel: (series.rarity && getLocalizedRarity(series.rarity, tTax, locale)) || tCommon('Yaygın'),
    latestFigureName: seriesFigStats ? seriesFigStats[series.id]?.latestName : null,
    labels: {
      figures: tCard('Figure'), 
      completion: tCard('Completion'),
      latestAdded: tCard('LatestAdded'),
      completeSeries: tCard('CompleteSeries'),
      noneYet: tCard('NoneYet'),
      loginRequired1: tCard('LoginRequired1'),
      loginRequired2: tCard('LoginRequired2'),
      categoryDefault: tCard('CategoryDefault'),
      defaultImage: locale === 'en' ? '/images/placeholder-en.svg' : '/images/placeholder.svg',
      percentTemplate: locale === 'en' ? '{val}%' : '%{val}',
    },
    targetHref: getSeriesUrl({ seriesSlug: finalId, locale: locale as any })
  };
}
