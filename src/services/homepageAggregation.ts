import * as Sentry from '@sentry/nextjs';
import { getHomeSliders, getLatestSeries, getLatestFigures, getTopDemandedFigures, getTopValuedFigures, getLatestNews, getPreviewFiguresForSeries } from '@/services/dal';
import { unstable_rethrow } from 'next/navigation';
import { mapFigureForCard, FigureCardData } from '@/utils/figureMapper';

export interface HomepageDataShape {
  activeSliders: any[];
  latestSeries: any[];
  latestFigures: FigureCardData[];
  topDemanded: FigureCardData[];
  topValued: FigureCardData[];
  news: any[];
  seriesFigStats: Record<string, { count: number, latestName: string | null }> | null;
  degradedBlocks: string[];
}

async function safeFetch<T>(
  blockName: string, 
  fetchFn: () => Promise<any>, 
  mapFn?: (data: any) => any, 
  fallback: T = [] as any
): Promise<{ data: T, degraded: boolean }> {
  const t0 = performance.now();
  try {
    const rawData = await fetchFn();
    const t1 = performance.now();
    console.log(`[Homepage Aggregation] ${blockName} timing: ${(t1-t0).toFixed(2)}ms`);
    
    let processedData = rawData;
    if (mapFn && Array.isArray(rawData)) {
      processedData = rawData.map(mapFn).filter(Boolean);
    }
    return { data: processedData as T, degraded: false };
  } catch (err: any) {
    unstable_rethrow(err);
    const t1 = performance.now();
    console.error(`[Homepage Aggregation] ${blockName} failed after ${(t1-t0).toFixed(2)}ms:`, err);
    Sentry.withScope(scope => {
       scope.setTag('area', 'homepage');
       scope.setTag('layer', 'aggregation');
       scope.setTag('block', blockName);
       scope.setTag('severity', 'degraded');
       Sentry.captureException(err);
    });
    return { data: fallback, degraded: true };
  }
}

export const getHomepageData = async (): Promise<HomepageDataShape> => {
  const degradedBlocks: string[] = [];

  const [
    slidersRes,
    seriesRes,
    figuresRes,
    demandedRes,
    valuedRes,
    newsRes,
    previewSeriesRes
  ] = await Promise.all([
    safeFetch('sliders', getHomeSliders),
    safeFetch('latest_series', getLatestSeries),
    safeFetch('latest_figures', getLatestFigures, mapFigureForCard),
    safeFetch('top_demanded', () => getTopDemandedFigures(6), mapFigureForCard),
    safeFetch('top_valued', () => getTopValuedFigures(6), mapFigureForCard),
    safeFetch('news', getLatestNews),
    safeFetch('series_fig_stats', getPreviewFiguresForSeries, undefined, null)
  ]);

  if (slidersRes.degraded) degradedBlocks.push('sliders');
  if (seriesRes.degraded) degradedBlocks.push('latest_series');
  if (figuresRes.degraded) degradedBlocks.push('latest_figures');
  if (demandedRes.degraded) degradedBlocks.push('top_demanded');
  if (valuedRes.degraded) degradedBlocks.push('top_valued');
  if (newsRes.degraded) degradedBlocks.push('news');
  if (previewSeriesRes.degraded) degradedBlocks.push('series_fig_stats');

  // Dedup logic (Demanded in Valued)
  let safeTopValued = valuedRes.data;
  if (!demandedRes.degraded && !valuedRes.degraded) {
    const demandedIds = new Set((demandedRes.data as any[]).map((d: any) => d.id));
    const deduped = (valuedRes.data as any[]).filter((v: any) => !demandedIds.has(v.id)).slice(0, 6);
    safeTopValued = deduped.length >= 2 ? deduped : (valuedRes.data as any[]).slice(0, 6);
  }

  // Convert raw preview to stats dict
  let seriesFigStats: Record<string, { count: number, latestName: string | null }> | null = null;
  if (!previewSeriesRes.degraded && previewSeriesRes.data) {
    seriesFigStats = {};
    (previewSeriesRes.data as any[]).forEach((f: any) => {
        if (!seriesFigStats![f.series_id]) {
            seriesFigStats![f.series_id] = { count: 0, latestName: f.name };
        }
        seriesFigStats![f.series_id].count += 1;
    });
  }

  return {
    activeSliders: (slidersRes.data as any[]) || [],
    latestSeries: (seriesRes.data as any[]) || [],
    latestFigures: (figuresRes.data as FigureCardData[]) || [],
    topDemanded: (demandedRes.data as FigureCardData[]) || [],
    topValued: (safeTopValued as FigureCardData[]) || [],
    news: (newsRes.data as any[]) || [],
    seriesFigStats,
    degradedBlocks
  };
};
