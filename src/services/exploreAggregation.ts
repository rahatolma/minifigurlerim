import * as Sentry from '@sentry/nextjs';
import { getAllMinifigures } from '@/services/dal';
import { mapFigureForCard, FigureCardData } from '@/utils/figureMapper';

export interface ExploreDataShape {
  figures: FigureCardData[];
  degradedBlocks: string[];
}

export const getExplorePageData = async (locale: string = 'tr'): Promise<ExploreDataShape> => {
  const degradedBlocks: string[] = [];
  const t0 = performance.now();
  
  let figures: FigureCardData[] = [];

  try {
    const rawData = await getAllMinifigures();
    if (Array.isArray(rawData)) {
      figures = rawData.slice(0, 24).map((row) => mapFigureForCard(row, locale)).filter(Boolean) as FigureCardData[];
    }
  } catch (err: any) {
    const duration = performance.now() - t0;
    console.error(`[Explore Aggregation] block 'explore_figures' failed after ${duration.toFixed(2)}ms:`, err);
    Sentry.withScope(scope => {
       scope.setTag('area', 'explore_page');
       scope.setTag('layer', 'aggregation');
       scope.setTag('block', 'explore_figures');
       scope.setTag('severity', 'degraded');
       Sentry.captureException(err);
    });
    degradedBlocks.push('explore_figures');
  }

  return {
    figures,
    degradedBlocks
  };
};
